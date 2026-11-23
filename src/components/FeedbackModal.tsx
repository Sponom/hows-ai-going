import { useEffect, useState } from 'react';
import { CheckCircle2, Send, X } from 'lucide-react';
import { FEEDBACK_KINDS, type FeedbackKind } from '../../shared/types';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import type { Dictionary } from '../i18n/translations';

interface FeedbackModalProps {
  open: boolean;
  context: Record<string, string | number | boolean | null>;
  onClose: () => void;
  t: Dictionary;
}

const KIND_EMOJIS: Record<FeedbackKind, string> = {
  idea: '💡',
  bug: '🐛',
  data: '🗺️',
  other: '💬',
};

export function FeedbackModal({
  open,
  context,
  onClose,
  t,
}: FeedbackModalProps) {
  const [kind, setKind] = useState<FeedbackKind>('idea');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { mounted, closing } = useAnimatedModal(open);

  useEffect(() => {
    if (!open) return;
    setSent(false);
    setErr(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3 || submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          contact: contact.trim() || null,
          context,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setSent(true);
      setMessage('');
      setContact('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
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
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div>
            <h2
              id="feedback-modal-title"
              className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              {t.feedbackTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.feedbackSubtitle}
            </p>
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

        <div className="overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">
                {t.feedbackThanksTitle}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t.feedbackThanksDesc}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {t.feedbackDone}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Category selector */}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {FEEDBACK_KINDS.map((k) => {
                  const selected = kind === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                        selected
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span aria-hidden="true">{KIND_EMOJIS[k]}</span>
                      <span className="truncate">{t.feedbackKinds[k]}</span>
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={4}
                required
                minLength={3}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.feedbackPlaceholder}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
              />

              <input
                type="text"
                maxLength={120}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.feedbackContactPlaceholder}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-900"
              />

              {err && (
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || message.trim().length < 3}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-4 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>{submitting ? t.feedbackSending : t.feedbackSend}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
