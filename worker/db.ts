import { APP_CONFIG, getSignalStrength } from '../shared/config';
import {
  AI_SYMPTOMS,
  NO_AI_REASONS,
  ROLES,
  type RoleId,
  type SymptomId,
  type UsageContext,
  type UsageLevel,
} from '../shared/taxonomy';
import {
  HISTORY_PERIOD_DAYS,
  type CityStat,
  type CountryStat,
  type FeedbackKind,
  type FieldReportResponse,
  type HistoryPeriod,
  type RadarSnapshot,
  type RecentSignal,
  type RoleStat,
  type SymptomStat,
} from '../shared/types';

interface SignalRow {
  id: string;
  country_code: string;
  city_name: string | null;
  lat: number | null;
  lng: number | null;
  level: number;
  context: string;
  role: string;
  domains: string | null;
  symptoms: string;
  created_at: number;
  updated_at: number;
}

const AI_SYMPTOM_SET = new Set<string>(AI_SYMPTOMS);
const NO_AI_REASON_SET = new Set<string>(NO_AI_REASONS);
const ROLE_SET = new Set<string>(ROLES);

function parseSymptoms(raw: string): SymptomId[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SymptomId =>
        typeof s === 'string' &&
        (AI_SYMPTOM_SET.has(s) || NO_AI_REASON_SET.has(s)),
    );
  } catch {
    return [];
  }
}

function parseDomains(rawDomains: string | null, fallbackRole: string): RoleId[] {
  if (rawDomains !== null) {
    try {
      const parsed = JSON.parse(rawDomains);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (d): d is RoleId => typeof d === 'string' && ROLE_SET.has(d),
        );
      }
    } catch {
      // fallback below
    }
  }
  return [ROLE_SET.has(fallbackRole) ? (fallbackRole as RoleId) : 'other'];
}

function toTopEntries<T extends string>(
  counts: Map<T, number>,
  limit: number,
): { id: T; count: number }[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ id, count }));
}

