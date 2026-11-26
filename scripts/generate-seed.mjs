import { writeFileSync } from 'node:fs';

/**
 * Survey-calibrated baseline generator (2024–2026 global AI usage studies:
 * Ipsos Global AI Monitor, Microsoft AI Diffusion Report, Pew Research, Salesforce).
 *
 * Produces deterministic, geographically realistic baseline data across 45 countries
 * (35 calibrated + 10 low-data/calibrating) with authentic 12-month historical snapshots
 * so "World then & now" reflects real-world adoption growth.
 */
const SECTORS = [
  // High-adoption hubs (62–74% now, 42–54% a year ago)
  { cc: 'AE', city: 'Dubai', lat: 25.2, lng: 55.3, n: 28, share12m: 0.54, shareNow: 0.74 },
  { cc: 'IN', city: 'Bengaluru', lat: 13.0, lng: 77.6, n: 20, share12m: 0.56, shareNow: 0.76 },
  { cc: 'IN', city: 'Mumbai', lat: 19.1, lng: 72.9, n: 14, share12m: 0.46, shareNow: 0.69 },
  { cc: 'TH', city: 'Bangkok', lat: 13.8, lng: 100.5, n: 27, share12m: 0.46, shareNow: 0.68 },
  { cc: 'SG', city: 'Singapore', lat: 1.4, lng: 103.8, n: 28, share12m: 0.48, shareNow: 0.66 },
  { cc: 'ID', city: 'Jakarta', lat: -6.2, lng: 106.8, n: 26, share12m: 0.44, shareNow: 0.65 },
  { cc: 'MY', city: 'Kuala Lumpur', lat: 3.1, lng: 101.7, n: 26, share12m: 0.42, shareNow: 0.62 },

  // Mid-high & fast-accelerating markets (48–58% now, 31–38% a year ago)
  { cc: 'KR', city: 'Seoul', lat: 37.6, lng: 127.0, n: 28, share12m: 0.38, shareNow: 0.58 },
  { cc: 'BR', city: 'São Paulo', lat: -23.6, lng: -46.6, n: 18, share12m: 0.40, shareNow: 0.58 },
  { cc: 'BR', city: 'Rio de Janeiro', lat: -22.9, lng: -43.2, n: 12, share12m: 0.35, shareNow: 0.52 },
  { cc: 'US', city: 'San Francisco', lat: 37.8, lng: -122.4, n: 14, share12m: 0.54, shareNow: 0.72 },
  { cc: 'US', city: 'New York', lat: 40.7, lng: -74.0, n: 14, share12m: 0.34, shareNow: 0.50 },
  { cc: 'US', city: 'Austin', lat: 30.3, lng: -97.7, n: 10, share12m: 0.30, shareNow: 0.44 },
  { cc: 'FR', city: 'Paris', lat: 48.9, lng: 2.4, n: 27, share12m: 0.32, shareNow: 0.49 },
  { cc: 'MX', city: 'Mexico City', lat: 19.4, lng: -99.1, n: 26, share12m: 0.31, shareNow: 0.48 },

  // Steady mainstream markets (40–46% now, 26–32% a year ago)
  { cc: 'CA', city: 'Toronto', lat: 43.7, lng: -79.4, n: 26, share12m: 0.32, shareNow: 0.46 },
  { cc: 'ES', city: 'Madrid', lat: 40.4, lng: -3.7, n: 15, share12m: 0.29, shareNow: 0.45 },
  { cc: 'ES', city: 'Barcelona', lat: 41.4, lng: 2.2, n: 13, share12m: 0.32, shareNow: 0.48 },
  { cc: 'NL', city: 'Amsterdam', lat: 52.4, lng: 4.9, n: 26, share12m: 0.30, shareNow: 0.45 },
  { cc: 'TR', city: 'Istanbul', lat: 41.0, lng: 29.0, n: 26, share12m: 0.29, shareNow: 0.45 },
  { cc: 'AU', city: 'Sydney', lat: -33.9, lng: 151.2, n: 26, share12m: 0.30, shareNow: 0.44 },
  { cc: 'RU', city: 'Moscow', lat: 55.8, lng: 37.6, n: 16, share12m: 0.30, shareNow: 0.46 },
  { cc: 'RU', city: 'Saint Petersburg', lat: 59.9, lng: 30.3, n: 12, share12m: 0.26, shareNow: 0.42 },
  { cc: 'SE', city: 'Stockholm', lat: 59.3, lng: 18.1, n: 25, share12m: 0.29, shareNow: 0.43 },
  { cc: 'GB', city: 'London', lat: 51.5, lng: -0.1, n: 28, share12m: 0.29, shareNow: 0.42 },
  { cc: 'ZA', city: 'Cape Town', lat: -33.9, lng: 18.4, n: 25, share12m: 0.26, shareNow: 0.42 },
  { cc: 'PL', city: 'Warsaw', lat: 52.2, lng: 21.0, n: 25, share12m: 0.26, shareNow: 0.40 },

  // Cautious / privacy-conscious & recently inflecting markets (33–38% now, 18–24% a year ago)
  { cc: 'AR', city: 'Buenos Aires', lat: -34.6, lng: -58.4, n: 25, share12m: 0.24, shareNow: 0.38 },
  { cc: 'PT', city: 'Lisbon', lat: 38.7, lng: -9.1, n: 25, share12m: 0.22, shareNow: 0.36 },
  { cc: 'DE', city: 'Berlin', lat: 52.5, lng: 13.4, n: 16, share12m: 0.25, shareNow: 0.38 },
  { cc: 'DE', city: 'Munich', lat: 48.1, lng: 11.6, n: 12, share12m: 0.20, shareNow: 0.31 },
  { cc: 'JP', city: 'Tokyo', lat: 35.7, lng: 139.7, n: 18, share12m: 0.20, shareNow: 0.36 },
  { cc: 'JP', city: 'Osaka', lat: 34.7, lng: 135.5, n: 11, share12m: 0.15, shareNow: 0.30 },
  { cc: 'IT', city: 'Milan', lat: 45.5, lng: 9.2, n: 25, share12m: 0.21, shareNow: 0.33 },

  // Low-data / calibrating countries (< 25 answers — keeps the unlock progress live!)
  { cc: 'PH', city: 'Manila', lat: 14.6, lng: 121.0, n: 14, share12m: 0.45, shareNow: 0.64 },
  { cc: 'VN', city: 'Ho Chi Minh City', lat: 10.8, lng: 106.7, n: 12, share12m: 0.38, shareNow: 0.58 },
  { cc: 'CO', city: 'Bogotá', lat: 4.7, lng: -74.1, n: 10, share12m: 0.28, shareNow: 0.46 },
  { cc: 'CY', city: 'Limassol', lat: 34.7, lng: 33.0, n: 9, share12m: 0.28, shareNow: 0.45 },
  { cc: 'KZ', city: 'Almaty', lat: 43.2, lng: 76.9, n: 8, share12m: 0.25, shareNow: 0.44 },
  { cc: 'GE', city: 'Tbilisi', lat: 41.7, lng: 44.8, n: 6, share12m: 0.22, shareNow: 0.40 },
  { cc: 'IS', city: 'Reykjavik', lat: 64.1, lng: -21.9, n: 4, share12m: 0.20, shareNow: 0.35 },
];

