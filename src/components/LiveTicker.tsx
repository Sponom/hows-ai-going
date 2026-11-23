import { LEVEL_META, ROLE_ICONS, SYMPTOM_ICONS } from '../../shared/taxonomy';
import type { RecentSignal } from '../../shared/types';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  formatTimeAgo,
  getCityDisplayName,
  getCountryName,
} from '../utils/format';

interface LiveTickerProps {
  recent: RecentSignal[];
  locale: Locale;
  t: Dictionary;
}

export function LiveTicker({ recent, locale, t }: LiveTickerProps) {
  if (recent.length === 0) {
    return (
      <footer className="relative z-20 hidden h-10 items-center gap-3 border-t border-slate-200 bg-white/95 px-4 text-xs text-slate-500 dark:border-slate-800/80 dark:bg-[#070c16]/95 dark:text-slate-400 sm:flex">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {t.tickerLive}
        </span>
        <span className="truncate">{t.tickerEmpty}</span>
      </footer>
    );
  }

  const items = [...recent, ...recent];

  return (
    <footer className="relative z-20 hidden h-10 items-center overflow-hidden border-t border-slate-200 bg-white/95 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-[#070c16]/95 dark:text-slate-300 sm:flex">
      <div className="z-10 flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold tracking-wide text-emerald-600 dark:border-slate-800 dark:bg-[#070c16] dark:text-emerald-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        {t.tickerLive}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="ticker-track">
          {items.map((sig, i) => {
            const place = sig.cityName
              ? `${getCityDisplayName(sig.cityName, sig.countryCode, locale)}, ${getCountryName(sig.countryCode, locale)}`
              : getCountryName(sig.countryCode, locale);
            const symptomTitle = sig.symptom
              ? `${SYMPTOM_ICONS[sig.symptom]} ${t.symptomLabels[sig.symptom].title}`
              : t.levelLabels[sig.level].title;

            return (
              <div
                key={`${sig.id}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap px-4 text-xs"
              >
                <span className="text-slate-400 dark:text-slate-500">
                  {formatTimeAgo(sig.createdAt, locale)}
                </span>
                <span>{countryCodeToFlag(sig.countryCode)}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {place}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {ROLE_ICONS[sig.role]} {t.roleLabels[sig.role]}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>{LEVEL_META[sig.level].emoji}</span>
                <span className="text-slate-700 dark:text-slate-200">{symptomTitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
