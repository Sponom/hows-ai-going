import { Hono } from 'hono';
import { APP_CONFIG } from '../shared/config';
import { ALPHA2_SET, roundCoord } from '../shared/geo-codes';
import {
  AI_SYMPTOMS,
  NO_AI_REASONS,
  ROLES,
  deriveContextFromDomains,
  type RoleId,
  type SymptomId,
  type UsageContext,
  type UsageLevel,
} from '../shared/taxonomy';
import {
  FEEDBACK_KINDS,
  HISTORY_PERIODS,
  type FeedbackKind,
  type FeedbackSubmission,
  type HistoryPeriod,
  type SignalSubmission,
} from '../shared/types';
import { hashAnonToken, hashIpDaily } from './crypto';
import { buildRadarSnapshot, insertFeedback, upsertSignal } from './db';
import type { Env } from './env';
import { extractGeoFromRequest, sanitizeCityName } from './geo';

const app = new Hono<{ Bindings: Env }>();

const ROLE_SET = new Set<string>(ROLES);
const CONTEXT_SET = new Set<string>(['none', 'personal', 'work', 'both']);
const AI_SYMPTOM_SET = new Set<string>(AI_SYMPTOMS);
const NO_AI_REASON_SET = new Set<string>(NO_AI_REASONS);
const PERIOD_SET = new Set<string>(HISTORY_PERIODS);
const FEEDBACK_KIND_SET = new Set<string>(FEEDBACK_KINDS);

function getEdgeCache(): Cache | null {
  try {
    const cacheStorage = caches as unknown as { default?: Cache };
    return cacheStorage?.default ?? null;
  } catch {
    return null;
  }
}

function buildSnapshotCacheRequest(
  requestUrl: string,
  params: {
    role: string;
    symptom: string;
    context: string;
    period: string;
  },
): Request {
  const url = new URL('/api/snapshot', requestUrl);
  url.searchParams.set('role', params.role);
  url.searchParams.set('symptom', params.symptom);
  url.searchParams.set('context', params.context);
  url.searchParams.set('period', params.period);
  return new Request(url.toString(), { method: 'GET' });
}

function isAllowedWriteRequest(request: Request, appEnv?: string): boolean {
  if (appEnv !== 'production') return true;
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin === new URL(request.url).origin;
    } catch {
      return false;
    }
  }
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite === 'cross-site') {
    return false;
  }
  return true;
}

app.get('/api/health', (c) => {
  return c.json({ ok: true, brand: APP_CONFIG.brandName, ts: Date.now() });
});

app.get('/api/geo', (c) => {
  const geo = extractGeoFromRequest(c.req.raw);
  return c.json(geo, 200, {
    'Cache-Control': 'no-store',
  });
});

app.get('/api/snapshot', async (c) => {
  const rawRole = c.req.query('role') ?? 'all';
  const rawSymptom = c.req.query('symptom') ?? 'all';
  const rawContext = c.req.query('context') ?? 'all';
  const rawPeriod = c.req.query('period') ?? 'now';

  const role: RoleId | 'all' =
    rawRole !== 'all' && ROLE_SET.has(rawRole) ? (rawRole as RoleId) : 'all';
  const symptom: SymptomId | 'all' =
    rawSymptom !== 'all' &&
    (AI_SYMPTOM_SET.has(rawSymptom) || NO_AI_REASON_SET.has(rawSymptom))
      ? (rawSymptom as SymptomId)
      : 'all';
  const context: UsageContext | 'all' =
    rawContext !== 'all' && CONTEXT_SET.has(rawContext)
      ? (rawContext as UsageContext)
      : 'all';
  const period: HistoryPeriod = PERIOD_SET.has(rawPeriod)
    ? (rawPeriod as HistoryPeriod)
    : 'now';

  const edgeCache = getEdgeCache();
  const cacheKey = buildSnapshotCacheRequest(c.req.url, {
    role,
    symptom,
    context,
    period,
  });

  if (edgeCache) {
    try {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return cached;
      }
    } catch {
      // fallback to D1
    }
  }

  const snapshot = await buildRadarSnapshot(c.env.DB, {
    role,
    symptom,
    context,
    period,
  });

  const ttl = period === 'now' ? APP_CONFIG.snapshotCacheSeconds : 60;
  const response = c.json(snapshot, 200, {
    'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
  });

  if (edgeCache) {
    try {
      c.executionCtx.waitUntil(edgeCache.put(cacheKey, response.clone()));
    } catch {
      // ignore outside Workers executionCtx
    }
  }

  return response;
});

