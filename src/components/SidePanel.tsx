import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Globe2,
  MapPin,
  Search,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { APP_CONFIG } from '../../shared/config';
import { NUMERIC_TO_ALPHA2 } from '../../shared/geo-codes';
import {
  ROLE_ICONS,
  SYMPTOM_ICONS,
  type RoleId,
  type SymptomId,
} from '../../shared/taxonomy';
import type {
  CityStat,
  CountryStat,
  RadarSnapshot,
} from '../../shared/types';
import type { MySavedLocation } from '../hooks/useRadar';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  getCityDisplayName,
  getCountryName,
  indexToColor,
} from '../utils/format';
import { Tooltip } from './Tooltip';

interface SidePanelProps {
  snapshot: RadarSnapshot | null;
  loading: boolean;
  hasSubmitted: boolean;
  roleFilter: RoleId | 'all';
  onChangeRoleFilter: (role: RoleId | 'all') => void;
  symptomFilter: SymptomId | 'all';
  onChangeSymptomFilter: (symptom: SymptomId | 'all') => void;
  selectedCountry: string | null;
  selectedCity: CityStat | null;
  myLocation: MySavedLocation | null;
  onSelectCountry: (code: string | null) => void;
  onSelectCity: (city: CityStat | null) => void;
  onOpenSurvey: () => void;
  onSharePlace: (place: { countryCode: string; cityName?: string; aiShare?: number | null }) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  desktopOpen: boolean;
  locale: Locale;
  t: Dictionary;
}

