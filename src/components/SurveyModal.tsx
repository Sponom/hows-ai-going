import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  NUMERIC_TO_ALPHA2,
  PRESET_CITIES,
  getLocalizedCityName,
  type PresetCity,
} from '../../shared/geo-codes';
import {
  AI_SYMPTOMS,
  LEVEL_META,
  NO_AI_REASONS,
  ROLE_ICONS,
  SYMPTOM_ICONS,
  type RoleId,
  type SymptomId,
  type UsageLevel,
} from '../../shared/taxonomy';
import type { GeoInfo, SignalSubmission } from '../../shared/types';
import type { MySavedProfile } from '../hooks/useRadar';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  getCityDisplayName,
  getCountryName,
} from '../utils/format';
import { Tooltip } from './Tooltip';

const DOMAIN_GROUPS: { key: 'life' | 'digital' | 'offline'; ids: RoleId[] }[] = [
  { key: 'life', ids: ['home', 'student', 'other'] },
  { key: 'digital', ids: ['tech', 'design', 'media', 'office', 'founder'] },
  { key: 'offline', ids: ['education', 'health', 'trades', 'service'] },
];

interface SurveyModalProps {
  open: boolean;
  geo: GeoInfo | null;
  initialProfile: MySavedProfile | null;
  onClose: () => void;
  onSubmit: (payload: Omit<SignalSubmission, 'anonToken'>) => Promise<void>;
  locale: Locale;
  t: Dictionary;
}

