import { useEffect, useMemo, useRef, useState } from 'react';
import {
  geoNaturalEarth1,
  geoPath,
  type GeoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
} from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { feature } from 'topojson-client';
import { Check, ChevronDown, ChevronsLeftRight, Globe, Minus, Plus } from 'lucide-react';
import { NUMERIC_TO_ALPHA2 } from '../../shared/geo-codes';
import {
  HISTORY_PERIODS,
  type CityStat,
  type CountryStat,
  type HistoryPeriod,
} from '../../shared/types';
import type { MySavedLocation } from '../hooks/useRadar';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  formatVisibleCount,
  getCityDisplayName,
  getCountryName,
  indexToColor,
} from '../utils/format';
import { Tooltip } from './Tooltip';

interface PeriodSummary {
  countries: number;
  aiShare: number | null;
}

interface WorldRadarMapProps {
  countries: CountryStat[];
  cities: CityStat[];
  nowCountries?: CountryStat[];
  nowCities?: CityStat[];
  isHistorical?: boolean;
  splitCompare?: boolean;
  beforePeriod?: HistoryPeriod;
  afterPeriod?: HistoryPeriod;
  beforeSummary?: PeriodSummary;
  afterSummary?: PeriodSummary;
  onChangeBeforePeriod?: (period: HistoryPeriod) => void;
  onChangeAfterPeriod?: (period: HistoryPeriod) => void;
  selectedCountry: string | null;
  selectedCityKey: string | null;
  myLocation: MySavedLocation | null;
  focusTarget: { lat: number; lng: number } | null;
  onSelectCountry: (countryCode: string) => void;
  onSelectCity: (city: CityStat) => void;
  theme: 'dark' | 'light';
  locale: Locale;
  t: Dictionary;
}

interface HoverState {
  x: number;
  y: number;
  title: string;
  flag: string;
  subtitle: string;
  pct: number | null;
  nowPct?: number | null;
  isMine: boolean;
}

const WIDTH = 1040;
const HEIGHT = 520;
const MAX_ZOOM = 24;

interface MapGeometry {
  features: Array<GeoPermissibleObjects & { id?: string | number }>;
  projection: GeoProjection;
  pathGenerator: GeoPath<unknown, GeoPermissibleObjects>;
  featurePaths: Array<{ key: string; alpha2: string | undefined; d: string }>;
  disputedPaths: Array<{ key: string; d: string }>;
}

let cachedMapGeometry: MapGeometry | null = null;
let mapGeometryPromise: Promise<MapGeometry> | null = null;

function loadMapGeometry(): Promise<MapGeometry> {
  if (cachedMapGeometry) return Promise.resolve(cachedMapGeometry);
  if (mapGeometryPromise) return mapGeometryPromise;

  mapGeometryPromise = Promise.all([
    import('world-atlas/countries-50m.json'),
    import('../data/disputed-areas.json'),
  ]).then(([worldAtlasMod, disputedAreasMod]) => {
    const worldAtlas = worldAtlasMod.default;
    const disputedAreas = disputedAreasMod.default;

    const topo = worldAtlas as unknown as Parameters<typeof feature>[0];
    const countriesObj = (
      worldAtlas as unknown as {
        objects: { countries: Parameters<typeof feature>[1] };
      }
    ).objects.countries;
    const fc = feature(topo, countriesObj) as unknown as {
      type: 'FeatureCollection';
      features: Array<GeoPermissibleObjects & { id?: string | number }>;
    };
    const filtered = fc.features.filter((f) => String(f.id) !== '010');

    const proj = geoNaturalEarth1().fitExtent(
      [
        [14, 14],
        [WIDTH - 14, HEIGHT - 14],
      ],
      {
        type: 'FeatureCollection',
        features: filtered,
      } as unknown as GeoPermissibleObjects,
    );
    const pg = geoPath(proj);
    const paths = filtered.map((feat, idx) => {
      const numericId = String(feat.id ?? '').padStart(3, '0');
      return {
        key: `${numericId}-${idx}`,
        alpha2: NUMERIC_TO_ALPHA2[numericId],
        d: pg(feat) ?? '',
      };
    });

    const disputedFc = disputedAreas as unknown as {
      features: Array<GeoPermissibleObjects & { id?: string; properties?: { name?: string } }>;
    };
    const dPaths = disputedFc.features
      .map((feat, idx) => ({
        key: feat.id ?? `disp-${idx}`,
        d: pg(feat) ?? '',
      }))
      .filter((item) => item.d.length > 0);

    cachedMapGeometry = {
      features: filtered,
      projection: proj,
      pathGenerator: pg,
      featurePaths: paths,
      disputedPaths: dPaths,
    };
    return cachedMapGeometry;
  });

  return mapGeometryPromise;
}

