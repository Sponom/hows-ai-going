import { readFileSync, writeFileSync } from 'node:fs';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const world = JSON.parse(
  readFileSync(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url), 'utf8'),
);
const fc = feature(world, world.objects.countries);
const countries = fc.features.filter((f) => String(f.id) !== '010');

const disputed = JSON.parse(
  readFileSync(new URL('../src/data/disputed-areas.json', import.meta.url), 'utf8'),
);

const projection = geoNaturalEarth1().fitExtent(
  [
    [220, 40],
    [1220, 610],
  ],
  { type: 'FeatureCollection', features: countries },
);
const pathGen = geoPath(projection);

const HIGHLIGHT_BY_ID = {
  '840': '#10b981',
  '124': '#0891b2',
  '076': '#10b981',
  '826': '#10b981',
  '276': '#0891b2',
  '250': '#4f46e5',
  '724': '#0891b2',
  '643': '#10b981',
  '356': '#eab308',
  '410': '#eab308',
  '392': '#10b981',
  '036': '#0891b2',
  '484': '#0891b2',
  '764': '#10b981',
  '620': '#0891b2',
  '032': '#4f46e5',
  '710': '#4f46e5',
};

const countryPaths = countries
  .map((f) => {
    const numId = String(f.id ?? '').padStart(3, '0');
    const color = HIGHLIGHT_BY_ID[numId];
    const d = pathGen(f);
    if (!d) return '';
    return `<path d="${d}" fill="${color || '#152036'}" fill-opacity="${color ? '0.88' : '0.92'}" stroke="#0b1222" stroke-width="0.9" />`;
  })
  .join('\n      ');

const disputedPaths = disputed.features
  .map((f) => {
    const d = pathGen(f);
    if (!d) return '';
    return `<path d="${d}" fill="#182235" stroke="#94a3b8" stroke-opacity="0.7" stroke-width="0.9" stroke-dasharray="3 2" />`;
  })
  .join('\n      ');

const BEACONS = [
  [-122.4, 37.8, '#eab308'],
  [-74.0, 40.7, '#10b981'],
  [-0.1, 51.5, '#10b981'],
  [13.4, 52.5, '#0891b2'],
  [37.6, 55.8, '#10b981'],
  [77.6, 13.0, '#eab308'],
  [100.5, 13.8, '#10b981'],
  [127.0, 37.6, '#eab308'],
  [139.7, 35.7, '#10b981'],
  [-46.6, -23.6, '#10b981'],
  [151.2, -33.9, '#0891b2'],
];

const beaconSvg = BEACONS.map(([lng, lat, col]) => {
  const pt = projection([lng, lat]);
  if (!pt) return '';
  return `<circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="10" fill="${col}" fill-opacity="0.22" />
      <circle cx="${pt[0].toFixed(1)}" cy="${pt[1].toFixed(1)}" r="4.2" fill="${col}" stroke="#ffffff" stroke-width="1.3" />`;
}).join('\n      ');

// Smooth non-overlapping left readability vignette
const leftFadeStrips = Array.from({ length: 140 }, (_, i) => {
  const x = i * 5;
  const t = i / 139;
  const opacity = t < 0.44 ? 0.94 : Math.max(0, 0.94 * Math.pow(1 - (t - 0.44) / 0.56, 1.35));
  return `<rect x="${x}" y="0" width="5" height="630" fill="#070b14" fill-opacity="${opacity.toFixed(3)}" />`;
}).join('\n  ');

function viridisAt(t) {
  const stops = [
    [0, [79, 70, 229]],
    [0.35, [8, 145, 178]],
    [0.7, [16, 185, 129]],
    [1, [234, 179, 8]],
  ];
  const lerp = (a, b, f) => Math.round(a + (b - a) * f);
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return `rgb(${lerp(c0[0], c1[0], f)},${lerp(c0[1], c1[1], f)},${lerp(c0[2], c1[2], f)})`;
    }
  }
  return 'rgb(234,179,8)';
}

