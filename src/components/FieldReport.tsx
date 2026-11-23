import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Compass,
  Download,
  Lock,
  Pencil,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { LEVEL_META, ROLE_ICONS, SYMPTOM_ICONS } from '../../shared/taxonomy';
import type { FieldReportResponse } from '../../shared/types';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  formatVisibleCount,
  getCityDisplayName,
  getCountryName,
} from '../utils/format';
import { downloadShareCard } from '../utils/shareCard';
import { Tooltip } from './Tooltip';

interface FieldReportProps {
  report: FieldReportResponse | null;
  justSubmitted?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onShare: (countryCode: string) => void;
  locale: Locale;
  t: Dictionary;
}

const CONFETTI_COLORS = ['#4f46e5', '#0891b2', '#10b981', '#eab308', '#38bdf8'];

function CelebrationConfetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const originX = w / 2;
    const originY = Math.min(h * 0.36, 280);

    const particles = Array.from({ length: 54 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const speed = 4.5 + Math.random() * 7.5;
      return {
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 5 + Math.random() * 4.5,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.24,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        isCircle: Math.random() < 0.3,
      };
    });

    const start = performance.now();
    const duration = 1800;
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      ctx.clearRect(0, 0, w, h);

      const alpha = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;
      ctx.globalAlpha = alpha;

      for (const p of particles) {
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        }
        ctx.restore();
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}

const LEVEL_STEP_COLORS: Record<0 | 1 | 2 | 3, string> = {
  0: '#4f46e5',
  1: '#0891b2',
  2: '#10b981',
  3: '#eab308',
};

const LEVEL_ACCENTS: Record<
  0 | 1 | 2 | 3,
  { glow: string; badgeBg: string; pillActive: string }
> = {
  0: {
    glow: 'from-indigo-500/15 via-cyan-500/5 to-transparent',
    badgeBg: 'bg-indigo-500/15 ring-indigo-400/40',
    pillActive: 'bg-indigo-500',
  },
  1: {
    glow: 'from-cyan-500/15 via-emerald-500/5 to-transparent',
    badgeBg: 'bg-cyan-500/15 ring-cyan-400/40',
    pillActive: 'bg-cyan-500',
  },
  2: {
    glow: 'from-emerald-500/18 via-yellow-500/5 to-transparent',
    badgeBg: 'bg-emerald-500/15 ring-emerald-400/40',
    pillActive: 'bg-emerald-500',
  },
  3: {
    glow: 'from-yellow-500/18 via-emerald-500/8 to-transparent',
    badgeBg: 'bg-yellow-500/15 ring-yellow-400/40',
    pillActive: 'bg-gradient-to-r from-emerald-500 to-yellow-400',
  },
};