function formatPeriodDate(period: HistoryPeriod, locale: Locale): string {
  const d = new Date();
  const monthsBack =
    period === '12m' ? 12 : period === '6m' ? 6 : period === '3m' ? 3 : 0;
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  })
    .format(d)
    .replace(/\s*г\.?$/i, '');
}

function formatCountriesShort(
  n: number,
  locale: Locale,
  template: string,
): string {
  if (locale === 'ru') {
    const mod100 = n % 100;
    const mod10 = n % 10;
    const word =
      mod100 >= 11 && mod100 <= 14
        ? 'стран'
        : mod10 === 1
          ? 'страна'
          : mod10 >= 2 && mod10 <= 4
            ? 'страны'
            : 'стран';
    return `${n} ${word}`;
  }
  if (locale === 'en') {
    return n === 1 ? '1 country' : `${n} countries`;
  }
  return template.replace('{n}', String(n));
}

export function WorldRadarMap({
  countries,
  cities,
  nowCountries,
  nowCities,
  isHistorical = false,
  splitCompare = false,
  beforePeriod = '12m',
  afterPeriod = 'now',
  beforeSummary,
  afterSummary,
  onChangeBeforePeriod,
  onChangeAfterPeriod,
  selectedCountry,
  selectedCityKey,
  myLocation,
  focusTarget,
  onSelectCountry,
  onSelectCity,
  theme,
  locale,
  t,
}: WorldRadarMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const animFrameRef = useRef<number | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<HoverState | null>(null);

  // Split-curtain state (percentage 8..92 of container width)
  const [splitPct, setSplitPct] = useState(50);
  const [draggingSplit, setDraggingSplit] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: WIDTH, h: HEIGHT });
  const [openSideMenu, setOpenSideMenu] = useState<'before' | 'after' | null>(null);
  const leftPillRef = useRef<HTMLDivElement | null>(null);
  const rightPillRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === 'dark';
  const showSplit = Boolean(splitCompare && isHistorical && nowCountries && nowCities);

  // Close split period menus on outside click or Escape
  useEffect(() => {
    if (!openSideMenu) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        leftPillRef.current?.contains(target) ||
        rightPillRef.current?.contains(target)
      ) {
        return;
      }
      setOpenSideMenu(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSideMenu(null);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [openSideMenu]);

  useEffect(() => {
    if (!showSplit) setOpenSideMenu(null);
  }, [showSplit]);

  // Track container dimensions so SVG clipPath aligns to the exact pixel with the HTML divider
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clipSvgX = useMemo(() => {
    const scale = Math.min(containerSize.w / WIDTH, containerSize.h / HEIGHT);
    if (!Number.isFinite(scale) || scale <= 0) return WIDTH / 2;
    const offsetX = (containerSize.w - WIDTH * scale) / 2;
    const screenX = containerSize.w * (splitPct / 100);
    return (screenX - offsetX) / scale;
  }, [containerSize, splitPct]);

  const animateToTransform = (
    target: { x: number; y: number; k: number },
    durationMs = 480,
  ) => {
    if (!svgRef.current || !zoomRef.current) return;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const start = { ...transformRef.current };
    const startTime = performance.now();
    const svgEl = svgRef.current;
    const zoomBehavior = zoomRef.current;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const ease = 1 - Math.pow(1 - progress, 3);

      const x = start.x + (target.x - start.x) * ease;
      const y = start.y + (target.y - start.y) * ease;
      const k = start.k + (target.k - start.k) * ease;

      select(svgEl).call(
        zoomBehavior.transform,
        zoomIdentity.translate(x, y).scale(k),
      );

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryStat>();
    for (const c of countries) map.set(c.countryCode, c);
    return map;
  }, [countries]);

  const nowCountryMap = useMemo(() => {
    const map = new Map<string, CountryStat>();
    for (const c of nowCountries ?? countries) map.set(c.countryCode, c);
    return map;
  }, [nowCountries, countries]);

  const [mapGeometry, setMapGeometry] = useState<MapGeometry | null>(
    () => cachedMapGeometry,
  );

  useEffect(() => {
    if (mapGeometry) return;
    let cancelled = false;
    loadMapGeometry()
      .then((geo) => {
        if (!cancelled) setMapGeometry(geo);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mapGeometry]);

  const features = mapGeometry?.features ?? [];
  const projection = mapGeometry?.projection ?? null;
  const pathGenerator = mapGeometry?.pathGenerator ?? null;
  const featurePaths = mapGeometry?.featurePaths ?? [];
  const disputedPaths = mapGeometry?.disputedPaths ?? [];

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, MAX_ZOOM])
      .translateExtent([
        [-100, -60],
        [WIDTH + 100, HEIGHT + 60],
      ])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        transformRef.current = { x, y, k };
        setTransform({ x, y, k });
      });

    svg.call(behavior);
    zoomRef.current = behavior;

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      svg.on('.zoom', null);
    };
  }, []);

  // Smoothly fly to selected country (or zoom back out when cleared)
  useEffect(() => {
    if (selectedCityKey) return;

    if (!selectedCountry) {
      if (transformRef.current.k > 1.05) {
        animateToTransform({ x: 0, y: 0, k: 1 }, 450);
      }
      return;
    }

    if (!pathGenerator || features.length === 0) return;

    const feat = features.find((f) => {
      const numericId = String(f.id ?? '').padStart(3, '0');
      return NUMERIC_TO_ALPHA2[numericId] === selectedCountry;
    });
    if (!feat) return;

    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feat);
    const dx = x1 - x0;
    const dy = y1 - y0;

    if (dx > WIDTH * 0.55 || !Number.isFinite(dx) || dx <= 0) {
      const [cx, cy] = pathGenerator.centroid(feat);
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
      const k = 2.0;
      animateToTransform(
        { x: WIDTH / 2 - cx * k, y: HEIGHT / 2 - cy * k, k },
        520,
      );
      return;
    }

    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const fitScale = Math.min((WIDTH * 0.45) / dx, (HEIGHT * 0.45) / dy);
    const k = Math.max(1.8, Math.min(14, fitScale));
    const tx = WIDTH / 2 - cx * k;
    const ty = HEIGHT / 2 - cy * k;
    animateToTransform({ x: tx, y: ty, k }, 520);
  }, [selectedCountry, selectedCityKey, features, pathGenerator]);

  // Smoothly fly to focused city / newly submitted location
  useEffect(() => {
    if (!focusTarget || !projection) return;
    const projected = projection([focusTarget.lng, focusTarget.lat]);
    if (!projected) return;
    const [px, py] = projected;
    const k = Math.max(5.0, Math.min(12, transformRef.current.k));
    const tx = WIDTH / 2 - px * k;
    const ty = HEIGHT / 2 - py * k;
    animateToTransform({ x: tx, y: ty, k }, 520);
  }, [focusTarget, projection]);

  const handleZoomBy = (factor: number) => {
    const cur = transformRef.current;
    const nextK = Math.max(1, Math.min(MAX_ZOOM, cur.k * factor));
    const ratio = nextK / cur.k;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const nextX = cx - (cx - cur.x) * ratio;
    const nextY = cy - (cy - cur.y) * ratio;
    animateToTransform({ x: nextX, y: nextY, k: nextK }, 260);
  };

  const handleResetZoom = () => {
    animateToTransform({ x: 0, y: 0, k: 1 }, 420);
  };

  const updatePointerPos = (
    e: React.MouseEvent,
    payload: Omit<HoverState, 'x' | 'y'>,
  ) => {
    setHover({ x: e.clientX, y: e.clientY, ...payload });
  };

  const updateSplitFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.max(8, Math.min(92, pct)));
  };

  const hatchId = isDark ? 'calibrating-hatch-dark' : 'calibrating-hatch-light';
  const disputedHatchId = isDark ? 'disputed-hatch-dark' : 'disputed-hatch-light';

  const getCountryStyle = (alpha2: string | undefined, mapSource: Map<string, CountryStat>) => {
    const stat = alpha2 ? mapSource.get(alpha2) : undefined;
    const isSelected = Boolean(alpha2 && selectedCountry === alpha2);
    const isMyCountry = Boolean(alpha2 && myLocation?.countryCode === alpha2);

    let fill = isDark ? '#121b2d' : '#f8fafc';
    let fillOpacity = 0.96;
    let stroke = isDark ? '#1e2c46' : '#cbd5e1';

    if (stat) {
      if (stat.strength === 1) {
        fill = `url(#${hatchId})`;
        stroke = isDark ? 'rgba(56, 189, 248, 0.4)' : '#60a5fa';
      } else {
        // Color directly by aiUserShare so map fill matches the exact % shown in sidebar & tooltips
        fill = indexToColor(stat.aiUserShare);
        fillOpacity = isDark
          ? stat.strength === 2
            ? 0.82
            : 0.94
          : stat.strength === 2
            ? 0.86
            : 0.95;
        stroke = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.2)';
      }
    }

    if (isMyCountry && !myLocation?.cityName) {
      stroke = '#facc15';
    }

    if (isSelected) {
      stroke = isDark ? '#ffffff' : '#0f172a';
    }

    return { stat, isSelected, isMyCountry, fill, fillOpacity, stroke };
  };

  // Base map layer: in split mode renders "Now" (right side); otherwise renders active period
  const baseCountryMap = showSplit ? nowCountryMap : countryMap;
  const baseCities = showSplit ? (nowCities ?? cities) : cities;

  const renderCityLayer = (cityList: CityStat[], interactive: boolean) => {
    if (!projection) return null;
    return (
      <g pointerEvents={interactive ? undefined : 'none'}>
        {cityList.map((city) => {
          if (city.lat === null || city.lng === null) return null;
          const pt = projection([city.lng, city.lat]);
        if (!pt) return null;
        const [cx, cy] = pt;
        const isSelected = selectedCityKey === city.key;
        const isMyCity = Boolean(
          myLocation?.cityName &&
            myLocation.countryCode === city.countryCode &&
            myLocation.cityName.toLowerCase() === city.cityName.toLowerCase(),
        );
        const baseRadius =
          city.strength === 3 ? 5.6 : city.strength === 2 ? 4.4 : 3.4;
        const pinScale = Math.pow(transform.k, 0.72);
        const r = (isSelected || isMyCity ? baseRadius + 1.8 : baseRadius) / pinScale;
        const color =
          city.strength >= 2 ? indexToColor(city.aiUserShare) : '#38bdf8';

        return (
          <g
            key={`${interactive ? 'base' : 'past'}-${city.key}`}
            transform={`translate(${cx},${cy})`}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={
              interactive
                ? (e) => {
                    e.stopPropagation();
                    onSelectCity(city);
                  }
                : undefined
            }
            onMouseMove={
              interactive
                ? (e) => {
                    e.stopPropagation();
                    const visibleCount = formatVisibleCount(
                      city.count,
                      locale,
                      t.votesCount,
                    );
                    const subtitle =
                      city.strength === 1
                        ? `${getCountryName(city.countryCode, locale)} · ${t.legendCalibrating}`
                        : `${getCountryName(city.countryCode, locale)} · ${visibleCount ?? t.signalStrengthLabels[city.strength]}`;
                    updatePointerPos(e, {
                      title: getCityDisplayName(
                        city.cityName,
                        city.countryCode,
                        locale,
                      ),
                      flag: countryCodeToFlag(city.countryCode),
                      subtitle,
                      pct: city.strength >= 2 ? city.aiUserShare : null,
                      isMine: isMyCity,
                    });
                  }
                : undefined
            }
            onMouseLeave={interactive ? () => setHover(null) : undefined}
          >
            {isMyCity && (
              <circle
                r={r * 1.9}
                fill="none"
                stroke="#facc15"
                strokeWidth={1.8 / Math.sqrt(transform.k)}
                strokeDasharray={`${2.5 / Math.sqrt(transform.k)} ${2 / Math.sqrt(transform.k)}`}
                pointerEvents="none"
              />
            )}
            {(city.strength >= 2 || isSelected || isMyCity) && (
              <circle
                r={r * 1.25}
                fill="none"
                stroke={isMyCity ? '#facc15' : color}
                strokeWidth={1.3 / Math.sqrt(transform.k)}
                className="beacon-pulse"
                pointerEvents="none"
              />
            )}
            <circle
              r={r}
              fill={color}
              stroke={
                isMyCity
                  ? '#facc15'
                  : isSelected
                    ? isDark
                      ? '#ffffff'
                      : '#0f172a'
                    : isDark
                      ? '#ffffff'
                      : '#0f172a'
              }
              strokeOpacity={isDark || isMyCity || isSelected ? 1 : 0.45}
              strokeWidth={(isMyCity ? 2 : 1.35) / Math.sqrt(transform.k)}
            />
          </g>
        );
      })}
    </g>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full select-none overflow-hidden ${
        isDark ? 'radar-bg-dark' : 'radar-bg-light'
      }`}
    >
      {!mapGeometry && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#0d1526]/90 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
            <span>{t.mapLoading}</span>
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t.a11yMapLabel}
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="calibrating-hatch-dark"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(45) scale(${1 / Math.sqrt(transform.k)})`}
          >
            <rect width="7" height="7" fill="#17243b" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeOpacity="0.3"
            />
          </pattern>
          <pattern
            id="calibrating-hatch-light"
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(45) scale(${1 / Math.sqrt(transform.k)})`}
          >
            <rect width="7" height="7" fill="#eff6ff" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="7"
              stroke="#3b82f6"
              strokeWidth="1.6"
              strokeOpacity="0.38"
            />
          </pattern>
          <pattern
            id="disputed-hatch-dark"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(-45) scale(${1 / Math.sqrt(transform.k)})`}
          >
            <rect width="6" height="6" fill="#182235" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeOpacity="0.32"
            />
          </pattern>
          <pattern
            id="disputed-hatch-light"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(-45) scale(${1 / Math.sqrt(transform.k)})`}
          >
            <rect width="6" height="6" fill="#e2e8f0" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="#64748b"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
          </pattern>
          {showSplit && (
            <clipPath id="map-split-before">
              <rect
                x={-5000}
                y={-5000}
                width={Math.max(0, clipSvgX + 5000)}
                height={10000}
              />
            </clipPath>
          )}
        </defs>

        {/* Primary interactive layer (Now in split mode, or Active Period in timeline mode) */}
        <g
          transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
        >
          <g>
            {featurePaths.map(({ key, alpha2, d }) => {
              const { stat, isSelected, isMyCountry, fill, fillOpacity, stroke } =
                getCountryStyle(alpha2, baseCountryMap);
              const pastStat = alpha2 ? countryMap.get(alpha2) : undefined;
              const nowStat = alpha2 ? nowCountryMap.get(alpha2) : undefined;

              return (
                <path
                  key={key}
                  d={d}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={stroke}
                  strokeWidth={
                    (isSelected
                      ? 1.8
                      : isMyCountry && !myLocation?.cityName
                        ? 1.4
                        : 0.75) / transform.k
                  }
                  className="transition-[fill,fill-opacity] duration-300 hover:brightness-110"
                  style={{ cursor: alpha2 ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (alpha2) onSelectCountry(alpha2);
                  }}
                  onMouseMove={(e) => {
                    if (!alpha2) return;
                    const name = getCountryName(alpha2, locale);
                    const displayStat = isHistorical ? pastStat : stat;
                    const strength = displayStat?.strength ?? 0;
                    const visibleCount = displayStat
                      ? formatVisibleCount(displayStat.count, locale, t.votesCount)
                      : null;
                    const subtitle =
                      strength === 0
                        ? t.legendNoSignal
                        : strength === 1
                          ? t.legendCalibrating
                          : visibleCount ?? t.signalStrengthLabels[strength];

                    updatePointerPos(e, {
                      title: name,
                      flag: countryCodeToFlag(alpha2),
                      subtitle,
                      pct:
                        displayStat && displayStat.strength >= 2
                          ? displayStat.aiUserShare
                          : null,
                      nowPct:
                        isHistorical && nowStat && nowStat.strength >= 2
                          ? nowStat.aiUserShare
                          : null,
                      isMine: isMyCountry,
                    });
                  }}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </g>

          {/* Neutral disputed territories overlay (dashed borders, never colored as either claimant) */}
          <g>
            {disputedPaths.map(({ key, d }) => (
              <path
                key={key}
                d={d}
                fill={`url(#${disputedHatchId})`}
                stroke={isDark ? '#94a3b8' : '#64748b'}
                strokeOpacity={isDark ? 0.65 : 0.7}
                strokeWidth={0.9 / transform.k}
                strokeDasharray={`${2.6 / transform.k} ${2 / transform.k}`}
                style={{ cursor: 'default' }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  updatePointerPos(e, {
                    title: t.disputedTerritory,
                    flag: '🗺️',
                    subtitle: '',
                    pct: null,
                    isMine: false,
                  });
                }}
                onMouseLeave={() => setHover(null)}
              />
            ))}
          </g>

          {!showSplit && renderCityLayer(baseCities, true)}
        </g>

        {/* Visual Before/After Split-Curtain Left Overlay ("Before" state — country fills only, no city dots) */}
        {showSplit && (
          <g clipPath="url(#map-split-before)" pointerEvents="none">
            <g
              transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
            >
              <g>
                {featurePaths.map(({ key, alpha2, d }) => {
                  const { isSelected, isMyCountry, fill, fillOpacity, stroke } =
                    getCountryStyle(alpha2, countryMap);
                  return (
                    <path
                      key={`past-${key}`}
                      d={d}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={stroke}
                      strokeWidth={
                        (isSelected
                          ? 1.8
                          : isMyCountry && !myLocation?.cityName
                            ? 1.4
                            : 0.75) / transform.k
                      }
                    />
                  );
                })}
              </g>
              <g>
                {disputedPaths.map(({ key, d }) => (
                  <path
                    key={`past-${key}`}
                    d={d}
                    fill={`url(#${disputedHatchId})`}
                    stroke={isDark ? '#94a3b8' : '#64748b'}
                    strokeOpacity={isDark ? 0.65 : 0.7}
                    strokeWidth={0.9 / transform.k}
                    strokeDasharray={`${2.6 / transform.k} ${2 / transform.k}`}
                  />
                ))}
              </g>
            </g>
          </g>
        )}
      </svg>

      {/* Visual Before/After Split Curtain Divider & Handle-Attached Period Selectors */}
      {showSplit && (() => {
        const dividerPx = containerSize.w * (splitPct / 100);
        const leftWidth = leftPillRef.current?.offsetWidth || 120;
        const rightWidth = rightPillRef.current?.offsetWidth || 120;
        const hideLeftPill =
          openSideMenu !== 'before' && dividerPx < 28 + leftWidth + 12;
        const hideRightPill =
          openSideMenu !== 'after' &&
          dividerPx > containerSize.w - (28 + rightWidth + 12);

        const beforeIndex = HISTORY_PERIODS.indexOf(beforePeriod);
        const afterIndex = HISTORY_PERIODS.indexOf(afterPeriod);
        const beforeOptions: HistoryPeriod[] = ['12m', '6m', '3m'];
        const afterOptions: HistoryPeriod[] = ['6m', '3m', 'now'];

        return (
          <>
            {/* Draggable vertical curtain divider */}
            <div
              role="slider"
              tabIndex={0}
              aria-label={t.timelineSplitHint}
              aria-valuemin={8}
              aria-valuemax={92}
              aria-valuenow={Math.round(splitPct)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setSplitPct((v) => Math.max(8, v - 4));
                if (e.key === 'ArrowRight') setSplitPct((v) => Math.min(92, v + 4));
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setOpenSideMenu(null);
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                setDraggingSplit(true);
                updateSplitFromClientX(e.clientX);
              }}
              onPointerMove={(e) => {
                if (!draggingSplit) return;
                e.stopPropagation();
                updateSplitFromClientX(e.clientX);
              }}
              onPointerUp={(e) => {
                if (!draggingSplit) return;
                e.stopPropagation();
                setDraggingSplit(false);
              }}
              onPointerCancel={() => setDraggingSplit(false)}
              style={{ left: `${splitPct}%` }}
              className="group absolute inset-y-0 z-10 -ml-4 flex w-8 cursor-ew-resize touch-none items-center justify-center"
            >
              {/* Subtle vertical hairline */}
              <div className="h-full w-px bg-slate-500/55 shadow-[0_0_6px_rgba(15,23,42,0.2)] dark:bg-white/35 dark:shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
              {/* Calm frosted center drag handle */}
              <div
                className={`absolute flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/90 bg-white/95 text-slate-600 shadow-md backdrop-blur-md transition-transform dark:border-slate-600/90 dark:bg-[#0f172a]/95 dark:text-slate-200 ${
                  draggingSplit ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <ChevronsLeftRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>

            {/* Period selectors anchored right alongside the drag handle */}
            <div
              style={{ left: `${splitPct}%` }}
              className="pointer-events-none absolute top-1/2 z-20 -translate-y-1/2"
            >
              {/* Left "Before" selector */}
              <div
                ref={leftPillRef}
                className={`absolute right-[26px] top-1/2 flex -translate-y-1/2 flex-col items-end transition-opacity duration-150 ${
                  hideLeftPill
                    ? 'pointer-events-none opacity-0'
                    : draggingSplit
                      ? 'pointer-events-none opacity-65'
                      : 'pointer-events-auto opacity-100'
                }`}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSideMenu((cur) => (cur === 'before' ? null : 'before'))
                    }
                    aria-haspopup="listbox"
                    aria-expanded={openSideMenu === 'before'}
                    className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-xl border border-slate-300/90 bg-white/95 px-2.5 text-xs font-bold text-slate-700 shadow-md backdrop-blur-md transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800/95"
                  >
                    <span>{formatPeriodDate(beforePeriod, locale)}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                        openSideMenu === 'before' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSideMenu === 'before' && (
                    <div
                      role="listbox"
                      className="absolute right-0 top-full z-30 mt-1.5 w-52 space-y-0.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#0d1424]"
                    >
                      {beforeOptions.map((opt) => {
                        const optIdx = HISTORY_PERIODS.indexOf(opt);
                        const disabled = optIdx >= afterIndex;
                        const selected = opt === beforePeriod;
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            disabled={disabled}
                            onClick={() => {
                              onChangeBeforePeriod?.(opt);
                              setOpenSideMenu(null);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                              selected
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                : disabled
                                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <span className="truncate">{t.periodLabels[opt]}</span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <span className="text-[11px] font-normal opacity-60">
                                {formatPeriodDate(opt, locale)}
                              </span>
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {beforeSummary && (
                  <div
                    className={`pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded-lg bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-slate-600 shadow-xs backdrop-blur-sm transition-opacity duration-150 dark:bg-[#0d1526]/85 dark:text-slate-300 ${
                      draggingSplit || openSideMenu === 'before'
                        ? 'opacity-0'
                        : 'opacity-100'
                    }`}
                  >
                    <span className="num-tabular">
                      {formatCountriesShort(
                        beforeSummary.countries,
                        locale,
                        t.timelineCountriesShort,
                      )}
                    </span>
                    {beforeSummary.aiShare !== null && (
                      <>
                        <span className="mx-1.5 opacity-40">·</span>
                        <span
                          className="num-tabular font-bold"
                          style={{ color: indexToColor(beforeSummary.aiShare) }}
                        >
                          {t.timelineAiShort.replace(
                            '{pct}',
                            String(beforeSummary.aiShare),
                          )}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Right "After" selector */}
              <div
                ref={rightPillRef}
                className={`absolute left-[26px] top-1/2 flex -translate-y-1/2 flex-col items-start transition-opacity duration-150 ${
                  hideRightPill
                    ? 'pointer-events-none opacity-0'
                    : draggingSplit
                      ? 'pointer-events-none opacity-65'
                      : 'pointer-events-auto opacity-100'
                }`}
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSideMenu((cur) => (cur === 'after' ? null : 'after'))
                    }
                    aria-haspopup="listbox"
                    aria-expanded={openSideMenu === 'after'}
                    className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-xl border border-sky-400/60 bg-sky-50/95 px-2.5 text-xs font-bold text-sky-950 shadow-md backdrop-blur-md transition hover:border-sky-500 hover:bg-sky-100/95 dark:border-sky-500/45 dark:bg-sky-950/90 dark:text-sky-100 dark:hover:border-sky-400 dark:hover:bg-sky-900/95"
                  >
                    {afterPeriod === 'now' && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden="true"
                      />
                    )}
                    <span>{formatPeriodDate(afterPeriod, locale)}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 text-sky-500/80 transition-transform duration-150 ${
                        openSideMenu === 'after' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSideMenu === 'after' && (
                    <div
                      role="listbox"
                      className="absolute left-0 top-full z-30 mt-1.5 w-52 space-y-0.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-[#0d1424]"
                    >
                      {afterOptions.map((opt) => {
                        const optIdx = HISTORY_PERIODS.indexOf(opt);
                        const disabled = optIdx <= beforeIndex;
                        const selected = opt === afterPeriod;
                        return (
                          <button
                            key={opt}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            disabled={disabled}
                            onClick={() => {
                              onChangeAfterPeriod?.(opt);
                              setOpenSideMenu(null);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                              selected
                                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                : disabled
                                  ? 'cursor-not-allowed text-slate-300 dark:text-slate-600'
                                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <span className="truncate">{t.periodLabels[opt]}</span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <span className="text-[11px] font-normal opacity-60">
                                {formatPeriodDate(opt, locale)}
                              </span>
                              {selected && <Check className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {afterSummary && (
                  <div
                    className={`pointer-events-none absolute left-0 top-full mt-1 whitespace-nowrap rounded-lg bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-slate-600 shadow-xs backdrop-blur-sm transition-opacity duration-150 dark:bg-[#0d1526]/85 dark:text-slate-300 ${
                      draggingSplit || openSideMenu === 'after'
                        ? 'opacity-0'
                        : 'opacity-100'
                    }`}
                  >
                    <span className="num-tabular">
                      {formatCountriesShort(
                        afterSummary.countries,
                        locale,
                        t.timelineCountriesShort,
                      )}
                    </span>
                    {afterSummary.aiShare !== null && (
                      <>
                        <span className="mx-1.5 opacity-40">·</span>
                        <span
                          className="num-tabular font-bold"
                          style={{ color: indexToColor(afterSummary.aiShare) }}
                        >
                          {t.timelineAiShort.replace(
                            '{pct}',
                            String(afterSummary.aiShare),
                          )}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* Bottom-right Zoom Controls (unified h-9 w-9 rounded-xl with accessible tooltips) */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-1.5">
        <Tooltip label={t.mapZoomIn} side="left">
          <button
            type="button"
            onClick={() => handleZoomBy(1.65)}
            disabled={transform.k >= MAX_ZOOM - 0.05}
            aria-label={t.mapZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-100 active:scale-95 disabled:cursor-default disabled:opacity-40 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </Tooltip>
        <Tooltip label={t.mapZoomOut} side="left">
          <button
            type="button"
            onClick={() => handleZoomBy(1 / 1.65)}
            disabled={transform.k <= 1.01}
            aria-label={t.mapZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-100 active:scale-95 disabled:cursor-default disabled:opacity-40 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <Minus className="h-4 w-4" aria-hidden="true" />
          </button>
        </Tooltip>
        <Tooltip label={t.mapReset} side="left">
          <button
            type="button"
            onClick={handleResetZoom}
            disabled={
              transform.k <= 1.01 &&
              Math.abs(transform.x) < 2 &&
              Math.abs(transform.y) < 2
            }
            aria-label={t.mapReset}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-100 active:scale-95 disabled:cursor-default disabled:opacity-40 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>

      {/* Floating Hover Tooltip (desktop) */}
      {hover && !draggingSplit && (
        <div
          className="pointer-events-none fixed z-40 hidden max-w-xs rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-[#0d1424]/95 sm:block"
          style={{
            left: Math.min(window.innerWidth - 260, hover.x + 16),
            top: Math.max(72, hover.y - 16),
          }}
        >
          <div className="flex items-center justify-between gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <span className="text-base">{hover.flag}</span>
              <span>{hover.title}</span>
            </span>
            {hover.isMine && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-400/20 dark:text-amber-300">
                {t.myLocationBadge}
              </span>
            )}
          </div>
          {hover.pct !== null && (
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span
                className="num-tabular text-xl font-extrabold"
                style={{ color: indexToColor(hover.pct) }}
              >
                {hover.pct}%
              </span>
              {isHistorical &&
                hover.nowPct !== null &&
                hover.nowPct !== undefined && (
                  <span className="num-tabular inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>→</span>
                    <span
                      className="font-extrabold"
                      style={{ color: indexToColor(hover.nowPct) }}
                    >
                      {hover.nowPct}%
                    </span>
                    {hover.nowPct !== hover.pct && (
                      <span
                        className={`rounded px-1 py-0.5 text-[10px] font-extrabold ${
                          hover.nowPct > hover.pct
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {hover.nowPct > hover.pct
                          ? `+${hover.nowPct - hover.pct}%`
                          : `${hover.nowPct - hover.pct}%`}
                      </span>
                    )}
                  </span>
                )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.panelUsingAi}
              </span>
            </div>
          )}
          {hover.pct === null &&
            isHistorical &&
            hover.nowPct !== null &&
            hover.nowPct !== undefined && (
              <div className="mt-1 flex items-baseline gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{t.timelineAfter}:</span>
                <span
                  className="num-tabular text-sm font-extrabold"
                  style={{ color: indexToColor(hover.nowPct) }}
                >
                  {hover.nowPct}%
                </span>
              </div>
            )}
          {hover.subtitle && (
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {hover.subtitle}
            </div>
          )}
          {hover.isMine && (
            <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              {t.myLocationOnlyYou}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