const viridisBarRects = Array.from({ length: 44 }, (_, i) => {
  const x = 114 + i * 5;
  const col = viridisAt(i / 43);
  return `<rect x="${x}" y="512" width="6" height="12" rx="${i === 0 || i === 43 ? 4 : 0}" fill="${col}" />`;
}).join('\n  ');

// MSVG-safe emblem with explicit stroke-opacity="1" on every stroke path
function renderEmblemInner() {
  return `
    <rect width="64" height="64" rx="16" fill="#0e172a" />
    <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#334155" stroke-opacity="0.9" stroke-width="1.5" />
    <circle cx="44" cy="20" r="14" fill="#10b981" fill-opacity="0.2" />
    <path d="M30 16 A18 18 0 1 0 30 52 A18 18 0 1 0 30 16 Z" fill="none" stroke="#06b6d4" stroke-opacity="1" stroke-width="2.5" stroke-linecap="round" />
    <path d="M30 16 A8.5 18 0 1 0 30 52 A8.5 18 0 1 0 30 16 Z" fill="none" stroke="#10b981" stroke-opacity="1" stroke-width="2.2" stroke-linecap="round" />
    <path d="M12.5 34H47.5" fill="none" stroke="#38bdf8" stroke-opacity="1" stroke-width="2.2" stroke-linecap="round" />
    <path d="M15.8 24.5C20.5 26.8 25.1 27.8 30 27.8C34.9 27.8 39.5 26.8 44.2 24.5" fill="none" stroke="#10b981" stroke-opacity="1" stroke-width="2.1" stroke-linecap="round" />
    <path d="M15.8 43.5C20.5 41.2 25.1 40.2 30 40.2C34.9 40.2 39.5 41.2 44.2 43.5" fill="none" stroke="#6366f1" stroke-opacity="1" stroke-width="2.1" stroke-linecap="round" />
    <path d="M17 16.5C22.5 11.8 30 10 37.5 11.8" fill="none" stroke="#38bdf8" stroke-opacity="0.65" stroke-width="2" stroke-linecap="round" />
    <path d="M44.5 9.5L47.1 17.4L55 20L47.1 22.6L44.5 30.5L41.9 22.6L34 20L41.9 17.4L44.5 9.5Z" fill="#facc15" />
    <circle cx="44.5" cy="20" r="2.2" fill="#fefce8" />
  `;
}

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#080e1c" />
  <g opacity="0.95">
    ${countryPaths}
    ${disputedPaths}
    ${beaconSvg}
  </g>
</svg>
`;

const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <g transform="translate(76, 112) scale(1.42)">
    ${renderEmblemInner()}
  </g>

  <g transform="translate(76, 398)">
    <rect x="0" y="0" width="174" height="40" rx="12" fill="#0f172a" stroke="#334155" stroke-opacity="0.9" stroke-width="1.4" />
    <rect x="188" y="0" width="182" height="40" rx="12" fill="#0f172a" stroke="#334155" stroke-opacity="0.9" stroke-width="1.4" />
    <rect x="384" y="0" width="176" height="40" rx="12" fill="#0f172a" stroke="#334155" stroke-opacity="0.9" stroke-width="1.4" />
  </g>

  ${viridisBarRects}

  <rect x="1" y="1" width="1198" height="628" fill="none" stroke="#1e293b" stroke-opacity="0.8" stroke-width="2" />
</svg>
`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 64 64">
  ${renderEmblemInner()}
</svg>
`;

writeFileSync('/tmp/og-map.svg', ogSvg, 'utf8');
writeFileSync('/tmp/og-fg.svg', fgSvg, 'utf8');
writeFileSync('/tmp/apple-icon.svg', iconSvg, 'utf8');
console.log('Generated /tmp/og-map.svg, /tmp/og-fg.svg, /tmp/apple-icon.svg');