export function FieldReport({
  report,
  justSubmitted = false,
  onClose,
  onEdit,
  onShare,
  locale,
  t,
}: FieldReportProps) {
  const [lastReport, setLastReport] = useState<FieldReportResponse | null>(report);
  const [cardSaved, setCardSaved] = useState(false);
  const { mounted, closing } = useAnimatedModal(Boolean(report));

  useEffect(() => {
    if (report) {
      setLastReport(report);
      setCardSaved(false);
    }
  }, [report]);

  useEffect(() => {
    if (!report) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [report, onClose]);

  const activeReport = report ?? lastReport;
  if (!mounted || !activeReport) return null;

  const { signal, milestones, comparison } = activeReport;
  const countryName = getCountryName(signal.countryCode, locale);
  const localizedCity = signal.cityName
    ? getCityDisplayName(signal.cityName, signal.countryCode, locale)
    : null;

  const verdict = t.verdicts[signal.level];
  const primarySymptom = signal.symptoms[0];
  const quip = primarySymptom ? t.symptomQuips[primarySymptom] : verdict.subtitle;
  const accent = LEVEL_ACCENTS[signal.level];

  const firstBanner =
    milestones.isFirstInCity && localizedCity
      ? t.reportFirstCity.replace('{city}', localizedCity)
      : milestones.isFirstInCountry
        ? t.reportFirstCountry.replace('{country}', countryName)
        : null;

  const countryStat = comparison.country;
  const countryIsCalibrated = Boolean(countryStat && countryStat.strength >= 2);
  const countryVotes = countryStat?.count ?? 1;
  const countryTarget = milestones.countryThreshold;
  const countryProgressPct = Math.min(
    100,
    Math.round((countryVotes / countryTarget) * 100),
  );

  return (
    <>
      <CelebrationConfetti active={Boolean(report && justSubmitted)} />
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
        aria-labelledby="field-report-title"
        className={`${
          closing ? 'animate-modal-surface-out' : 'animate-modal-surface'
        } relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0b1120] sm:max-w-md sm:rounded-3xl`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {justSubmitted ? (
            <span
              id="field-report-title"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t.reportThanksTitle}</span>
            </span>
          ) : (
            <span
              id="field-report-title"
              className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {t.reportTitle}
            </span>
          )}
          <Tooltip label={t.a11yClose} side="left">
            <button
              type="button"
              onClick={onClose}
              aria-label={t.a11yClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        <div className="space-y-5 px-5 pb-5">
          {/* Pioneer banner if first in city/country */}
          {firstBanner && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-amber-400/50 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{firstBanner}</span>
            </div>
          )}

          {/* LEVEL 1: HERO — Visually dominant personal identity card */}
          <div
            className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b ${accent.glow} p-6 text-center dark:border-slate-700/80`}
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ring-1 ${accent.badgeBg}`}
            >
              {LEVEL_META[signal.level].emoji}
            </div>

            <h3 className="mt-3.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {verdict.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {quip}
            </p>

            {/* Progressive 4-step meter: each bar takes its own Viridis step color */}
            <div className="mx-auto mt-4 max-w-[310px]">
              <div className="grid grid-cols-4 gap-1.5">
                {([0, 1, 2, 3] as const).map((lvl) => {
                  const isCurrent = lvl === signal.level;
                  const isFilled = lvl <= signal.level;
                  return (
                    <div key={lvl} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`h-2 w-full rounded-full transition-all ${
                          isFilled ? '' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                        style={
                          isFilled
                            ? { backgroundColor: LEVEL_STEP_COLORS[lvl] }
                            : undefined
                        }
                      />
                      <span
                        className={`text-center text-[10px] leading-tight ${
                          isCurrent
                            ? 'font-extrabold text-slate-900 dark:text-white'
                            : 'font-medium text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {t.levelLabels[lvl].title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compact summary tags */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="rounded-full bg-white/90 px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-slate-200/90 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700">
                {countryCodeToFlag(signal.countryCode)}{' '}
                {localizedCity ? `${localizedCity}, ` : ''}
                {countryName}
              </span>
              {signal.domains.slice(0, 3).map((d) => (
                <span
                  key={d}
                  className="rounded-full bg-white/90 px-2.5 py-1 font-medium text-slate-600 ring-1 ring-slate-200/90 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-slate-700"
                >
                  {ROLE_ICONS[d]} {t.roleLabels[d]}
                </span>
              ))}
              {signal.symptoms.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/90 px-2.5 py-1 font-medium text-slate-600 ring-1 ring-slate-200/90 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-slate-700"
                >
                  {SYMPTOM_ICONS[s]} {t.symptomLabels[s].title}
                </span>
              ))}
            </div>
          </div>

          {/* LEVEL 2: SUBORDINATE CONTEXT — One quiet unified section with clear dot-ratio visuals */}
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reportAroundYou}
            </div>

            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {/* Row 1: Your Country */}
              <div className="pb-3.5">
                {countryIsCalibrated && countryStat ? (
                  <OutOfTenRow
                    icon={countryCodeToFlag(signal.countryCode)}
                    label={countryName}
                    pct={countryStat.aiUserShare}
                    count={countryStat.count}
                    locale={locale}
                    t={t}
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <span>{countryCodeToFlag(signal.countryCode)}</span>
                        <span>{countryName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                        <Lock className="h-3 w-3" />
                        {t.legendCalibrating}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all"
                        style={{ width: `${countryProgressPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {t.reportCollectingCountry}
                    </p>
                  </div>
                )}
              </div>

              {/* Row 2: Your Primary Topic */}
              {comparison.role && (
                <div className="pt-3.5">
                  <OutOfTenRow
                    icon={ROLE_ICONS[signal.role]}
                    label={t.roleLabels[signal.role]}
                    pct={comparison.role.aiUserShare}
                    count={comparison.role.count}
                    locale={locale}
                    t={t}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => onShare(signal.countryCode)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t.reportShareBtn}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:brightness-105 active:scale-[0.98]"
              >
                <Compass className="h-4 w-4" />
                {t.reportExploreMap}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await downloadShareCard(activeReport, locale, t);
                    setCardSaved(true);
                    window.setTimeout(() => setCardSaved(false), 2200);
                  } catch {
                    // ignore
                  }
                }}
                className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition ${
                  cardSaved
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                {cardSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.reportCardSaved}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.reportDownloadCard}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onEdit}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                {t.reportEditBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

/**
 * 10-dot human-ratio visual ("9 in 10 use AI · 87%") — instantly connects visual & text
 * without ambiguous red progress bars.
 */
function OutOfTenRow({
  icon,
  label,
  pct,
  count,
  locale,
  t,
}: {
  icon: string;
  label: string;
  pct: number;
  count: number;
  locale: Locale;
  t: Dictionary;
}) {
  const filledDots = Math.round(pct / 10);
  const visibleCount = formatVisibleCount(count, locale, t.votesCount);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="num-tabular font-bold text-slate-900 dark:text-white">
          {t.reportOutOfTen.replace('{n}', String(filledDots))}
        </span>
      </div>

      {/* 10-dot unit chart */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                idx < filledDots
                  ? 'bg-sky-500 dark:bg-sky-400'
                  : 'bg-slate-200 dark:bg-slate-700/80'
              }`}
            />
          ))}
        </div>
        <span className="num-tabular text-[11px] text-slate-400 dark:text-slate-500">
          {pct}%{visibleCount ? ` · ${visibleCount}` : ''}
        </span>
      </div>
    </div>
  );
}