export async function buildRadarSnapshot(
  db: D1Database,
  filters: {
    role: RoleId | 'all';
    symptom: SymptomId | 'all';
    context: UsageContext | 'all';
    period?: HistoryPeriod;
  },
): Promise<RadarSnapshot> {
  const period: HistoryPeriod = filters.period ?? 'now';
  const now = Date.now();
  const asOf =
    period === 'now' ? now : now - HISTORY_PERIOD_DAYS[period] * 86_400_000;

  const contextClauses: string[] = [];
  const contextBinds: unknown[] = [];

  if (filters.context !== 'all') {
    if (filters.context === 'personal') {
      contextClauses.push("context IN ('personal', 'both')");
    } else if (filters.context === 'work') {
      contextClauses.push("context IN ('work', 'both')");
    } else {
      contextClauses.push('context = ?');
      contextBinds.push(filters.context);
    }
  }

  let allRows: SignalRow[] = [];

  if (period === 'now') {
    const whereSql =
      contextClauses.length > 0 ? `WHERE ${contextClauses.join(' AND ')}` : '';
    const stmt = db.prepare(
      `SELECT id, country_code, city_name, lat, lng, level, context, role, domains, symptoms, created_at, updated_at
       FROM signals
       ${whereSql}
       ORDER BY updated_at DESC`,
    );
    const { results } = await (contextBinds.length > 0
      ? stmt.bind(...contextBinds)
      : stmt
    ).all<SignalRow>();
    allRows = results ?? [];
  } else {
    const outerWhere = ['rn = 1', ...contextClauses].join(' AND ');
    const stmt = db.prepare(
      `SELECT id, country_code, city_name, lat, lng, level, context, role, domains, symptoms,
              recorded_at AS created_at, recorded_at AS updated_at
       FROM (
         SELECT id, country_code, city_name, lat, lng, level, context, role, domains, symptoms, recorded_at,
                ROW_NUMBER() OVER (PARTITION BY anon_token_hash ORDER BY recorded_at DESC) AS rn
         FROM signal_history
         WHERE recorded_at <= ?
       )
       WHERE ${outerWhere}
       ORDER BY updated_at DESC`,
    );
    const { results } = await stmt
      .bind(asOf, ...contextBinds)
      .all<SignalRow>();
    allRows = results ?? [];
  }

  // Apply role and/or symptom filters for the map & counters
  const rows = allRows.filter((row) => {
    if (
      filters.role !== 'all' &&
      !parseDomains(row.domains, row.role).includes(filters.role as RoleId)
    ) {
      return false;
    }
    if (
      filters.symptom !== 'all' &&
      !parseSymptoms(row.symptoms).includes(filters.symptom as SymptomId)
    ) {
      return false;
    }
    return true;
  });

  const isFilteredSlice = filters.role !== 'all' || filters.symptom !== 'all';

  let totalLevelSum = 0;
  let aiUsersTotal = 0;
  let personalUsers = 0;
  let workUsers = 0;

  const countryAcc = new Map<
    string,
    {
      count: number;
      levelSum: number;
      aiUsers: number;
      personal: number;
      work: number;
      symptoms: Map<SymptomId, number>;
      roles: Map<RoleId, number>;
    }
  >();

  const cityAcc = new Map<
    string,
    {
      countryCode: string;
      cityName: string;
      latSum: number;
      lngSum: number;
      coordCount: number;
      count: number;
      levelSum: number;
      aiUsers: number;
      lastSignalAt: number;
      symptoms: Map<SymptomId, number>;
    }
  >();

  const roleAcc = new Map<
    RoleId,
    { count: number; levelSum: number; aiUsers: number }
  >();

  // Always compute full role rankings across allRows so clicking a role filter
  // updates the map without jumping/re-sorting the role list itself.
  for (const row of allRows) {
    const level = Math.max(0, Math.min(3, Number(row.level))) as UsageLevel;
    const isAi = level >= 1;
    const domains = parseDomains(row.domains, row.role);
    for (const d of domains) {
      let r = roleAcc.get(d);
      if (!r) {
        r = { count: 0, levelSum: 0, aiUsers: 0 };
        roleAcc.set(d, r);
      }
      r.count += 1;
      r.levelSum += level;
      if (isAi) r.aiUsers += 1;
    }
  }

  const symptomAcc = new Map<SymptomId, number>();

  // Always compute full symptom rankings across allRows so clicking a symptom filter
  // doesn't make the symptom list itself jump around.
  for (const row of allRows) {
    for (const s of parseSymptoms(row.symptoms)) {
      symptomAcc.set(s, (symptomAcc.get(s) ?? 0) + 1);
    }
  }

  for (const row of rows) {
    const level = Math.max(0, Math.min(3, Number(row.level))) as UsageLevel;
    const isAi = level >= 1;
    const domains = parseDomains(row.domains, row.role);
    const symptoms = parseSymptoms(row.symptoms);

    totalLevelSum += level;
    if (isAi) {
      aiUsersTotal += 1;
      if (row.context === 'personal' || row.context === 'both') personalUsers += 1;
      if (row.context === 'work' || row.context === 'both') workUsers += 1;
    }

    // Country accumulator
    let c = countryAcc.get(row.country_code);
    if (!c) {
      c = {
        count: 0,
        levelSum: 0,
        aiUsers: 0,
        personal: 0,
        work: 0,
        symptoms: new Map(),
        roles: new Map(),
      };
      countryAcc.set(row.country_code, c);
    }
    c.count += 1;
    c.levelSum += level;
    if (isAi) {
      c.aiUsers += 1;
      if (row.context === 'personal' || row.context === 'both') c.personal += 1;
      if (row.context === 'work' || row.context === 'both') c.work += 1;
    }
    for (const d of domains) {
      c.roles.set(d, (c.roles.get(d) ?? 0) + 1);
    }
    for (const s of symptoms) {
      c.symptoms.set(s, (c.symptoms.get(s) ?? 0) + 1);
    }

    // City accumulator (include even custom cities without exact coords)
    if (row.city_name) {
      const key = `${row.country_code}:${row.city_name}`;
      let city = cityAcc.get(key);
      if (!city) {
        city = {
          countryCode: row.country_code,
          cityName: row.city_name,
          latSum: 0,
          lngSum: 0,
          coordCount: 0,
          count: 0,
          levelSum: 0,
          aiUsers: 0,
          lastSignalAt: row.updated_at,
          symptoms: new Map(),
        };
        cityAcc.set(key, city);
      }
      city.count += 1;
      city.levelSum += level;
      if (isAi) city.aiUsers += 1;
      if (row.lat !== null && row.lng !== null) {
        city.latSum += row.lat;
        city.lngSum += row.lng;
        city.coordCount += 1;
      }
      if (row.updated_at > city.lastSignalAt) city.lastSignalAt = row.updated_at;
      for (const s of symptoms) {
        city.symptoms.set(s, (city.symptoms.get(s) ?? 0) + 1);
      }
    }
  }

  const countries: CountryStat[] = Array.from(countryAcc.entries())
    .map(([countryCode, c]) => ({
      countryCode,
      count: c.count,
      aiIndex: Math.round((c.levelSum / (c.count * 3)) * 100),
      aiUserShare: Math.round((c.aiUsers / c.count) * 100),
      personalShare: c.aiUsers > 0 ? Math.round((c.personal / c.aiUsers) * 100) : 0,
      workShare: c.aiUsers > 0 ? Math.round((c.work / c.aiUsers) * 100) : 0,
      strength: isFilteredSlice
        ? ((c.count >= 3 ? 2 : 1) as 0 | 1 | 2 | 3)
        : getSignalStrength(c.count, 'country'),
      topSymptoms: toTopEntries(c.symptoms, 3),
      topRoles: toTopEntries(c.roles, 3),
    }))
    .sort((a, b) => b.count - a.count);

  const cities: CityStat[] = Array.from(cityAcc.entries())
    .map(([key, c]) => ({
      key,
      countryCode: c.countryCode,
      cityName: c.cityName,
      lat: c.coordCount > 0 ? Math.round((c.latSum / c.coordCount) * 10) / 10 : null,
      lng: c.coordCount > 0 ? Math.round((c.lngSum / c.coordCount) * 10) / 10 : null,
      count: c.count,
      aiIndex: Math.round((c.levelSum / (c.count * 3)) * 100),
      aiUserShare: Math.round((c.aiUsers / c.count) * 100),
      strength: isFilteredSlice
        ? ((c.count >= 2 ? 2 : 1) as 0 | 1 | 2 | 3)
        : getSignalStrength(c.count, 'city'),
      lastSignalAt: c.lastSignalAt,
      topSymptom: toTopEntries(c.symptoms, 1)[0]?.id ?? null,
    }))
    .sort((a, b) => b.count - a.count);

  const roles: RoleStat[] = Array.from(roleAcc.entries())
    .map(([role, r]) => ({
      role,
      count: r.count,
      aiIndex: Math.round((r.levelSum / (r.count * 3)) * 100),
      aiUserShare: Math.round((r.aiUsers / r.count) * 100),
    }))
    .sort((a, b) => b.aiUserShare - a.aiUserShare || b.count - a.count || a.role.localeCompare(b.role));

  const totalSignals = rows.length;
  const allTotal = allRows.length;
  const symptoms: SymptomStat[] = Array.from(symptomAcc.entries())
    .map(([id, count]) => ({
      id,
      kind: (AI_SYMPTOM_SET.has(id) ? 'ai' : 'no_ai') as 'ai' | 'no_ai',
      count,
      share: allTotal > 0 ? Math.round((count / allTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const recent: RecentSignal[] = rows.slice(0, 20).map((row) => {
    const syms = parseSymptoms(row.symptoms);
    const domains = parseDomains(row.domains, row.role);
    return {
      id: row.id,
      countryCode: row.country_code,
      cityName: row.city_name,
      lat: row.lat,
      lng: row.lng,
      level: Math.max(0, Math.min(3, Number(row.level))) as UsageLevel,
      context: (row.context as UsageContext) || 'none',
      role: domains[0] ?? null,
      domains,
      symptom: syms[0] ?? null,
      createdAt: row.updated_at,
    };
  });

  return {
    generatedAt: now,
    period,
    asOf,
    filters: {
      role: filters.role,
      symptom: filters.symptom,
      context: filters.context,
    },
    global: {
      totalSignals,
      countriesReached: countries.length,
      citiesReached: cities.length,
      globalAiIndex:
        totalSignals > 0
          ? Math.round((totalLevelSum / (totalSignals * 3)) * 100)
          : null,
      globalAiUserShare:
        totalSignals > 0 ? Math.round((aiUsersTotal / totalSignals) * 100) : null,
      personalShare:
        aiUsersTotal > 0 ? Math.round((personalUsers / aiUsersTotal) * 100) : 0,
      workShare:
        aiUsersTotal > 0 ? Math.round((workUsers / aiUsersTotal) * 100) : 0,
    },
    countries,
    cities,
    roles,
    symptoms,
    recent,
  };
}

export async function upsertSignal(
  db: D1Database,
  params: {
    anonTokenHash: string;
    ipHash: string;
    countryCode: string;
    cityName: string | null;
    lat: number | null;
    lng: number | null;
    level: UsageLevel;
    context: UsageContext;
    domains: RoleId[];
    symptoms: SymptomId[];
  },
): Promise<FieldReportResponse> {
  const now = Date.now();
  const primaryRole = params.domains[0] ?? 'other';
  const domainsJson = JSON.stringify(params.domains);
  const symptomsJson = JSON.stringify(params.symptoms);

  const existing = await db
    .prepare('SELECT id FROM signals WHERE anon_token_hash = ?')
    .bind(params.anonTokenHash)
    .first<{ id: string }>();

  if (existing) {
    await db
      .prepare(
        `UPDATE signals
         SET ip_hash = ?, country_code = ?, city_name = ?, lat = ?, lng = ?,
             level = ?, context = ?, role = ?, domains = ?, symptoms = ?, updated_at = ?
         WHERE anon_token_hash = ?`,
      )
      .bind(
        params.ipHash,
        params.countryCode,
        params.cityName,
        params.lat,
        params.lng,
        params.level,
        params.context,
        primaryRole,
        domainsJson,
        symptomsJson,
        now,
        params.anonTokenHash,
      )
      .run();
  } else {
    const id = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO signals
         (id, anon_token_hash, ip_hash, country_code, city_name, lat, lng,
          level, context, role, domains, symptoms, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        params.anonTokenHash,
        params.ipHash,
        params.countryCode,
        params.cityName,
        params.lat,
        params.lng,
        params.level,
        params.context,
        primaryRole,
        domainsJson,
        symptomsJson,
        now,
        now,
      )
      .run();
  }

  // Append anonymous history point for time-period & Before/After comparisons
  await db
    .prepare(
      `INSERT INTO signal_history
       (id, anon_token_hash, country_code, city_name, lat, lng,
        level, context, role, domains, symptoms, recorded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      params.anonTokenHash,
      params.countryCode,
      params.cityName,
      params.lat,
      params.lng,
      params.level,
      params.context,
      primaryRole,
      domainsJson,
      symptomsJson,
      now,
    )
    .run();

  const snapshot = await buildRadarSnapshot(db, {
    role: 'all',
    symptom: 'all',
    context: 'all',
    period: 'now',
  });
  const country =
    snapshot.countries.find((c) => c.countryCode === params.countryCode) ?? null;
  const cityKey = params.cityName
    ? `${params.countryCode}:${params.cityName}`
    : null;
  const city = cityKey
    ? snapshot.cities.find((c) => c.key === cityKey) ?? null
    : null;
  const roleStat = params.domains[0]
    ? snapshot.roles.find((r) => r.role === params.domains[0]) ?? null
    : null;

  const countryCount = country?.count ?? 1;
  const cityCount = city?.count ?? (params.cityName ? 1 : 0);

  return {
    ok: true,
    updated: Boolean(existing),
    signal: {
      countryCode: params.countryCode,
      cityName: params.cityName,
      lat: params.lat,
      lng: params.lng,
      level: params.level,
      context: params.context,
      role: primaryRole,
      domains: params.domains,
      symptoms: params.symptoms,
    },
    milestones: {
      isFirstInCountry: !existing && countryCount === 1,
      isFirstInCity: !existing && Boolean(params.cityName) && cityCount === 1,
      countryRemainingToUnlock: Math.max(
        0,
        APP_CONFIG.thresholds.country.preliminary - countryCount,
      ),
      cityRemainingToUnlock: params.cityName
        ? Math.max(0, APP_CONFIG.thresholds.city.preliminary - cityCount)
        : 0,
      countryThreshold: APP_CONFIG.thresholds.country.preliminary,
      cityThreshold: APP_CONFIG.thresholds.city.preliminary,
    },
    comparison: {
      country,
      city,
      role: roleStat,
      globalAiUserShare: snapshot.global.globalAiUserShare ?? 0,
    },
  };
}

export async function insertFeedback(
  db: D1Database,
  params: {
    kind: FeedbackKind;
    message: string;
    contact: string | null;
    contextJson: string | null;
    ipHash: string;
  },
): Promise<{ ok: true; id: string }> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO feedback (id, kind, message, contact, context_json, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      params.kind,
      params.message,
      params.contact,
      params.contextJson,
      params.ipHash,
      now,
    )
    .run();
  return { ok: true, id };
}
