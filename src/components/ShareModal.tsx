import { useEffect, useState } from 'react';
import { Check, Copy, Link2, Share2, X } from 'lucide-react';
import { APP_CONFIG } from '../../shared/config';
import { useAnimatedModal } from '../hooks/useAnimatedModal';
import type { Dictionary } from '../i18n/translations';

interface ShareModalProps {
  open: boolean;
  shareUrl: string;
  shareText: string;
  onClose: () => void;
  t: Dictionary;
}

export function ShareModal({
  open,
  shareUrl,
  shareText,
  onClose,
  t,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { mounted, closing } = useAnimatedModal(open);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const channels = [
    {
      id: 'telegram',
      label: 'Telegram',
      badge: 'TG',
      color: 'bg-[#229ED9]/15 text-[#0284c7] dark:bg-[#229ED9]/20 dark:text-[#38bdf8]',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'x',
      label: 'X / Twitter',
      badge: '𝕏',
      color: 'bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      badge: 'WA',
      color: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      badge: 'in',
      color: 'bg-blue-600/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: APP_CONFIG.brandName,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
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
              id="share-modal-title"
              className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              {t.shareTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t.shareSubtitle}
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

        <div className="space-y-4 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {/* Preview quote */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            {shareText}
          </div>

          {/* 4 Social channel buttons */}
          <div className="grid grid-cols-2 gap-2">
            {channels.map((ch) => (
              <a
                key={ch.id}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${ch.color}`}
                >
                  {ch.badge}
                </span>
                <span>{ch.label}</span>
              </a>
            ))}
          </div>

          {/* Copy deep-link bar */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900/70">
            <Link2 className="ml-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-600 outline-none dark:text-slate-300"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.shareCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.shareCopyLink}</span>
                </>
              )}
            </button>
          </div>

          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t.shareNativeBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
