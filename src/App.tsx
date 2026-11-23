import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Columns2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { APP_CONFIG } from '../shared/config';
import {
  AI_SYMPTOMS,
  LEVEL_META,
  NO_AI_REASONS,
  ROLES,
  ROLE_ICONS,
  SYMPTOM_ICONS,
  type RoleId,
  type SymptomId,
} from '../shared/taxonomy';
import {
  HISTORY_PERIODS,
  type CityStat,
  type FieldReportResponse,
  type HistoryPeriod,
  type SignalSubmission,
} from '../shared/types';
import { AboutModal } from './components/AboutModal';
import { FeedbackModal } from './components/FeedbackModal';
import { FieldReport } from './components/FieldReport';
import { LiveTicker } from './components/LiveTicker';
import { ShareModal } from './components/ShareModal';
import { SidePanel } from './components/SidePanel';
import { SurveyModal } from './components/SurveyModal';
import { Tooltip } from './components/Tooltip';
import { TopBar } from './components/TopBar';
import { WorldRadarMap } from './components/WorldRadarMap';
import { useRadar } from './hooks/useRadar';
import {
  detectInitialLocale,
  getDictionary,
  type Locale,
} from './i18n/translations';
import { getCityDisplayName, getCountryName } from './utils/format';

function detectInitialTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem('ai-cover-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore
  }
  return 'dark';
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => detectInitialTheme());
  const [roleFilter, setRoleFilter] = useState<RoleId | 'all'>(() => {
    const r = new URLSearchParams(window.location.search).get('role');
    return r && (ROLES as readonly string[]).includes(r) ? (r as RoleId) : 'all';
  });
  const [symptomFilter, setSymptomFilter] = useState<SymptomId | 'all'>(() => {
    const s = new URLSearchParams(window.location.search).get('case');
    const valid =
      s &&
      ((AI_SYMPTOMS as readonly string[]).includes(s) ||
        (NO_AI_REASONS as readonly string[]).includes(s));
    return valid ? (s as SymptomId) : 'all';
  });

  // Dedicated "Before & after" historical comparison flow (kept separate from live sidebar stats)
  const [compareOpen, setCompareOpen] = useState(false);
  const [beforePeriod, setBeforePeriod] = useState<HistoryPeriod>('12m');
  const [afterPeriod, setAfterPeriod] = useState<HistoryPeriod>('now');

  const [selectedCountry, setSelectedCountry] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const sector = params.get('sector')?.toUpperCase();
    return sector && sector.length === 2 ? sector : null;
  });
  const [selectedCity, setSelectedCity] = useState<CityStat | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [surveyOpen, setSurveyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<{
    url: string;
    text: string;
  } | null>(null);
  const [introDismissed, setIntroDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai-cover-intro-dismissed') === '1';
    } catch {
      return false;
    }
  });
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [desktopPanelOpen, setDesktopPanelOpen] = useState(true);
  const [report, setReport] = useState<FieldReportResponse | null>(null);

  const t = getDictionary(locale);
  const {
    nowSnapshot,
    snapshotsByPeriod,
    geo,
    loading,
    error,
    hasSubmitted,
    myLocation,
    myProfile,
    submitSignal,
  } = useRadar(roleFilter, symptomFilter, 'all', compareOpen ? beforePeriod : 'now');

  const beforeSnapshot = snapshotsByPeriod[beforePeriod] ?? nowSnapshot;
  const afterSnapshot = snapshotsByPeriod[afterPeriod] ?? nowSnapshot;

  const buildSharePayload = (override?: {
    countryCode?: string | null;
    cityName?: string | null;
    aiShare?: number | null;
  }) => {
    const url = new URL(window.location.origin + window.location.pathname);
    const targetCountry =
      override?.countryCode !== undefined ? override.countryCode : selectedCountry;
    if (targetCountry) url.searchParams.set('sector', targetCountry);
    if (roleFilter !== 'all') url.searchParams.set('role', roleFilter);
    if (symptomFilter !== 'all') url.searchParams.set('case', symptomFilter);

    let text = t.shareTextGlobal;
    if (targetCountry) {
      const countryStat = nowSnapshot?.countries.find(
        (c) => c.countryCode === targetCountry,
      );
      const pct =
        override?.aiShare !== undefined
          ? override.aiShare
          : countryStat && countryStat.strength >= 2
            ? countryStat.aiUserShare
            : null;
      const placeName = override?.cityName
        ? `${getCityDisplayName(override.cityName, targetCountry, locale)}, ${getCountryName(targetCountry, locale)}`
        : getCountryName(targetCountry, locale);
      if (pct !== null) {
        text = t.shareTextCountry
          .replace('{place}', placeName)
          .replace('{pct}', String(pct));
      }
    }
    return { url: url.toString(), text };
  };

  const openShareModal = (override?: {
    countryCode?: string | null;
    cityName?: string | null;
    aiShare?: number | null;
  }) => {
    setSharePayload(buildSharePayload(override));
  };

  const handleToggleCompare = () => {
    if (compareOpen) {
      setCompareOpen(false);
      return;
    }
    setBeforePeriod('12m');
    setAfterPeriod('now');
    setCompareOpen(true);
  };

  const handleChangeBeforePeriod = (nextBefore: HistoryPeriod) => {
    if (
      HISTORY_PERIODS.indexOf(nextBefore) >= HISTORY_PERIODS.indexOf(afterPeriod)
    ) {
      return;
    }
    setBeforePeriod(nextBefore);
  };

  const handleChangeAfterPeriod = (nextAfter: HistoryPeriod) => {
    if (
      HISTORY_PERIODS.indexOf(nextAfter) <= HISTORY_PERIODS.indexOf(beforePeriod)
    ) {
      return;
    }
    setAfterPeriod(nextAfter);
  };

  const openMyProfileOrSurvey = () => {
    if (hasSubmitted && myProfile) {
      const current = nowSnapshot;
      const country =
        current?.countries.find((c) => c.countryCode === myProfile.countryCode) ??
        null;
      const cityKey = myProfile.cityName
        ? `${myProfile.countryCode}:${myProfile.cityName}`
        : null;
      const city = cityKey
        ? current?.cities.find((c) => c.key === cityKey) ?? null
        : null;
      const roleStat =
        current?.roles.find((r) => r.role === myProfile.role) ?? null;

      setReport({
        ok: true,
        updated: true,
        signal: myProfile,
        milestones: {
          isFirstInCity: false,
          isFirstInCountry: false,
          cityRemainingToUnlock: myProfile.cityName
            ? Math.max(
                0,
                APP_CONFIG.thresholds.city.preliminary - (city?.count ?? 1),
              )
            : 0,
          countryRemainingToUnlock: Math.max(
            0,
            APP_CONFIG.thresholds.country.preliminary - (country?.count ?? 1),
          ),
          countryThreshold: APP_CONFIG.thresholds.country.preliminary,
          cityThreshold: APP_CONFIG.thresholds.city.preliminary,
        },
        comparison: {
          country,
          city,
          role: roleStat,
          globalAiUserShare: current?.global.globalAiUserShare ?? 0,
        },
      });
      return;
    }
    setSurveyOpen(true);
  };

  useEffect(() => {
    try {
      localStorage.setItem('ai-cover-locale', locale);
    } catch {
      // ignore
    }
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    try {
      localStorage.setItem('ai-cover-theme', theme);
    } catch {
      // ignore
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSelectCountry = (code: string | null) => {
    setSelectedCity(null);
    setSelectedCountry(code);
    if (code) {
      setMobilePanelOpen(true);
      setDesktopPanelOpen(true);
    }
  };

  const handleSelectCity = (city: CityStat | null) => {
    setSelectedCountry(null);
    setSelectedCity(city);
    if (city) {
      if (city.lat !== null && city.lng !== null) {
        setFocusTarget({ lat: city.lat, lng: city.lng });
      }
      setMobilePanelOpen(true);
      setDesktopPanelOpen(true);
    }
  };

  const handleSubmitSignal = async (
    payload: Omit<SignalSubmission, 'anonToken'>,
  ) => {
    const res = await submitSignal(payload);
    setCompareOpen(false);
    setSurveyOpen(false);
    setReport(res);
    setSelectedCountry(res.signal.countryCode);
    setSelectedCity(null);
    if (res.signal.lat !== null && res.signal.lng !== null) {
      setFocusTarget({ lat: res.signal.lat, lng: res.signal.lng });
    }
  };

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100">
      <TopBar
        locale={locale}
        onChangeLocale={setLocale}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenShare={() => openShareModal()}
        onOpenFeedback={() => setFeedbackOpen(true)}
        t={t}
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar (Desktop) & Stats Sheet (Mobile): always shows live Global Summary + detailed tabs */}
        <SidePanel
          snapshot={nowSnapshot}
          loading={loading}
          hasSubmitted={hasSubmitted}
          roleFilter={roleFilter}
          onChangeRoleFilter={setRoleFilter}
          symptomFilter={symptomFilter}
          onChangeSymptomFilter={setSymptomFilter}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          myLocation={myLocation}
          onSelectCountry={handleSelectCountry}
          onSelectCity={handleSelectCity}
          onOpenSurvey={() => setSurveyOpen(true)}
          onSharePlace={(place) => openShareModal(place)}
          mobileOpen={mobilePanelOpen}
          onCloseMobile={() => setMobilePanelOpen(false)}
          desktopOpen={desktopPanelOpen}
          locale={locale}
          t={t}
        />

        {/* Primary Map Stage */}
        <div className="relative min-w-0 flex-1">
          <WorldRadarMap
            countries={(compareOpen ? beforeSnapshot : nowSnapshot)?.countries ?? []}
            cities={(compareOpen ? beforeSnapshot : nowSnapshot)?.cities ?? []}
            nowCountries={afterSnapshot?.countries}
            nowCities={afterSnapshot?.cities}
            isHistorical={compareOpen}
            splitCompare={compareOpen}
            beforePeriod={beforePeriod}
            afterPeriod={afterPeriod}
            beforeSummary={
              beforeSnapshot
                ? {
                    countries: beforeSnapshot.global.countriesReached,
                    aiShare: beforeSnapshot.global.globalAiUserShare,
                  }
                : undefined
            }
            afterSummary={
              afterSnapshot
                ? {
                    countries: afterSnapshot.global.countriesReached,
                    aiShare: afterSnapshot.global.globalAiUserShare,
                  }
                : undefined
            }
            onChangeBeforePeriod={handleChangeBeforePeriod}
            onChangeAfterPeriod={handleChangeAfterPeriod}
            selectedCountry={selectedCountry}
            selectedCityKey={selectedCity?.key ?? null}
            myLocation={myLocation}
            focusTarget={focusTarget}
            onSelectCountry={(code) => handleSelectCountry(code)}
            onSelectCity={(city) => handleSelectCity(city)}
            theme={theme}
            locale={locale}
            t={t}
          />

          {/* Top-center floating bar: Primary CTA on line 1, optional intro/filters cleanly underneath */}
          <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
              {/* Mobile stats sheet toggle */}
              <button
                type="button"
                onClick={() => setMobilePanelOpen(true)}
                aria-label={t.mobileListBtn}
                className="pointer-events-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md active:scale-95 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 lg:hidden"
              >
                <BarChart3 className="h-4 w-4 text-sky-500" aria-hidden="true" />
                <span>{t.mobileListBtn}</span>
              </button>

              {hasSubmitted ? (
                <button
                  type="button"
                  onClick={openMyProfileOrSurvey}
                  className="pointer-events-auto inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-emerald-400/60 bg-emerald-50/95 px-3.5 text-xs font-bold text-emerald-950 shadow-md shadow-emerald-500/15 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-100/95 active:scale-[0.98] dark:border-emerald-400/50 dark:bg-[#0d211d]/95 dark:text-emerald-100 dark:shadow-emerald-500/20 dark:hover:border-emerald-400 dark:hover:bg-[#122e28]"
                >
                  {myProfile && (
                    <span className="text-sm" aria-hidden="true">
                      {LEVEL_META[myProfile.level].emoji}
                    </span>
                  )}
                  <span>{t.ctaUpdate}</span>
                </button>
              ) : (
                <div className="pointer-events-auto relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/40 via-cyan-500/40 to-emerald-500/40 opacity-75 blur-md animate-pulse"
                  />
                  <button
                    type="button"
                    onClick={openMyProfileOrSurvey}
                    className="relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{t.ctaReport}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            {/* First-visit concise one-line intro for newcomers */}
            {!hasSubmitted &&
              !introDismissed &&
              !compareOpen &&
              roleFilter === 'all' &&
              symptomFilter === 'all' && (
                <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 text-center text-[11px] font-medium leading-snug text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0d1526]/90 dark:text-slate-300 sm:text-xs">
                  <span>{t.introHint}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIntroDismissed(true);
                      try {
                        localStorage.setItem('ai-cover-intro-dismissed', '1');
                      } catch {
                        // ignore
                      }
                    }}
                    aria-label={t.a11yClose}
                    className="shrink-0 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}

            {(roleFilter !== 'all' || symptomFilter !== 'all') && (
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {roleFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setRoleFilter('all')}
                    className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-xl border border-sky-500/40 bg-white/95 px-3 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-md transition hover:bg-sky-50 dark:bg-[#0d1526]/95 dark:text-white dark:hover:bg-sky-950/50"
                  >
                    <span>
                      {ROLE_ICONS[roleFilter]} {t.roleLabels[roleFilter]}
                    </span>
                    <X className="h-3.5 w-3.5 text-sky-500" />
                  </button>
                )}

                {symptomFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSymptomFilter('all')}
                    className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-xl border border-sky-500/40 bg-white/95 px-3 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-md transition hover:bg-sky-50 dark:bg-[#0d1526]/95 dark:text-white dark:hover:bg-sky-950/50"
                  >
                    <span>
                      {SYMPTOM_ICONS[symptomFilter]}{' '}
                      {t.symptomLabels[symptomFilter].title}
                    </span>
                    <X className="h-3.5 w-3.5 text-sky-500" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom-left sidebar toggle (desktop) — pinned at bottom-5 left-4 with tooltip */}
          <div className="absolute bottom-5 left-4 z-20 hidden lg:block">
            <Tooltip
              label={desktopPanelOpen ? t.a11yHideSidebar : t.a11yShowSidebar}
              side="right"
            >
              <button
                type="button"
                onClick={() => setDesktopPanelOpen((v) => !v)}
                aria-label={desktopPanelOpen ? t.a11yHideSidebar : t.a11yShowSidebar}
                aria-expanded={desktopPanelOpen}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white/95 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                {desktopPanelOpen ? (
                  <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </Tooltip>
          </div>

          {/* Bottom controls: unified h-9 rounded-xl "World then & now" toggle + compact Color Legend */}
          <div className="pointer-events-none absolute bottom-5 left-4 right-16 z-20 flex flex-col items-start gap-2 lg:inset-x-16 lg:flex-row lg:items-center lg:justify-center">
            <button
              type="button"
              onClick={handleToggleCompare}
              aria-pressed={compareOpen}
              className={`pointer-events-auto inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold shadow-sm backdrop-blur-md transition active:scale-95 ${
                compareOpen
                  ? 'border-sky-500/60 bg-sky-50/95 text-sky-900 hover:bg-sky-100/95 dark:border-sky-400/50 dark:bg-sky-950/90 dark:text-sky-100 dark:hover:bg-sky-900/90'
                  : 'border-slate-200/90 bg-white/95 text-slate-700 hover:border-sky-400/70 hover:bg-sky-50/90 hover:text-sky-700 dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-200 dark:hover:border-sky-500/60 dark:hover:bg-sky-950/60 dark:hover:text-sky-300'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
              <span>{t.timelineSplitBtn}</span>
              {compareOpen && (
                <X className="ml-0.5 h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              )}
            </button>

            <div className="pointer-events-auto flex h-9 max-w-full items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/90 bg-white/95 px-2.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-[#0d1526]/95 dark:text-slate-300 sm:gap-2.5 sm:px-3 sm:text-xs">
              <span className="hidden font-bold text-slate-800 dark:text-slate-100 xl:inline">
                {t.legendScaleLabel}
              </span>
              <span className="flex items-center gap-1" title={t.legendNoSignal}>
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-slate-300 bg-[#dde5f0] dark:border-slate-700 dark:bg-[#121b2d]" />
                <span className="sm:hidden">{t.legendNoSignalShort}</span>
                <span className="hidden sm:inline">{t.legendNoSignal}</span>
              </span>
              <span
                className="flex items-center gap-1"
                title={t.legendCalibrating}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded border border-sky-400/60 bg-sky-200/70 dark:bg-sky-500/25" />
                <span className="sm:hidden">{t.legendCalibratingShort}</span>
                <span className="hidden sm:inline">{t.legendCalibrating}</span>
              </span>
              <span className="flex items-center gap-1.5 border-l border-slate-200 pl-2 dark:border-slate-700/80 sm:pl-2.5">
                <span className="text-indigo-600 dark:text-indigo-400">
                  {t.legendLow}
                </span>
                <span
                  className="h-2 w-10 shrink-0 rounded-full sm:w-16"
                  title={`${t.legendScaleLabel} ${t.legendLow} → ${t.legendHigh}`}
                  style={{
                    background:
                      'linear-gradient(90deg, #4f46e5 0%, #0891b2 35%, #10b981 70%, #eab308 100%)',
                  }}
                />
                <span className="text-amber-600 dark:text-yellow-400">
                  {t.legendHigh}
                </span>
              </span>
            </div>
          </div>

          {loading && !nowSnapshot && (
            <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#0b1120]/90 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
              <span>{APP_CONFIG.brandName}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="absolute right-4 top-4 z-30 rounded-2xl border border-rose-500/40 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-sm dark:bg-rose-950/90 dark:text-rose-200"
            >
              API offline: {error}
            </div>
          )}
        </div>
      </main>

      <LiveTicker recent={nowSnapshot?.recent ?? []} locale={locale} t={t} />

      <SurveyModal
        open={surveyOpen}
        geo={geo}
        initialProfile={myProfile}
        onClose={() => setSurveyOpen(false)}
        onSubmit={handleSubmitSignal}
        locale={locale}
        t={t}
      />

      <FieldReport
        report={report}
        onClose={() => setReport(null)}
        onEdit={() => {
          setReport(null);
          setSurveyOpen(true);
        }}
        onShare={(countryCode) => openShareModal({ countryCode })}
        locale={locale}
        t={t}
      />

      <AboutModal
        open={aboutOpen}
        hasSubmitted={hasSubmitted}
        onClose={() => setAboutOpen(false)}
        onStartSurvey={() => setSurveyOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
        t={t}
      />

      <ShareModal
        open={Boolean(sharePayload)}
        shareUrl={sharePayload?.url ?? window.location.href}
        shareText={sharePayload?.text ?? t.shareTextGlobal}
        onClose={() => setSharePayload(null)}
        t={t}
      />

      <FeedbackModal
        open={feedbackOpen}
        context={{
          locale,
          theme,
          selectedCountry,
          roleFilter,
          symptomFilter,
          compareOpen,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        }}
        onClose={() => setFeedbackOpen(false)}
        t={t}
      />
    </div>
  );
}
