import { getLocalizedCityName } from '../../shared/geo-codes';
import type { Locale } from '../i18n/translations';

const regionFormatterCache = new Map<string, Intl.DisplayNames>();

export function getCountryName(countryCode: string, locale: Locale): string {
  const code = countryCode.toUpperCase();
  try {
    let fmt = regionFormatterCache.get(locale);
    if (!fmt) {
      fmt = new Intl.DisplayNames([locale], { type: 'region' });
      regionFormatterCache.set(locale, fmt);
    }
    return fmt.of(code) ?? code;
  } catch {
    return code;
  }
}

export function getCityDisplayName(
  cityName: string,
  countryCode: string,
  locale: Locale,
): string {
  return getLocalizedCityName(cityName, countryCode, locale);
}

export function countryCodeToFlag(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return '🌐';
  const offset = 127397;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset,
  );
}

/**
 * Viridis-inspired cartographic scale (perceptually uniform, colorblind-safe, no red-alert bias):
 * 0% indigo (#4f46e5) -> 35% deep cyan (#0891b2) -> 70% emerald (#10b981) -> 100% warm gold (#eab308)
 */
export function indexToColor(pct: number): string {
  const t = Math.max(0, Math.min(100, pct)) / 100;
  const stops: [number, [number, number, number]][] = [
    [0, [79, 70, 229]],
    [0.35, [8, 145, 178]],
    [0.7, [16, 185, 129]],
    [1, [234, 179, 8]],
  ];
  const lerp = (a: number, b: number, f: number) => Math.round(a + (b - a) * f);
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      return `rgb(${lerp(c0[0], c1[0], f)}, ${lerp(c0[1], c1[1], f)}, ${lerp(c0[2], c1[2], f)})`;
    }
  }
  return 'rgb(234, 179, 8)';
}

export const MIN_VISIBLE_COUNT = 100;

/**
 * Hides small raw counts (< 100) so early samples rely on signal-strength indicators;
 * once a country/city/area reaches 100+ answers, formats cleanly (e.g. 142, 1.2K).
 */
export function formatVisibleCount(
  count: number,
  locale: Locale,
  template: string,
): string | null {
  if (count < MIN_VISIBLE_COUNT) return null;
  const formatted =
    count >= 1000
      ? new Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(count)
      : count.toLocaleString(locale);
  return template.replace('{n}', formatted);
}

export function formatTimeAgo(timestampMs: number, locale: Locale): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    if (diffSec < 60) return rtf.format(-Math.max(1, diffSec), 'second');
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return rtf.format(-diffMin, 'minute');
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return rtf.format(-diffHr, 'hour');
    const diffDay = Math.floor(diffHr / 24);
    return rtf.format(-diffDay, 'day');
  } catch {
    if (diffSec < 60) return `${diffSec}s`;
    return `${Math.floor(diffSec / 60)}m`;
  }
}