export function SurveyModal({
  open,
  geo,
  initialProfile,
  onClose,
  onSubmit,
  locale,
  t,
}: SurveyModalProps) {
  // Step 1: Frequency + Location (ready to submit in 1 click)
  // Step 2: Optional details (Areas & Use cases)
  const [step, setStep] = useState<1 | 2>(1);
  const [level, setLevel] = useState<UsageLevel | null>(null);
  const [domains, setDomains] = useState<RoleId[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);

  const [countryCode, setCountryCode] = useState<string>(geo?.countryCode ?? 'US');
  const [cityName, setCityName] = useState<string | null>(geo?.cityName ?? null);
  const [lat, setLat] = useState<number | null>(geo?.lat ?? null);
  const [lng, setLng] = useState<number | null>(geo?.lng ?? null);
  const [cityInput, setCityInput] = useState<string>('');
  const [locationExpanded, setLocationExpanded] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (countryDropdownOpen) {
          setCountryDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, countryDropdownOpen, onClose]);

  useEffect(() => {
    if (!countryDropdownOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [countryDropdownOpen]);

  // Pre-fill existing answers when opening the modal to edit profile
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setErr(null);
    setLocationExpanded(false);
    setCountryDropdownOpen(false);
    if (initialProfile) {
      setLevel(initialProfile.level);
      setDomains(initialProfile.domains);
      setSymptoms(initialProfile.symptoms);
      setCountryCode(initialProfile.countryCode);
      setCityName(initialProfile.cityName);
      setLat(initialProfile.lat);
      setLng(initialProfile.lng);
      setCityInput(
        initialProfile.cityName
          ? getCityDisplayName(
              initialProfile.cityName,
              initialProfile.countryCode,
              locale,
            )
          : '',
      );
    }
  }, [open, initialProfile, locale]);

  // Sync auto-detected Cloudflare Edge geo when it arrives (only if no saved profile yet)
  useEffect(() => {
    if (!initialProfile && geo?.source === 'cloudflare' && geo.countryCode) {
      setCountryCode(geo.countryCode);
      setCityName(geo.cityName);
      setLat(geo.lat);
      setLng(geo.lng);
      setCityInput(
        geo.cityName ? getCityDisplayName(geo.cityName, geo.countryCode, locale) : '',
      );
    }
  }, [geo, initialProfile, locale]);

  const allCountries = useMemo(() => {
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

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.enName.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q,
    );
  }, [allCountries, countryQuery]);

  const filteredCities = useMemo(() => {
    const q = cityInput.trim().toLowerCase();
    const list = PRESET_CITIES.map((c) => ({
      ...c,
      localizedCity: getLocalizedCityName(c.city, c.countryCode, locale),
      localizedCountry: getCountryName(c.countryCode, locale),
    }));

    const selectedLocalized = cityName
      ? getCityDisplayName(cityName, countryCode, locale).toLowerCase()
      : '';
    if (!q || q === selectedLocalized) {
      const sameCountry = list.filter((c) => c.countryCode === countryCode);
      const others = list.filter((c) => c.countryCode !== countryCode);
      return [...sameCountry, ...others].slice(0, 8);
    }

    return list
      .filter((c) => {
        const allLocalizedNames = Object.values(c.names).join(' ').toLowerCase();
        return (
          c.localizedCity.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.localizedCountry.toLowerCase().includes(q) ||
          allLocalizedNames.includes(q) ||
          c.countryCode.toLowerCase() === q
        );
      })
      .slice(0, 8);
  }, [cityInput, cityName, locale, countryCode]);

  const { mounted, closing } = useAnimatedModal(open);

  if (!mounted) return null;

  const isNoAi = level === 0;
  const maxDomains = 5;
  const symptomOptions: readonly SymptomId[] = isNoAi ? NO_AI_REASONS : AI_SYMPTOMS;

  const handleChooseLevel = (lvl: UsageLevel) => {
    if ((lvl === 0) !== (level === 0)) {
      setSymptoms([]);
    }
    setLevel(lvl);
  };

  const toggleDomain = (id: RoleId) => {
    setDomains((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxDomains) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const toggleSymptom = (id: SymptomId) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const clearCity = () => {
    setCityName(null);
    setLat(null);
    setLng(null);
    setCityInput('');
  };

  const togglePresetCity = (preset: PresetCity) => {
    if (cityName === preset.city && countryCode === preset.countryCode) {
      clearCity();
      return;
    }
    setCountryCode(preset.countryCode);
    setCityName(preset.city);
    setLat(preset.lat);
    setLng(preset.lng);
    setCityInput(getLocalizedCityName(preset.city, preset.countryCode, locale));
  };

  const handleFinalSubmit = async () => {
    if (level === null) return;
    setSubmitting(true);
    setErr(null);
    try {
      const typedCity = cityInput.trim();
      const finalCity = cityName ?? (typedCity.length >= 2 ? typedCity : null);
      await onSubmit({
        countryCode,
        cityName: finalCity,
        lat: finalCity ? lat : null,
        lng: finalCity ? lng : null,
        level,
        domains,
        symptoms,
      });
      setStep(1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const displayLocation = cityName
    ? `${getCityDisplayName(cityName, countryCode, locale)}, ${getCountryName(countryCode, locale)}`
    : getCountryName(countryCode, locale);
  const detailsCount = domains.length + symptoms.length;

  return (
    <div
      className={`${
        closing ? 'animate-modal-backdrop-out pointer-events-none' : 'animate-modal-backdrop'
      } fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-modal-title"
        className={`${
          closing ? 'animate-modal-surface-out' : 'animate-modal-surface'
        } relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0b1120] sm:max-w-lg sm:rounded-3xl`}
      >
        {/* Top subtle accent bar */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800/80">
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 transition-all duration-300"
            style={{ width: step === 1 ? (level !== null ? '65%' : '35%') : '100%' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
          <div>
            <h2
              id="survey-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              {step === 1 ? t.surveyTitle : t.surveyAddDetails}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 ? t.surveySubtitle : t.surveyDetailsHint}
            </p>
          </div>
          <Tooltip label={t.a11yClose} side="left">
            <button
              type="button"
              onClick={onClose}
              aria-label={t.a11yClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        {/* Body */}
        <div key={step} className="animate-step-in flex-1 overflow-y-auto px-5 py-5">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
                  {t.surveyStepLevel}
                </h3>
                <div className="space-y-2">
                  {([0, 1, 2, 3] as UsageLevel[]).map((lvl) => {
                    const selected = level === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleChooseLevel(lvl)}
                        className={`group flex min-h-[58px] w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition active:scale-[0.99] ${
                          selected
                            ? 'border-sky-500 bg-sky-50 shadow-sm shadow-sky-500/10 dark:bg-sky-500/15'
                            : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-600 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="text-2xl">{LEVEL_META[lvl].emoji}</span>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                              {t.levelLabels[lvl].title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {t.levelLabels[lvl].desc}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            selected
                              ? 'border-sky-500 bg-sky-500 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact inline location bar (auto-detected, expandable on demand) */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="text-lg leading-none">
                      {countryCodeToFlag(countryCode)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                        {displayLocation}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                        <span className="truncate">{t.surveyPrivacyNote}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationExpanded((v) => !v)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  >
                    <span>{t.surveyChangeLocation}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        locationExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {locationExpanded && (
                  <div className="mt-3.5 space-y-3 border-t border-slate-200/80 pt-3.5 dark:border-slate-800">
                    {/* Country selector */}
                    <div ref={countryDropdownRef} className="relative">
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {t.surveyCountryLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCountryDropdownOpen((v) => !v);
                          setCountryQuery('');
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={countryDropdownOpen}
                        className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm font-semibold text-slate-900 transition dark:bg-slate-900 dark:text-white ${
                          countryDropdownOpen
                            ? 'border-sky-500 ring-2 ring-sky-500/20'
                            : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-base">{countryCodeToFlag(countryCode)}</span>
                          <span className="truncate">{getCountryName(countryCode, locale)}</span>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 ${
                            countryDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {countryDropdownOpen && (
                        <div className="absolute inset-x-0 top-[62px] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[#0d1424]">
                          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                autoFocus
                                value={countryQuery}
                                onChange={(e) => setCountryQuery(e.target.value)}
                                placeholder={t.panelSearchPlaceholder}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-sky-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div role="listbox" className="max-h-48 space-y-1 overflow-y-auto p-1.5">
                            {filteredCountries.length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-400">
                                {t.panelSearchNoResults}
                              </div>
                            ) : (
                              filteredCountries.map((c) => {
                                const selected = c.code === countryCode;
                                return (
                                  <button
                                    key={c.code}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => {
                                      setCountryCode(c.code);
                                      clearCity();
                                      setCountryDropdownOpen(false);
                                      setCountryQuery('');
                                    }}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                                      selected
                                        ? 'bg-sky-50 font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2 truncate">
                                      <span>{countryCodeToFlag(c.code)}</span>
                                      <span className="truncate">{c.name}</span>
                                    </span>
                                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* City selector (optional) */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {t.surveyCityOptionalLabel}
                      </label>
                      <div className="relative">
                        {cityName ? (
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
                        ) : (
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        )}
                        <input
                          type="text"
                          value={cityInput}
                          onChange={(e) => {
                            setCityInput(e.target.value);
                            setCityName(null);
                            setLat(null);
                            setLng(null);
                          }}
                          placeholder={t.surveySearchCity}
                          className={`h-10 w-full rounded-xl border bg-white pl-9 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-500 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 ${
                            cityName
                              ? 'border-sky-500/60 font-semibold'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                        {(cityInput || cityName) && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Tooltip label={t.a11yClear} side="left">
                              <button
                                type="button"
                                onClick={clearCity}
                                aria-label={t.a11yClear}
                                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      {!cityName &&
                        cityInput.trim().length >= 2 &&
                        !filteredCities.some(
                          (c) =>
                            c.localizedCity.toLowerCase() ===
                              cityInput.trim().toLowerCase() ||
                            c.city.toLowerCase() === cityInput.trim().toLowerCase(),
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              const custom = cityInput.trim();
                              setCityName(custom);
                              if (geo?.countryCode !== countryCode) {
                                setLat(null);
                                setLng(null);
                              }
                            }}
                            className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-sky-400/70 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
                          >
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {t.surveyUseCustomCity.replace('{city}', cityInput.trim())} (
                              {getCountryName(countryCode, locale)})
                            </span>
                          </button>
                        )}

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {filteredCities.map((c) => {
                          const active =
                            cityName === c.city && countryCode === c.countryCode;
                          return (
                            <button
                              key={`${c.countryCode}-${c.city}`}
                              type="button"
                              onClick={() => togglePresetCity(c)}
                              className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold transition ${
                                active
                                  ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600'
                              }`}
                            >
                              <span>
                                {countryCodeToFlag(c.countryCode)} {c.localizedCity}
                              </span>
                              {active && <X className="h-3 w-3 opacity-90" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {err && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {err}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Areas */}
              <div>
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isNoAi ? t.surveyStepDomainsNoAi : t.surveyStepDomainsAi}
                  </h3>
                  {domains.length > 0 && (
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                      {t.surveySelectedCount.replace('{n}', String(domains.length))}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {DOMAIN_GROUPS.map((group) => (
                    <div key={group.key}>
                      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {t.surveyDomainGroups[group.key]}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.ids.map((r) => {
                          const selected = domains.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => toggleDomain(r)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                                selected
                                  ? 'border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                                  : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/80'
                              }`}
                            >
                              <span>{ROLE_ICONS[r]}</span>
                              <span>{t.roleLabels[r]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use cases / Reasons */}
              <div className="border-t border-slate-100 pt-5 dark:border-slate-800/80">
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isNoAi ? t.surveyStepSymptomsNoAi : t.surveyStepSymptomsAi}
                  </h3>
                  {symptoms.length > 0 && (
                    <span className="shrink-0 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                      {t.surveySelectedCount.replace('{n}', String(symptoms.length))}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {symptomOptions.map((id) => {
                    const selected = symptoms.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        title={t.symptomLabels[id].desc}
                        onClick={() => toggleSymptom(id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition active:scale-[0.97] ${
                          selected
                            ? 'border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                            : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{SYMPTOM_ICONS[id]}</span>
                        <span>{t.symptomLabels[id].title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {err && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {err}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2.5 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800/80 dark:bg-[#080d19]">
          {step === 1 ? (
            <button
              type="button"
              disabled={level === null || submitting}
              onClick={() => setStep(2)}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:px-4 sm:text-sm"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.surveyAddDetails}</span>
              {detailsCount > 0 && (
                <span className="rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-bold text-sky-600 dark:text-sky-300">
                  {detailsCount}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.surveyBack}
            </button>
          )}

          <button
            type="button"
            disabled={level === null || submitting}
            onClick={handleFinalSubmit}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{submitting ? t.surveySubmitting : t.surveySubmit}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