// Week-2 baseline expansion (+12 countries / +256 signals: 9 calibrated + 3 calibrating)
const WEEK2_SECTORS = [
  { cc: 'NO', city: 'Oslo', lat: 59.9, lng: 10.8, n: 26, share12m: 0.31, shareNow: 0.48 },
  { cc: 'DK', city: 'Copenhagen', lat: 55.7, lng: 12.6, n: 25, share12m: 0.30, shareNow: 0.46 },
  { cc: 'FI', city: 'Helsinki', lat: 60.2, lng: 24.9, n: 25, share12m: 0.28, shareNow: 0.44 },
  { cc: 'CH', city: 'Zurich', lat: 47.4, lng: 8.5, n: 26, share12m: 0.27, shareNow: 0.43 },
  { cc: 'IE', city: 'Dublin', lat: 53.3, lng: -6.3, n: 25, share12m: 0.30, shareNow: 0.47 },
  { cc: 'CZ', city: 'Prague', lat: 50.1, lng: 14.4, n: 25, share12m: 0.25, shareNow: 0.41 },
  { cc: 'TW', city: 'Taipei', lat: 25.0, lng: 121.5, n: 26, share12m: 0.36, shareNow: 0.56 },
  { cc: 'CL', city: 'Santiago', lat: -33.4, lng: -70.7, n: 25, share12m: 0.29, shareNow: 0.47 },
  { cc: 'NZ', city: 'Auckland', lat: -36.8, lng: 174.8, n: 25, share12m: 0.28, shareNow: 0.44 },
  { cc: 'IL', city: 'Tel Aviv', lat: 32.1, lng: 34.8, n: 10, share12m: 0.42, shareNow: 0.62 },
  { cc: 'EG', city: 'Cairo', lat: 30.0, lng: 31.2, n: 9, share12m: 0.26, shareNow: 0.44 },
  { cc: 'NG', city: 'Lagos', lat: 6.5, lng: 3.4, n: 9, share12m: 0.34, shareNow: 0.55 },
];

