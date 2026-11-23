import { APP_CONFIG } from '../../shared/config';
import { LEVEL_META, ROLE_ICONS, SYMPTOM_ICONS } from '../../shared/taxonomy';
import type { FieldReportResponse } from '../../shared/types';
import type { Dictionary, Locale } from '../i18n/translations';
import {
  countryCodeToFlag,
  getCityDisplayName,
  getCountryName,
} from './format';

const LEVEL_STEP_COLORS: Record<0 | 1 | 2 | 3, string> = {
  0: '#4f46e5',
  1: '#0891b2',
  2: '#10b981',
  3: '#eab308',
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/**
 * Generates a crisp 1080x1080 shareable PNG result card for social media / Stories / Telegram.
 */
export async function downloadShareCard(
  report: FieldReportResponse,
  locale: Locale,
  t: Dictionary,
): Promise<void> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { signal, comparison } = report;
  const fontFamily = '"Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const accentColor = LEVEL_STEP_COLORS[signal.level];

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#070b14');
  bg.addColorStop(0.55, '#0b1324');
  bg.addColorStop(1, '#070d1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle ambient radial glow matching user's level
  const glow = ctx.createRadialGradient(W / 2, 340, 40, W / 2, 340, 520);
  glow.addColorStop(0, `${accentColor}33`);
  glow.addColorStop(1, 'rgba(7, 11, 20, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Outer subtle card border
  drawRoundedRect(ctx, 48, 48, W - 96, H - 96, 44);
  ctx.fillStyle = 'rgba(13, 21, 38, 0.72)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
  ctx.stroke();

  // Top brand header
  ctx.fillStyle = '#38bdf8';
  ctx.font = `700 28px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(APP_CONFIG.brandName, W / 2, 128);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 22px ${fontFamily}`;
  ctx.fillText(t.taglineShort, W / 2, 164);

  // Emoji badge
  drawRoundedRect(ctx, W / 2 - 72, 214, 144, 144, 36);
  ctx.fillStyle = `${accentColor}26`;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `${accentColor}70`;
  ctx.stroke();

  ctx.font = '82px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(LEVEL_META[signal.level].emoji, W / 2, 290);
  ctx.textBaseline = 'alphabetic';

  // Verdict title
  const verdict = t.verdicts[signal.level];
  const primarySymptom = signal.symptoms[0];
  const quip = primarySymptom ? t.symptomQuips[primarySymptom] : verdict.subtitle;

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 58px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.fillText(verdict.title, W / 2, 444, W - 160);

  // Playful subtitle / quip
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `500 30px ${fontFamily}`;
  const quipLines = wrapText(ctx, quip, W - 200, 2);
  quipLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 496 + i * 40, W - 180);
  });

  // 4-step Viridis meter
  const meterW = 680;
  const meterX = (W - meterW) / 2;
  const meterY = 594;
  const gap = 16;
  const stepW = (meterW - gap * 3) / 4;

  ([0, 1, 2, 3] as const).forEach((lvl) => {
    const x = meterX + lvl * (stepW + gap);
    const isFilled = lvl <= signal.level;
    const isCurrent = lvl === signal.level;

    drawRoundedRect(ctx, x, meterY, stepW, 18, 9);
    ctx.fillStyle = isFilled ? LEVEL_STEP_COLORS[lvl] : 'rgba(51, 65, 85, 0.7)';
    ctx.fill();

    ctx.fillStyle = isCurrent ? '#ffffff' : '#64748b';
    ctx.font = `${isCurrent ? 700 : 500} 21px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(t.levelLabels[lvl].title, x + stepW / 2, meterY + 50, stepW);
  });

  // Tag pills (location + up to 2 areas/symptoms)
  const countryName = getCountryName(signal.countryCode, locale);
  const localizedCity = signal.cityName
    ? getCityDisplayName(signal.cityName, signal.countryCode, locale)
    : null;
  const locationText = `${countryCodeToFlag(signal.countryCode)} ${localizedCity ? `${localizedCity}, ` : ''}${countryName}`;

  const pills: string[] = [locationText];
  if (signal.domains[0]) {
    pills.push(`${ROLE_ICONS[signal.domains[0]]} ${t.roleLabels[signal.domains[0]]}`);
  }
  if (signal.symptoms[0]) {
    pills.push(`${SYMPTOM_ICONS[signal.symptoms[0]]} ${t.symptomLabels[signal.symptoms[0]].title}`);
  }

  ctx.font = `600 24px ${fontFamily}`;
  const pillMetrics = pills.map((label) => ({
    label,
    w: Math.min(440, ctx.measureText(label).width + 44),
  }));
  const rowGap = 14;
  const totalPillsW =
    pillMetrics.reduce((acc, p) => acc + p.w, 0) + rowGap * (pillMetrics.length - 1);

  if (totalPillsW <= W - 160) {
    let px = (W - totalPillsW) / 2;
    for (const pill of pillMetrics) {
      drawRoundedRect(ctx, px, 686, pill.w, 52, 26);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(pill.label, px + pill.w / 2, 720, pill.w - 24);
      px += pill.w + rowGap;
    }
  } else {
    // Fallback: draw location pill centered on row 1
    const first = pillMetrics[0];
    const px = (W - first.w) / 2;
    drawRoundedRect(ctx, px, 686, first.w, 52, 26);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(first.label, W / 2, 720, first.w - 24);
  }

  // Comparison box (Country if calibrated, else Global)
  const countryStat = comparison.country;
  const useCountry = Boolean(countryStat && countryStat.strength >= 2);
  const compPct = useCountry
    ? countryStat!.aiUserShare
    : comparison.globalAiUserShare;
  const compLabel = useCountry
    ? `${countryCodeToFlag(signal.countryCode)} ${countryName}`
    : `🌐 ${APP_CONFIG.brandName}`;
  const filledDots = Math.round(compPct / 10);

  drawRoundedRect(ctx, 112, 782, W - 224, 152, 28);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = `700 20px ${fontFamily}`;
  ctx.fillText(t.reportAroundYou.toUpperCase(), 150, 824);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 28px ${fontFamily}`;
  ctx.fillText(compLabel, 150, 864, 380);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = `800 28px ${fontFamily}`;
  ctx.fillText(
    `${t.reportOutOfTen.replace('{n}', String(filledDots))} · ${compPct}%`,
    W - 150,
    864,
    420,
  );

  // 10-dot unit chart
  const dotY = 900;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(162 + i * 36, dotY, 10, 0, Math.PI * 2);
    ctx.fillStyle = i < filledDots ? '#38bdf8' : 'rgba(51, 65, 85, 0.85)';
    ctx.fill();
  }

  // Footer host watermark
  const host =
    typeof window !== 'undefined' && window.location.host
      ? window.location.host
      : 'hows-ai-going';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = `600 22px ${fontFamily}`;
  ctx.fillText(host, W / 2, 990);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png'),
  );
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hows-ai-going-${signal.countryCode.toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