app.post('/api/signal', async (c) => {
  if (!isAllowedWriteRequest(c.req.raw, c.env.APP_ENV)) {
    return c.json({ error: 'Cross-site requests are not allowed' }, 403);
  }

  let body: Partial<SignalSubmission> & { role?: RoleId };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const anonToken =
    typeof body.anonToken === 'string' ? body.anonToken.trim() : '';
  if (anonToken.length < 8 || anonToken.length > 128) {
    return c.json({ error: 'Invalid anonymous token' }, 400);
  }

  const edgeGeo = extractGeoFromRequest(c.req.raw);
  const countryCode = (
    typeof body.countryCode === 'string' && body.countryCode.trim()
      ? body.countryCode.trim().toUpperCase()
      : edgeGeo.countryCode ?? ''
  ).toUpperCase();

  if (!ALPHA2_SET.has(countryCode)) {
    return c.json({ error: 'Valid ISO country code is required' }, 400);
  }

  const cityName =
    body.cityName === null
      ? null
      : typeof body.cityName === 'string'
        ? sanitizeCityName(body.cityName)
        : edgeGeo.cityName;

  const lat =
    cityName === null
      ? null
      : roundCoord(typeof body.lat === 'number' ? body.lat : edgeGeo.lat);
  const lng =
    cityName === null
      ? null
      : roundCoord(typeof body.lng === 'number' ? body.lng : edgeGeo.lng);

  const level = Number(body.level);
  if (!Number.isInteger(level) || level < 0 || level > 3) {
    return c.json({ error: 'Level must be an integer between 0 and 3' }, 400);
  }

  // Parse multi-select domains (1..5) with fallback to legacy `role`
  const rawDomains = Array.isArray(body.domains)
    ? body.domains
    : body.role
      ? [body.role]
      : [];
  const domains: RoleId[] = Array.from(
    new Set(
      rawDomains.filter(
        (d): d is RoleId => typeof d === 'string' && ROLE_SET.has(d),
      ),
    ),
  ).slice(0, 5);

  const context: UsageContext =
    level === 0
      ? 'none'
      : body.context && ['personal', 'work', 'both'].includes(body.context)
        ? (body.context as UsageContext)
        : deriveContextFromDomains(level as UsageLevel, domains);

  // Symptoms / use-cases are optional and allow selecting any number
  const validSymptomSet = level === 0 ? NO_AI_REASON_SET : AI_SYMPTOM_SET;
  const symptoms = Array.isArray(body.symptoms)
    ? Array.from(
        new Set(
          body.symptoms.filter(
            (s): s is SymptomId =>
              typeof s === 'string' && validSymptomSet.has(s),
          ),
        ),
      ).slice(0, 10)
    : [];

  const salt = c.env.HASH_SALT || 'default-dev-salt';
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';

  const [anonTokenHash, ipHash] = await Promise.all([
    hashAnonToken(anonToken, salt),
    hashIpDaily(ip, salt),
  ]);

  if (c.env.APP_ENV === 'production') {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const [existingToken, recentStats] = await Promise.all([
      c.env.DB.prepare('SELECT 1 as ok FROM signals WHERE anon_token_hash = ?')
        .bind(anonTokenHash)
        .first<{ ok: number }>(),
      c.env.DB.prepare(
        `SELECT
           COUNT(*) as total_cnt,
           COALESCE(SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END), 0) as new_cnt
         FROM signals
         WHERE ip_hash = ? AND updated_at > ?`,
      )
        .bind(oneHourAgo, ipHash, oneHourAgo)
        .first<{ total_cnt: number; new_cnt: number }>(),
    ]);

    const isNewVote = !existingToken;
    if (
      (isNewVote && (recentStats?.new_cnt ?? 0) >= 5) ||
      (recentStats?.total_cnt ?? 0) >= 12
    ) {
      return c.json(
        { error: 'Too many signals from this network. Please try again later.' },
        429,
      );
    }
  }

  const report = await upsertSignal(c.env.DB, {
    anonTokenHash,
    ipHash,
    countryCode,
    cityName,
    lat,
    lng,
    level: level as UsageLevel,
    context,
    domains,
    symptoms,
  });

  // Invalidate default live snapshot cache so the submitter immediately sees their check-in
  const edgeCache = getEdgeCache();
  if (edgeCache) {
    try {
      const defaultNowKey = buildSnapshotCacheRequest(c.req.url, {
        role: 'all',
        symptom: 'all',
        context: 'all',
        period: 'now',
      });
      c.executionCtx.waitUntil(edgeCache.delete(defaultNowKey));
    } catch {
      // ignore outside Workers executionCtx
    }
  }

  return c.json(report, 200, { 'Cache-Control': 'no-store' });
});

