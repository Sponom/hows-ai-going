export type UsageLevel = 0 | 1 | 2 | 3;

export type UsageContext = 'none' | 'personal' | 'work' | 'both';

export const ROLES = [
  'tech',
  'design',
  'media',
  'office',
  'student',
  'education',
  'health',
  'trades',
  'service',
  'founder',
  'home',
  'other',
] as const;

export type RoleId = (typeof ROLES)[number];

/** Which areas count as personal/everyday life vs work/study */
export const PERSONAL_DOMAINS = new Set<RoleId>(['home', 'other']);
export const WORK_DOMAINS = new Set<RoleId>([
  'tech',
  'design',
  'media',
  'office',
  'student',
  'education',
  'health',
  'trades',
  'service',
  'founder',
]);

export function deriveContextFromDomains(
  level: UsageLevel,
  domains: RoleId[],
): UsageContext {
  if (level === 0) return 'none';
  const hasPersonal = domains.some((d) => PERSONAL_DOMAINS.has(d));
  const hasWork = domains.some((d) => WORK_DOMAINS.has(d));
  if (hasPersonal && hasWork) return 'both';
  if (hasPersonal) return 'personal';
  if (hasWork) return 'work';
  return 'both';
}

export const AI_SYMPTOMS = [
  'emails',
  'search',
  'work_tasks',
  'study',
  'daily_life',
  'advice',
  'fun_visuals',
] as const;

export type AiSymptomId = (typeof AI_SYMPTOMS)[number];

export const NO_AI_REASONS = [
  'think_myself',
  'no_trust',
  'no_need',
  'hype_fatigue',
  'no_time',
] as const;

export type NoAiReasonId = (typeof NO_AI_REASONS)[number];

export type SymptomId = AiSymptomId | NoAiReasonId;

export const ROLE_ICONS: Record<RoleId, string> = {
  tech: '💻',
  design: '🎨',
  media: '✍️',
  office: '💼',
  student: '🎓',
  education: '🔬',
  health: '🩺',
  trades: '🛠️',
  service: '☕',
  founder: '🚀',
  home: '🏠',
  other: '🎮',
};

export const SYMPTOM_ICONS: Record<SymptomId, string> = {
  emails: '✉️',
  search: '🔍',
  work_tasks: '⚡',
  study: '📚',
  daily_life: '🍳',
  advice: '🧠',
  fun_visuals: '🎭',
  think_myself: '🧩',
  no_trust: '🤨',
  no_need: '🤷',
  hype_fatigue: '😤',
  no_time: '⏳',
};

export const LEVEL_META: Record<
  UsageLevel,
  { emoji: string; color: string; weight: number }
> = {
  0: { emoji: '🧠', color: '#06b6d4', weight: 0 },
  1: { emoji: '👀', color: '#eab308', weight: 1 },
  2: { emoji: '⚡', color: '#f97316', weight: 2 },
  3: { emoji: '🤖', color: '#f43f5e', weight: 3 },
};
