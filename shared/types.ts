import type { SignalStrength } from './config';
import type { RoleId, SymptomId, UsageContext, UsageLevel } from './taxonomy';

export const HISTORY_PERIODS = ['12m', '6m', '3m', 'now'] as const;
export type HistoryPeriod = (typeof HISTORY_PERIODS)[number];

export const HISTORY_PERIOD_DAYS: Record<HistoryPeriod, number> = {
  '12m': 365,
  '6m': 180,
  '3m': 90,
  now: 0,
};

export interface CountryStat {
  countryCode: string;
  count: number;
  /** 0..100 weighted AI Cover Index */
  aiIndex: number;
  /** Share of respondents using AI (level >= 1), 0..100 */
  aiUserShare: number;
  /** Share of AI users who use it in personal life (personal or both), 0..100 */
  personalShare: number;
  /** Share of AI users who use it for work/study (work or both), 0..100 */
  workShare: number;
  strength: SignalStrength;
  topSymptoms: { id: SymptomId; count: number }[];
  topRoles: { id: RoleId; count: number }[];
}

export interface CityStat {
  key: string; // `${countryCode}:${cityName}`
  countryCode: string;
  cityName: string;
  lat: number | null;
  lng: number | null;
  count: number;
  aiIndex: number;
  aiUserShare: number;
  strength: SignalStrength;
  lastSignalAt: number;
  topSymptom: SymptomId | null;
}

export interface RoleStat {
  role: RoleId;
  count: number;
  aiIndex: number;
  aiUserShare: number;
}

export interface SymptomStat {
  id: SymptomId;
  kind: 'ai' | 'no_ai';
  count: number;
  share: number;
}

export interface RecentSignal {
  id: string;
  countryCode: string;
  cityName: string | null;
  lat: number | null;
  lng: number | null;
  level: UsageLevel;
  context: UsageContext;
  role: RoleId | null;
  domains: RoleId[];
  symptom: SymptomId | null;
  createdAt: number;
}

export interface RadarSnapshot {
  generatedAt: number;
  period: HistoryPeriod;
  asOf: number;
  filters: {
    role: RoleId | 'all';
    symptom: SymptomId | 'all';
    context: UsageContext | 'all';
  };
  global: {
    totalSignals: number;
    countriesReached: number;
    citiesReached: number;
    globalAiIndex: number | null;
    globalAiUserShare: number | null;
    personalShare: number;
    workShare: number;
  };
  countries: CountryStat[];
  cities: CityStat[];
  roles: RoleStat[];
  symptoms: SymptomStat[];
  recent: RecentSignal[];
}

export interface GeoInfo {
  countryCode: string | null;
  cityName: string | null;
  lat: number | null;
  lng: number | null;
  source: 'cloudflare' | 'local';
}

export interface SignalSubmission {
  anonToken: string;
  countryCode: string;
  cityName: string | null;
  lat: number | null;
  lng: number | null;
  level: UsageLevel;
  context?: UsageContext;
  /** Multi-select areas where user uses AI (1..3), or main area if level === 0 */
  domains: RoleId[];
  symptoms: SymptomId[];
}

export interface FieldReportResponse {
  ok: true;
  updated: boolean;
  signal: {
    countryCode: string;
    cityName: string | null;
    lat: number | null;
    lng: number | null;
    level: UsageLevel;
    context: UsageContext;
    role: RoleId;
    domains: RoleId[];
    symptoms: SymptomId[];
  };
  milestones: {
    isFirstInCity: boolean;
    isFirstInCountry: boolean;
    cityRemainingToUnlock: number;
    countryRemainingToUnlock: number;
    countryThreshold: number;
    cityThreshold: number;
  };
  comparison: {
    country: CountryStat | null;
    city: CityStat | null;
    role: RoleStat | null;
    globalAiUserShare: number;
  };
}

export const FEEDBACK_KINDS = ['idea', 'bug', 'data', 'other'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export interface FeedbackSubmission {
  kind: FeedbackKind;
  message: string;
  contact?: string | null;
  context?: Record<string, string | number | boolean | null>;
}