app.post('/api/feedback', async (c) => {
  if (!isAllowedWriteRequest(c.req.raw, c.env.APP_ENV)) {
    return c.json({ error: 'Cross-site requests are not allowed' }, 403);
  }

  let body: Partial<FeedbackSubmission>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const kind: FeedbackKind =
    typeof body.kind === 'string' && FEEDBACK_KIND_SET.has(body.kind)
      ? (body.kind as FeedbackKind)
      : 'other';

  const message =
    typeof body.message === 'string' ? body.message.trim().slice(0, 1000) : '';
  if (message.length < 3) {
    return c.json({ error: 'Feedback message is too short' }, 400);
  }

  const contact =
    typeof body.contact === 'string' && body.contact.trim().length > 0
      ? body.contact.trim().slice(0, 120)
      : null;

  const contextJson =
    body.context && typeof body.context === 'object'
      ? JSON.stringify(body.context).slice(0, 1000)
      : null;

  const salt = c.env.HASH_SALT || 'default-dev-salt';
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';
  const ipHash = await hashIpDaily(ip, salt);

  if (c.env.APP_ENV === 'production') {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM feedback WHERE ip_hash = ? AND created_at > ?',
    )
      .bind(ipHash, oneHourAgo)
      .first<{ cnt: number }>();

    if ((recentCount?.cnt ?? 0) >= 6) {
      return c.json(
        { error: 'Too many feedback messages. Please try again later.' },
        429,
      );
    }
  }

  const result = await insertFeedback(c.env.DB, {
    kind,
    message,
    contact,
    contextJson,
    ipHash,
  });

  return c.json(result, 200, { 'Cache-Control': 'no-store' });
});

const ROLE_SEO_LABELS: Record<RoleId, string> = {
  tech: 'Tech & Coding',
  design: 'Design & Creative',
  media: 'Writing & Marketing',
  office: 'Business & Office',
  student: 'Studying',
  education: 'Teaching & Science',
  health: 'Healthcare',
  trades: 'Hands-on & Trades',
  service: 'Service & Sales',
  founder: 'Own Business & Freelance',
  home: 'Home & Family',
  other: 'Hobbies & Fun',
};

const SITEMAP_COUNTRIES = [
  'US', 'GB', 'DE', 'FR', 'JP', 'KR', 'IN', 'BR', 'CA', 'AU',
  'ES', 'IT', 'NL', 'SE', 'PL', 'SG', 'AE', 'TH', 'ID', 'MY',
  'MX', 'AR', 'PT', 'TR', 'ZA', 'RU',
];