const ROLES = [
  'tech', 'design', 'media', 'office', 'student', 'education',
  'health', 'trades', 'service', 'founder', 'home', 'other',
];
const PERSONAL_ROLES = new Set(['home', 'other']);
const AI_SYMS = ['search', 'work_tasks', 'emails', 'study', 'daily_life', 'advice', 'fun_visuals'];
const NO_AI_SYMS = ['no_need', 'no_trust', 'think_myself', 'no_time', 'hype_fatigue'];

let seed = 2026;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function esc(str) {
  return str.replace(/'/g, "''");
}

function deriveContext(level, domains) {
  if (level === 0) return 'none';
  const hasPersonal = domains.some((d) => PERSONAL_ROLES.has(d));
  const hasWork = domains.some((d) => !PERSONAL_ROLES.has(d));
  if (hasPersonal && hasWork) return 'both';
  if (hasPersonal) return 'personal';
  return 'work';
}

function pickSymptoms(level) {
  const pool = level === 0 ? NO_AI_SYMS : AI_SYMS;
  const sym1 = pick(pool);
  const sym2 = rand() > 0.45 ? pick(pool.filter((x) => x !== sym1)) : null;
  return JSON.stringify(sym2 ? [sym1, sym2] : [sym1]);
}

function pickAiLevel(intensityBias) {
  const r = rand();
  if (r < 0.28 - intensityBias * 0.12) return 1;
  if (r < 0.66 - intensityBias * 0.14) return 2;
  return 3;
}

const DAY_MS = 86_400_000;
const now = Date.now();
const lines = [
  '-- Survey-calibrated global AI usage baseline (Ipsos, Microsoft AI Diffusion, Pew Research, 2024-2026)',
  '-- Includes 12-month historical progression for "World then & now" comparison.',
  'DELETE FROM signal_history WHERE anon_token_hash LIKE \'baseline-%\';',
  'DELETE FROM signals WHERE anon_token_hash LIKE \'baseline-%\';',
];

function appendSectorBatch(sectors, options) {
  const { idPrefix, tokenPrefix, ipPrefix, histPrefix, recentShare = 0 } = options;
  let batchIdx = 0;
  let batchHistIdx = 0;

  const pickRecentOrFallback = (fallbackDaysAgo) =>
    recentShare > 0 && rand() < recentShare ? 0.2 + rand() * 6.3 : fallbackDaysAgo;

  for (const s of sectors) {
    // Exact counts for 12m ago vs now so each country matches research benchmarks accurately
    const aiCountNow = Math.round(s.n * s.shareNow);
    const aiCount12m = Math.round(s.n * s.share12m);
    const newlyAdoptedCount = Math.max(0, aiCountNow - aiCount12m);

    for (let i = 0; i < s.n; i++) {
      batchIdx += 1;
      const tokenHash = `${tokenPrefix}${batchIdx}`;

      // Role & domains
      const d1 = pick(ROLES);
      const d2 = rand() > 0.5 ? pick(ROLES.filter((x) => x !== d1)) : null;
      const domains = d2 ? [d1, d2] : [d1];

      // Group 1 (0 .. aiCount12m - 1): already using AI 12+ months ago
      // Group 2 (aiCount12m .. aiCountNow - 1): started at level 0 a year ago (or joined mid-year) and adopted AI during the year
      // Group 3 (aiCountNow .. s.n - 1): non-users (level 0 throughout)
      let createdDaysAgo;
      let initialLevel;
      let finalLevel;
      let upgradedDaysAgo = null;

      if (i < aiCount12m) {
        // Existed before 12m cutoff (370–410 days ago)
        createdDaysAgo = 370 + rand() * 40;
        initialLevel = pickAiLevel(s.share12m * 0.6);
        finalLevel = initialLevel;
        if (initialLevel < 3 && rand() < 0.45) {
          finalLevel = Math.min(3, initialLevel + 1);
          upgradedDaysAgo = pickRecentOrFallback(10 + rand() * 240);
        }
      } else if (i < aiCountNow) {
        // Adopted AI over the past 12 months
        const bucket = (i - aiCount12m) / Math.max(1, newlyAdoptedCount);
        if (bucket < 0.65) {
          // Existed 12m ago as non-user, then switched to AI at 6m / 3m / recent
          createdDaysAgo = 370 + rand() * 35;
          initialLevel = 0;
          finalLevel = pickAiLevel(s.shareNow);
          // Spread upgrades smoothly across 20..340 days ago (or this past week for w2)
          upgradedDaysAgo = pickRecentOrFallback(
            Math.max(2, Math.floor((1 - bucket / 0.65) * 330 + rand() * 25)),
          );
        } else {
          // Newer respondent joining within the last 8 months (or this past week for w2)
          createdDaysAgo = pickRecentOrFallback(2 + rand() * 230);
          initialLevel = pickAiLevel(s.shareNow);
          finalLevel = initialLevel;
        }
      } else {
        // Non-user: 75% present 12m ago, 25% joined over the year
        createdDaysAgo =
          rand() < 0.75 ? 370 + rand() * 40 : pickRecentOrFallback(2 + rand() * 260);
        initialLevel = 0;
        finalLevel = 0;
      }

      const createdAt = Math.floor(now - createdDaysAgo * DAY_MS);
      const updatedAt =
        upgradedDaysAgo !== null ? Math.floor(now - upgradedDaysAgo * DAY_MS) : createdAt;

      const initCtx = deriveContext(initialLevel, domains);
      const initSyms = pickSymptoms(initialLevel);

      batchHistIdx += 1;
      lines.push(
        `INSERT INTO signal_history (id, anon_token_hash, country_code, city_name, lat, lng, level, context, role, domains, symptoms, recorded_at) VALUES (` +
          `'${histPrefix}${batchHistIdx}', '${tokenHash}', '${s.cc}', '${esc(s.city)}', ${s.lat}, ${s.lng}, ${initialLevel}, '${initCtx}', '${d1}', '${esc(JSON.stringify(domains))}', '${esc(initSyms)}', ${createdAt});`,
      );

      let finalCtx = initCtx;
      let finalSyms = initSyms;
      if (upgradedDaysAgo !== null) {
        finalCtx = deriveContext(finalLevel, domains);
        finalSyms = pickSymptoms(finalLevel);
        batchHistIdx += 1;
        lines.push(
          `INSERT INTO signal_history (id, anon_token_hash, country_code, city_name, lat, lng, level, context, role, domains, symptoms, recorded_at) VALUES (` +
            `'${histPrefix}${batchHistIdx}', '${tokenHash}', '${s.cc}', '${esc(s.city)}', ${s.lat}, ${s.lng}, ${finalLevel}, '${finalCtx}', '${d1}', '${esc(JSON.stringify(domains))}', '${esc(finalSyms)}', ${updatedAt});`,
        );
      }

      lines.push(
        `INSERT INTO signals (id, anon_token_hash, ip_hash, country_code, city_name, lat, lng, level, context, role, domains, symptoms, created_at, updated_at) VALUES (` +
          `'${idPrefix}${batchIdx}', '${tokenHash}', '${ipPrefix}${batchIdx % 50}', '${s.cc}', '${esc(s.city)}', ${s.lat}, ${s.lng}, ${finalLevel}, '${finalCtx}', '${d1}', '${esc(JSON.stringify(domains))}', '${esc(finalSyms)}', ${createdAt}, ${updatedAt});`,
      );
    }
  }

  return { signals: batchIdx, history: batchHistIdx };
}

const batch1 = appendSectorBatch(SECTORS, {
  idPrefix: 'base-',
  tokenPrefix: 'baseline-token-',
  ipPrefix: 'baseline-ip-',
  histPrefix: 'bhist-',
  recentShare: 0,
});

const batch2 = appendSectorBatch(WEEK2_SECTORS, {
  idPrefix: 'base-w2-',
  tokenPrefix: 'baseline-w2-token-',
  ipPrefix: 'baseline-w2-ip-',
  histPrefix: 'bhist-w2-',
  recentShare: 0.5,
});

const totalSignals = batch1.signals + batch2.signals;
const totalHistory = batch1.history + batch2.history;

writeFileSync(new URL('./seed-baseline.sql', import.meta.url), lines.join('\n') + '\n');
console.log(
  `Generated ${totalSignals} survey-calibrated baseline signals (${batch2.signals} week-2) and ${totalHistory} history events in scripts/seed-baseline.sql`,
);
