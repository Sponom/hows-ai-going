import { useEffect } from 'react';
import { ArrowRight, Globe2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import type { Dictionary } from '../i18n/translations';
import { BrandLogo } from './Logo';

interface AboutModalProps {
  open: boolean;
  hasSubmitted: boolean;
  onClose: () => void;
  onStartSurvey: () => void;
  onOpenFeedback: () => void;
  t: Dictionary;
}

export function AboutModal({
  open,
  hasSubmitted,
  onClose,
  onStartSurvey,
  onOpenFeedback,
  t,
}: AboutModalProps) {
  const { mounted, closing } = useAnimatedModal(open);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className={`${
        closing ? 'animate-modal-backdrop-out pointer-events-none' : 'animate-modal-backdrop'
      } fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4`}
      onClick={onClose}
    >
      <div
        className={`${
          closing ? 'animate-modal-surface-out' : 'animate-modal-surface'
        } relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0d1424] sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile sheet handle */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-10 shrink-0" />
            <div>
              <h2
                id="about-modal-title"
                className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                {t.aboutTitle}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t.taglineShort}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.a11yClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t.aboutLead}
          </p>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.aboutPointMapTitle}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.aboutPointMapDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.aboutPointAnonTitle}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.aboutPointAnonDesc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-yellow-400">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.aboutPointJoinTitle}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {t.aboutPointJoinDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {!hasSubmitted ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartSurvey();
                  }}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 text-sm font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-105 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>{t.ctaReport}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t.aboutGotIt}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFeedback();
            }}
            className="w-full py-1 text-center text-xs font-semibold text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
          >
            {t.aboutFeedbackLink} →
          </button>
        </div>
      </div>
    </div>
  );
}