function getCountryDisplayEn(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

app.get('/robots.txt', (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`;
  return c.text(body, 200, {
    'Cache-Control': 'public, max-age=3600',
  });
});

app.get('/sitemap.xml', (c) => {
  const origin = new URL(c.req.url).origin;
  const urls: Array<{ loc: string; changefreq: string; priority: string }> = [
    { loc: `${origin}/`, changefreq: 'daily', priority: '1.0' },
    ...SITEMAP_COUNTRIES.map((cc) => ({
      loc: `${origin}/country/${cc.toLowerCase()}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...ROLES.map((role) => ({
      loc: `${origin}/area/${role}`,
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join('\n')}\n</urlset>\n`;

  return c.body(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
});

app.all('*', async (c) => {
  if (!c.env.ASSETS) {
    return c.text('Not Found', 404);
  }

  const reqUrl = new URL(c.req.url);
  const res = await c.env.ASSETS.fetch(c.req.raw);
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return res;
  }

  // Dynamic edge SEO & Open Graph tags for custom domains, /country/:cc, /area/:role, and ?sector=XX
  const origin = reqUrl.origin;
  const countryMatch = reqUrl.pathname.match(/^\/country\/([a-z]{2})\/?$/i);
  const areaMatch = reqUrl.pathname.match(/^\/area\/([a-z_-]+)\/?$/i);
  const sectorParam = (countryMatch?.[1] ?? reqUrl.searchParams.get('sector'))?.toUpperCase() ?? null;
  const areaParam = (areaMatch?.[1] ?? reqUrl.searchParams.get('role'))?.toLowerCase() ?? null;

  let pageTitle = 'How’s AI Going? — Live Map of Real-World AI Usage';
  let pageDesc =
    'Anonymous live world map showing how everyday people around the world actually use AI across work, study, and daily life — or why they skip it.';
  let canonicalUrl = `${origin}/`;

  if (sectorParam && ALPHA2_SET.has(sectorParam)) {
    const countryName = getCountryDisplayEn(sectorParam);
    canonicalUrl = `${origin}/country/${sectorParam.toLowerCase()}`;
    try {
      const row = await c.env.DB.prepare(
        `SELECT COUNT(*) as cnt, SUM(CASE WHEN level >= 1 THEN 1 ELSE 0 END) as ai_cnt
         FROM signals WHERE country_code = ?`,
      )
        .bind(sectorParam)
        .first<{ cnt: number; ai_cnt: number | null }>();
      const cnt = row?.cnt ?? 0;
      const aiPct = cnt > 0 ? Math.round(((row?.ai_cnt ?? 0) / cnt) * 100) : null;
      if (cnt >= APP_CONFIG.thresholds.country.preliminary && aiPct !== null) {
        pageTitle = `AI Usage in ${countryName}: ${aiPct}% Use AI — How’s AI Going?`;
        pageDesc = `${aiPct}% of respondents in ${countryName} use AI across work and everyday life. Explore live data and add your 5-second anonymous answer.`;
      } else {
        pageTitle = `AI Usage in ${countryName} — How’s AI Going?`;
        pageDesc = `See live anonymous AI usage check-ins in ${countryName} and help unlock the country score on How’s AI Going?.`;
      }
    } catch {
      pageTitle = `AI Usage in ${countryName} — How’s AI Going?`;
    }
  } else if (areaParam && ROLE_SET.has(areaParam)) {
    const areaName = ROLE_SEO_LABELS[areaParam as RoleId];
    canonicalUrl = `${origin}/area/${areaParam}`;
    pageTitle = `How People in ${areaName} Use AI — How’s AI Going?`;
    pageDesc = `Live anonymous global map of AI adoption in ${areaName}: how often people use AI, top use cases, and why others skip it.`;
  }

  const ogImageUrl = `${origin}/og-image.png`;
  const rewriter = new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(pageTitle);
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute('href', canonicalUrl);
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute('content', pageDesc);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute('content', canonicalUrl);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', pageTitle);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute('content', pageDesc);
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute('content', ogImageUrl);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', pageTitle);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute('content', pageDesc);
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', ogImageUrl);
      },
    });

  return rewriter.transform(res);
});

export default app;
