import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Globe2,
  Info,
  MessageSquarePlus,
  Moon,
  Share2,
  Sun,
} from 'lucide-react';
import { APP_CONFIG } from '../../shared/config';
import { LOCALES, type Dictionary, type Locale } from '../i18n/translations';
import { BrandLogo } from './Logo';
import { Tooltip } from './Tooltip';

interface TopBarProps {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAbout: () => void;
  onOpenShare: () => void;
  onOpenFeedback: () => void;
  t: Dictionary;
}

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  'pt-BR': 'Português',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
};

export function TopBar({
  locale,
  onChangeLocale,
  theme,
  onToggleTheme,
  onOpenAbout,
  onOpenShare,
  onOpenFeedback,
  t,
}: TopBarProps) {
  const [langOpen, setLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!langOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langOpen]);

  const currentLocaleLabel =
    LOCALES.find((l) => l.code === locale)?.label ?? locale.toUpperCase();

  return (
    <header className="relative z-30 flex items-center justify-between gap-2 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#080d18]/90">
      {/* Brand block aligned pixel-for-pixel with left sidebar width (356px on lg+) */}
      <div className="flex min-w-0 flex-1 items-center">
        <button
          type="button"
          onClick={onOpenAbout}
          aria-label={`${APP_CONFIG.brandName} — ${t.aboutBtn}`}
          className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left transition hover:opacity-85 active:opacity-75 sm:gap-2.5 sm:px-4 sm:py-2.5 lg:w-[356px] lg:flex-none lg:shrink-0 lg:border-r lg:border-slate-200/90 lg:dark:border-slate-800/80"
        >
          <BrandLogo className="h-8 w-8 shrink-0 drop-shadow-sm sm:h-9 sm:w-9" />
          <div className="min-w-0">
            <div className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-base">
              {APP_CONFIG.brandName}
            </div>
            <p className="truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400 sm:hidden">
              {t.taglineShort}
            </p>
            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t.tagline}
            </p>
          </div>
        </button>
      </div>

      {/* Explicit Social (Share) + Feedback + About + Theme + Language */}
      <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 sm:gap-2 sm:px-5 sm:py-2.5">
        <Tooltip label={t.shareBtn} side="bottom">
          <button
            type="button"
            onClick={onOpenShare}
            aria-label={t.shareBtn}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 transition hover:border-cyan-400/70 hover:bg-cyan-50/80 hover:text-cyan-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/50 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-200 sm:h-9 sm:px-2.5"
          >
            <Share2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span className="hidden md:inline">{t.shareBtn}</span>
          </button>
        </Tooltip>

        <Tooltip label={t.feedbackBtn} side="bottom">
          <button
            type="button"
            onClick={onOpenFeedback}
            aria-label={t.feedbackBtn}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white sm:h-9 sm:px-2.5"
          >
            <MessageSquarePlus className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <span className="hidden md:inline">{t.feedbackBtn}</span>
          </button>
        </Tooltip>

        <div className="hidden sm:block">
          <Tooltip label={t.aboutBtn} side="bottom">
            <button
              type="button"
              onClick={onOpenAbout}
              aria-label={t.aboutBtn}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        <Tooltip
          label={theme === 'dark' ? t.themeLight : t.themeDark}
          side="bottom"
        >
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white sm:h-9 sm:w-9"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </Tooltip>

        <div ref={langMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setLangOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            aria-label={t.a11yLanguage}
            className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800 sm:h-9 sm:gap-1.5 sm:px-2.5"
          >
            <Globe2 className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>{currentLocaleLabel}</span>
            <ChevronDown
              aria-hidden="true"
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                langOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {langOpen && (
            <div
              role="listbox"
              className="absolute right-0 top-10 z-50 w-40 space-y-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-[#0d1424] sm:top-11"
            >
              {LOCALES.map((loc) => {
                const selected = loc.code === locale;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChangeLocale(loc.code);
                      setLangOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                      selected
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-bold opacity-60">
                        {loc.label}
                      </span>
                      <span>{LOCALE_NAMES[loc.code]}</span>
                    </span>
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