export function SidePanel({
  snapshot,
  loading,
  hasSubmitted,
  roleFilter,
  onChangeRoleFilter,
  symptomFilter,
  onChangeSymptomFilter,
  selectedCountry,
  selectedCity,
  myLocation,
  onSelectCountry,
  onSelectCity,
  onOpenSurvey,
  onSharePlace,
  mobileOpen,
  onCloseMobile,
  desktopOpen,
  locale,
  t,
}: SidePanelProps) {
  const [tab, setTab] = useState<'rankings' | 'roles' | 'cases'>('rankings');
  const [searchQuery, setSearchQuery] = useState('');

  const countryStatMap = useMemo(() => {
    const map = new Map<string, CountryStat>();
    for (const c of snapshot?.countries ?? []) map.set(c.countryCode, c);
    return map;
  }, [snapshot]);

  const allCountriesIndex = useMemo(() => {
    const unique = Array.from(new Set(Object.values(NUMERIC_TO_ALPHA2)));
    return unique
      .filter((code) => code !== 'AQ')
      .map((code) => ({
        code,
        name: getCountryName(code, locale),
        enName: getCountryName(code, 'en'),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchingCountries = allCountriesIndex
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.enName.toLowerCase().includes(q) ||
          c.code.toLowerCase() === q,
      )
      .slice(0, 8)
      .map((c) => ({
        ...c,
        stat: countryStatMap.get(c.code) ?? null,
      }));

    const matchingCities = (snapshot?.cities ?? [])
      .filter((city) => {
        const localName = getCityDisplayName(
          city.cityName,
          city.countryCode,
          locale,
        ).toLowerCase();
        const countryName = getCountryName(city.countryCode, locale).toLowerCase();
        return (
          localName.includes(q) ||
          city.cityName.toLowerCase().includes(q) ||
          countryName.includes(q)
        );
      })
      .slice(0, 8);

    return { countries: matchingCountries, cities: matchingCities };
  }, [searchQuery, allCountriesIndex, countryStatMap, snapshot, locale]);

  const countryStat: CountryStat | null =
    selectedCountry ? countryStatMap.get(selectedCountry) ?? null : null;

  const citiesInSelectedCountry = useMemo(() => {
    if (!selectedCountry || !snapshot) return [];
    return snapshot.cities.filter((c) => c.countryCode === selectedCountry);
  }, [selectedCountry, snapshot]);

  const clearSelection = () => {
    onSelectCountry(null);
    onSelectCity(null);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-x-0 bottom-0 z-40 flex h-[76vh] flex-col overflow-hidden rounded-t-3xl border-t border-slate-200 bg-white/98 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out dark:border-slate-800 dark:bg-[#080d18]/98 lg:static lg:z-20 lg:h-auto lg:shrink-0 lg:translate-y-0 lg:rounded-none lg:border-t-0 lg:shadow-none ${
          mobileOpen
            ? 'translate-y-0'
            : 'pointer-events-none invisible translate-y-full lg:pointer-events-auto lg:visible'
        } ${
          desktopOpen
            ? 'lg:w-[356px] lg:border-r lg:opacity-100'
            : 'lg:pointer-events-none lg:w-0 lg:border-r-0 lg:opacity-0'
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:w-[356px]">
          {/* Clean mobile drag handle (click to dismiss) */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label={t.a11yClose}
            className="flex w-full shrink-0 items-center justify-center pt-2.5 pb-1 lg:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          </button>

          {/* Mode A: Inspecting selected City */}
          {selectedCity ? (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCountry(selectedCity.countryCode)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.panelBackToCountry.replace(
                    '{country}',
                    getCountryName(selectedCity.countryCode, locale),
                  )}
                </button>
                <div className="flex items-center gap-1.5">
                  <Tooltip label={t.sharePlaceTooltip} side="left">
                    <button
                      type="button"
                      onClick={() =>
                        onSharePlace({
                          countryCode: selectedCity.countryCode,
                          cityName: selectedCity.cityName,
                          aiShare:
                            selectedCity.strength >= 2
                              ? selectedCity.aiUserShare
                              : null,
                        })
                      }
                      aria-label={t.sharePlaceTooltip}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-cyan-400/70 hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                    >
                      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </Tooltip>
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    aria-label={t.a11yClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
                    <span>{countryCodeToFlag(selectedCity.countryCode)}</span>
                    <span>
                      {getCityDisplayName(
                        selectedCity.cityName,
                        selectedCity.countryCode,
                        locale,
                      )}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {getCountryName(selectedCity.countryCode, locale)} ·{' '}
                    {t.votesCount.replace('{n}', String(selectedCity.count))}
                  </div>
                </div>
              </div>

              {selectedCity.strength === 1 ? (
                <CalibrationCard
                  current={selectedCity.count}
                  target={APP_CONFIG.thresholds.city.preliminary}
                  t={t}
                  onOpenSurvey={onOpenSurvey}
                />
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {t.panelUsingAi}
                    </span>
                    <span
                      className="num-tabular text-3xl font-extrabold"
                      style={{ color: indexToColor(selectedCity.aiUserShare) }}
                    >
                      {selectedCity.aiUserShare}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${selectedCity.aiUserShare}%`,
                        backgroundColor: indexToColor(selectedCity.aiUserShare),
                      }}
                    />
                  </div>
                  {selectedCity.topSymptom && (
                    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {t.panelTopCases}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {SYMPTOM_ICONS[selectedCity.topSymptom]}{' '}
                        {t.symptomLabels[selectedCity.topSymptom].title}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : selectedCountry ? (
          /* Mode B: Inspecting selected Country (including its cities!) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.panelInspectBack}
              </button>
              <div className="flex items-center gap-1.5">
                <Tooltip label={t.sharePlaceTooltip} side="left">
                  <button
                    type="button"
                    onClick={() =>
                      onSharePlace({
                        countryCode: selectedCountry,
                        aiShare:
                          countryStat && countryStat.strength >= 2
                            ? countryStat.aiUserShare
                            : null,
                      })
                    }
                    aria-label={t.sharePlaceTooltip}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-cyan-400/70 hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </Tooltip>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t.a11yClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
                    <span>{countryCodeToFlag(selectedCountry)}</span>
                    <span>{getCountryName(selectedCountry, locale)}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t.votesCount.replace('{n}', String(countryStat?.count ?? 0))}
                  </div>
                </div>
              </div>

              {!countryStat || countryStat.strength === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-950/50">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.legendNoSignal}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t.panelNeedsMoreSignals.replace(
                      '{n}',
                      String(APP_CONFIG.thresholds.country.preliminary),
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenSurvey}
                    className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105"
                  >
                    {t.ctaReport}
                  </button>
                </div>
              ) : countryStat.strength === 1 ? (
                <CalibrationCard
                  current={countryStat.count}
                  target={APP_CONFIG.thresholds.country.preliminary}
                  t={t}
                  onOpenSurvey={onOpenSurvey}
                />
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {t.panelUsingAi}
                      </span>
                      <span
                        className="num-tabular text-3xl font-extrabold"
                        style={{ color: indexToColor(countryStat.aiUserShare) }}
                      >
                        {countryStat.aiUserShare}%
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${countryStat.aiUserShare}%`,
                          backgroundColor: indexToColor(countryStat.aiUserShare),
                        }}
                      />
                    </div>
                  </div>

                  {countryStat.topSymptoms.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t.panelTopCases}
                      </div>
                      <div className="space-y-1.5">
                        {countryStat.topSymptoms.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80 dark:bg-slate-950/60 dark:text-slate-200 dark:ring-slate-800"
                          >
                            <span className="truncate">
                              {SYMPTOM_ICONS[s.id]} {t.symptomLabels[s.id].title}
                            </span>
                            <span className="num-tabular ml-2 text-slate-400">
                              {s.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {countryStat.topRoles.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t.panelTopRoles}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {countryStat.topRoles.map((r) => (
                          <span
                            key={r.id}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950/80 dark:text-slate-200 dark:ring-slate-800"
                          >
                            {ROLE_ICONS[r.id]} {t.roleLabels[r.id]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Soft nudge inside inspected country when visitor hasn't added themselves yet */}
                  {!hasSubmitted && (
                    <button
                      type="button"
                      onClick={onOpenSurvey}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 px-3.5 py-2.5 text-left text-xs font-bold text-cyan-800 transition hover:from-cyan-500/15 hover:to-emerald-500/15 dark:text-cyan-300"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        <span>{t.panelCompareYourself}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </button>
                  )}
                </div>
              )}

              {/* Cities inside this country */}
              {citiesInSelectedCountry.length > 0 && (
                <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {t.panelCitiesInCountry}
                    </h4>
                    <span className="num-tabular text-xs text-slate-400">
                      {citiesInSelectedCountry.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {citiesInSelectedCountry.map((city) => (
                      <button
                        key={city.key}
                        type="button"
                        onClick={() => onSelectCity(city)}
                        className="group flex w-full items-center justify-between rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-slate-200/80 transition hover:ring-slate-300 dark:bg-slate-950/60 dark:ring-slate-800 dark:hover:bg-slate-900 dark:hover:ring-slate-700"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                              {getCityDisplayName(
                                city.cityName,
                                city.countryCode,
                                locale,
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {t.votesCount.replace('{n}', String(city.count))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {city.strength >= 2 ? (
                            <span
                              className="num-tabular text-sm font-extrabold"
                              style={{ color: indexToColor(city.aiUserShare) }}
                            >
                              {city.aiUserShare}%
                            </span>
                          ) : (
                            <span className="num-tabular rounded-md bg-sky-100 px-1.5 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                              {city.count}/{APP_CONFIG.thresholds.city.preliminary}
                            </span>
                          )}
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mode C: Global Overview Summary + Detailed Tabs & Search */
          <>
            {/* Top Global Summary Card (visible on both desktop sidebar and mobile Stats sheet) */}
            <div className="border-b border-slate-100 px-3.5 pb-3 pt-2 dark:border-slate-800/80 lg:pt-3">
              <div className="mb-2 flex items-center justify-between lg:hidden">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t.mobileListBtn}
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t.a11yClose}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div
                  title={t.summaryCoverageTooltip}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <Globe2 className="h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden="true" />
                    <span className="truncate">{t.summaryCoverageTitle}</span>
                  </div>
                  <div className="num-tabular mt-0.5 text-base font-extrabold leading-tight text-slate-900 dark:text-white">
                    {snapshot ? snapshot.global.countriesReached : '—'}
                    <span className="text-xs font-normal text-slate-400">
                      /{APP_CONFIG.totalCountriesTarget}
                    </span>
                  </div>
                </div>

                <div
                  title={t.summaryUsingAiTooltip}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <Sparkles
                      className="h-3.5 w-3.5 shrink-0"
                      style={{
                        color:
                          snapshot?.global.globalAiUserShare !== null &&
                          snapshot?.global.globalAiUserShare !== undefined
                            ? indexToColor(snapshot.global.globalAiUserShare)
                            : '#0ea5e9',
                      }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{t.summaryUsingAiTitle}</span>
                  </div>
                  <div
                    className="num-tabular mt-0.5 text-base font-extrabold leading-tight"
                    style={{
                      color:
                        snapshot?.global.globalAiUserShare !== null &&
                        snapshot?.global.globalAiUserShare !== undefined
                          ? indexToColor(snapshot.global.globalAiUserShare)
                          : undefined,
                    }}
                  >
                    {snapshot?.global.globalAiUserShare !== null &&
                    snapshot?.global.globalAiUserShare !== undefined
                      ? `${snapshot.global.globalAiUserShare}%`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800/80 lg:px-2">
              <div role="tablist" className="grid flex-1 grid-cols-3 gap-1">
                {(['rankings', 'roles', 'cases'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => setTab(key)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      tab === key
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
                    }`}
                  >
                    {t.panelTabs[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {tab === 'rankings' ? (
                <div className="space-y-4">
                  {/* Search any country or city */}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.panelSearchPlaceholder}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
                    />
                    {searchQuery && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Tooltip label={t.a11yClear} side="left">
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label={t.a11yClear}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  {/* Live search results */}
                  {searchResults ? (
                    <div className="space-y-4">
                      {searchResults.countries.length === 0 &&
                      searchResults.cities.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          {t.panelSearchNoResults}
                        </div>
                      ) : (
                        <>
                          {searchResults.countries.length > 0 && (
                            <div className="space-y-1.5">
                              {searchResults.countries.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    onSelectCountry(c.code);
                                    setSearchQuery('');
                                  }}
                                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                >
                                  <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    <span>{countryCodeToFlag(c.code)}</span>
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  {c.stat && c.stat.strength >= 2 ? (
                                    <span
                                      className="num-tabular text-sm font-extrabold"
                                      style={{ color: indexToColor(c.stat.aiUserShare) }}
                                    >
                                      {c.stat.aiUserShare}%
                                    </span>
                                  ) : c.stat ? (
                                    <span className="num-tabular rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                      {c.stat.count}/{APP_CONFIG.thresholds.country.preliminary}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      {t.legendNoSignal}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {searchResults.cities.length > 0 && (
                            <div>
                              <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                                {t.panelTopCities}
                              </h4>
                              <div className="space-y-1.5">
                                {searchResults.cities.map((city) => (
                                  <button
                                    key={city.key}
                                    type="button"
                                    onClick={() => {
                                      onSelectCity(city);
                                      setSearchQuery('');
                                    }}
                                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/50 px-3.5 py-2 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                  >
                                    <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                                      <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                                      <span className="truncate">
                                        {getCityDisplayName(
                                          city.cityName,
                                          city.countryCode,
                                          locale,
                                        )}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {countryCodeToFlag(city.countryCode)}
                                      </span>
                                    </div>
                                    {city.strength >= 2 ? (
                                      <span
                                        className="num-tabular text-sm font-extrabold"
                                        style={{ color: indexToColor(city.aiUserShare) }}
                                      >
                                        {city.aiUserShare}%
                                      </span>
                                    ) : (
                                      <span className="num-tabular text-xs font-semibold text-sky-600 dark:text-sky-400">
                                        {city.count}/{APP_CONFIG.thresholds.city.preliminary}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : loading && !snapshot ? (
                    <PanelSkeleton />
                  ) : !snapshot || snapshot.global.totalSignals === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-800">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.panelNoDataYet}
                      </p>
                      <button
                        type="button"
                        onClick={onOpenSurvey}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 py-2.5 text-sm font-bold text-white"
                      >
                        {t.ctaReport}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2.5 flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {t.panelTopCountries}
                          </h3>
                          <span className="num-tabular text-xs font-semibold text-slate-400">
                            {snapshot.countries.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {snapshot.countries.slice(0, 12).map((c) => {
                            const cityCount = snapshot.cities.filter(
                              (ct) => ct.countryCode === c.countryCode,
                            ).length;
                            const isMine = myLocation?.countryCode === c.countryCode;
                            return (
                              <button
                                key={c.countryCode}
                                type="button"
                                onClick={() => onSelectCountry(c.countryCode)}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    <span className="text-base">
                                      {countryCodeToFlag(c.countryCode)}
                                    </span>
                                    <span className="truncate">
                                      {getCountryName(c.countryCode, locale)}
                                    </span>
                                    {isMine && (
                                      <span
                                        title={t.myLocationOnlyYou}
                                        className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-400/20 dark:text-amber-300"
                                      >
                                        {t.myLocationBadge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {t.votesCount.replace('{n}', String(c.count))}
                                    {cityCount > 0 ? ` · ${cityCount} 📍` : ''}
                                  </div>
                                </div>
                                {c.strength >= 2 ? (
                                  <span
                                    className="num-tabular text-base font-extrabold"
                                    style={{ color: indexToColor(c.aiUserShare) }}
                                  >
                                    {c.aiUserShare}%
                                  </span>
                                ) : (
                                  <span className="num-tabular rounded-lg bg-sky-100 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                    {c.count}/{APP_CONFIG.thresholds.country.preliminary}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {snapshot.cities.length > 0 && (
                        <div>
                          <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                            {t.panelTopCities}
                          </h3>
                          <div className="space-y-2">
                            {snapshot.cities.slice(0, 10).map((city) => (
                              <button
                                key={city.key}
                                type="button"
                                onClick={() => onSelectCity(city)}
                                className="flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/50 px-3.5 py-2 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                              >
                                <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                                  <span>{countryCodeToFlag(city.countryCode)}</span>
                                  <span className="truncate">
                                    {getCityDisplayName(
                                      city.cityName,
                                      city.countryCode,
                                      locale,
                                    )}
                                  </span>
                                </div>
                                {city.strength >= 2 ? (
                                  <span
                                    className="num-tabular text-sm font-extrabold"
                                    style={{ color: indexToColor(city.aiUserShare) }}
                                  >
                                    {city.aiUserShare}%
                                  </span>
                                ) : (
                                  <span className="num-tabular text-xs font-semibold text-sky-600 dark:text-sky-400">
                                    {city.count}/{APP_CONFIG.thresholds.city.preliminary}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {t.panelCalibratingNote}
                      </p>
                    </div>
                  )}
                </div>
              ) : loading && !snapshot ? (
                <PanelSkeleton />
              ) : !snapshot || snapshot.global.totalSignals === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.panelNoDataYet}
                  </p>
                </div>
              ) : tab === 'roles' ? (
                <div className="space-y-2.5">
                  <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
                    {t.panelRolesFilterHint}
                  </p>
                  {snapshot.roles.map((r) => {
                    const active = roleFilter === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() =>
                          onChangeRoleFilter(active ? 'all' : r.role)
                        }
                        className={`w-full rounded-2xl border p-3.5 text-left transition ${
                          active
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15'
                            : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {ROLE_ICONS[r.role]} {t.roleLabels[r.role]}
                          </span>
                          <span className="flex items-center gap-2">
                            <span
                              className="num-tabular font-extrabold"
                              style={{ color: indexToColor(r.aiUserShare) }}
                            >
                              {r.aiUserShare}%
                            </span>
                            {active && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                                <X className="h-3 w-3" />
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.aiUserShare}%`,
                              backgroundColor: indexToColor(r.aiUserShare),
                            }}
                          />
                        </div>
                        <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {t.votesCount.replace('{n}', String(r.count))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
                    {t.panelCasesFilterHint}
                  </p>
                  {(
                    [
                      {
                        kind: 'ai' as const,
                        title: t.panelCasesGroupAi,
                        items: snapshot.symptoms.filter((s) => s.kind === 'ai'),
                      },
                      {
                        kind: 'no_ai' as const,
                        title: t.panelCasesGroupNoAi,
                        items: snapshot.symptoms.filter((s) => s.kind === 'no_ai'),
                      },
                    ]
                  )
                    .filter((group) => group.items.length > 0)
                    .map((group) => (
                      <div key={group.kind} className="space-y-2">
                        <h4 className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {group.title}
                        </h4>
                        {group.items.map((s) => {
                          const active = symptomFilter === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() =>
                                onChangeSymptomFilter(active ? 'all' : s.id)
                              }
                              className={`w-full rounded-2xl border p-3.5 text-left transition ${
                                active
                                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15'
                                  : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-white dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-sm">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {SYMPTOM_ICONS[s.id]} {t.symptomLabels[s.id].title}
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className="num-tabular font-bold text-slate-700 dark:text-slate-200">
                                    {s.share}%
                                  </span>
                                  {active && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                                      <X className="h-3 w-3" />
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {t.symptomLabels[s.id].desc}
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <div
                                  className={`h-full rounded-full ${
                                    s.kind === 'ai' ? 'bg-emerald-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${Math.min(100, s.share)}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </aside>
    </>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="flex h-14 items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-100/80 px-4 dark:border-slate-800/70 dark:bg-slate-900/60"
        >
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-16 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
          </div>
          <div className="h-4 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function CalibrationCard({
  current,
  target,
  t,
  onOpenSurvey,
}: {
  current: number;
  target: number;
  t: Dictionary;
  onOpenSurvey: () => void;
}) {
  const remaining = Math.max(0, target - current);
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="mt-4 rounded-2xl border border-sky-400/40 bg-sky-50 p-4 dark:bg-sky-950/25">
      <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-300">
        <span>{t.legendCalibrating}</span>
        <span className="num-tabular">
          {current} / {target}
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-200/70 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-sky-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
        {t.panelNeedsMoreSignals.replace('{n}', String(remaining))}
      </p>
      <button
        type="button"
        onClick={onOpenSurvey}
        className="mt-3.5 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-sky-600"
      >
        {t.ctaReport}
      </button>
    </div>
  );
}
