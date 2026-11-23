import type { RoleId, SymptomId, UsageContext, UsageLevel } from '../../shared/taxonomy';
import type { FeedbackKind, HistoryPeriod } from '../../shared/types';

export type Locale = 'en' | 'ru' | 'es' | 'pt-BR' | 'ja' | 'ko' | 'de';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'es', label: 'ES' },
  { code: 'pt-BR', label: 'PT' },
  { code: 'ja', label: 'JA' },
  { code: 'ko', label: 'KO' },
  { code: 'de', label: 'DE' },
];

export interface Dictionary {
  tagline: string;
  taglineShort: string;
  introHint: string;
  aboutBtn: string;
  aboutTitle: string;
  aboutLead: string;
  aboutPointMapTitle: string;
  aboutPointMapDesc: string;
  aboutPointAnonTitle: string;
  aboutPointAnonDesc: string;
  aboutPointJoinTitle: string;
  aboutPointJoinDesc: string;
  aboutGotIt: string;
  ctaReport: string;
  ctaReportBadge: string;
  ctaUpdate: string;
  statsCountries: string;
  statsCities: string;
  statsSignals: string;
  statsGlobalIndex: string;
  filterAllRoles: string;
  filterAllContexts: string;
  contextLabels: Record<UsageContext, string>;
  levelLabels: Record<UsageLevel, { title: string; desc: string }>;
  /** Fun verdict titles shown on the final result card */
  verdicts: Record<UsageLevel, { title: string; subtitle: string }>;
  /** Playful one-liner per selected primary use-case / reason */
  symptomQuips: Record<SymptomId, string>;
  roleLabels: Record<RoleId, string>;
  symptomLabels: Record<SymptomId, { title: string; desc: string }>;
  legendNoSignal: string;
  legendNoSignalShort: string;
  legendCalibrating: string;
  legendCalibratingShort: string;
  legendCities: string;
  legendScaleLabel: string;
  legendLow: string;
  legendHigh: string;
  signalStrengthLabels: Record<0 | 1 | 2 | 3, string>;
  votesCount: string; // e.g. "{n} answers"
  panelTabs: {
    rankings: string;
    roles: string;
    cases: string;
  };
  mobileListBtn: string;
  panelTopCountries: string;
  panelTopCities: string;
  panelSearchPlaceholder: string;
  panelSearchNoResults: string;
  panelCitiesInCountry: string;
  panelBackToCountry: string;
  panelCalibratingNote: string;
  panelNoDataYet: string;
  panelInspectBack: string;
  panelAiIndex: string;
  panelUsingAi: string;
  panelPersonalVsWork: string;
  panelTopCases: string;
  panelTopRoles: string;
  panelRolesFilterHint: string;
  panelCasesFilterHint: string;
  panelCasesGroupAi: string;
  panelCasesGroupNoAi: string;
  panelNeedsMoreSignals: string;
  panelCompareYourself: string;
  surveyTitle: string;
  surveySubtitle: string;
  surveyStepCounter: string; // "Step {step} of {total}"
  surveyStepLevel: string;
  surveyStepDomainsAi: string;
  surveyStepDomainsAiHint: string;
  surveyStepDomainsNoAi: string;
  surveyStepDomainsNoAiHint: string;
  surveyDomainGroups: {
    life: string;
    digital: string;
    offline: string;
  };
  surveySelectedCount: string; // "Selected: {n} / {max}"
  surveyStepSymptomsAi: string;
  surveyStepSymptomsNoAi: string;
  surveyStepSymptomsHint: string;
  surveySkip: string;
  surveyStepLocation: string;
  surveyCountryLabel: string;
  surveyCityOptionalLabel: string;
  surveyPrivacyNote: string;
  surveySearchCity: string;
  surveyUseCustomCity: string;
  surveySubmit: string;
  surveySubmitting: string;
  surveyNext: string;
  surveyBack: string;
  surveyAddDetails: string;
  surveyDetailsHint: string;
  surveyChangeLocation: string;
  reportTitle: string;
  reportThanksTitle: string;
  reportFirstCity: string;
  reportFirstCountry: string;
  reportCountryCollectingTitle: string; // "{country}: collecting votes ({cur} of {target})"
  reportCountryCollectingDesc: string; // "Your vote is in! {n} more locals needed to unlock the full score here."
  reportCountryActiveTitle: string; // "{pct}% use AI in {country}"
  reportCountryBasedOn: string; // "Based on {n} anonymous answers"
  reportDomainActiveTitle: string; // "{pct}% use AI in «{domain}»"
  reportAroundYou: string;
  reportOutOfTen: string; // "{n} in 10 use AI"
  reportUnlockShort: string; // "{n} more people to unlock {country} on the map"
  reportCompareHigher: string;
  reportCompareMatch: string;
  reportCompareLower: string;
  reportShareBtn: string;
  reportShareCopied: string;
  reportEditBtn: string;
  reportExploreMap: string;
  tickerLive: string;
  tickerEmpty: string;
  mapZoomIn: string;
  mapZoomOut: string;
  mapReset: string;
  themeLight: string;
  themeDark: string;
  myLocationBadge: string;
  myLocationOnlyYou: string;
  a11yLanguage: string;
  a11yHideSidebar: string;
  a11yShowSidebar: string;
  a11yClose: string;
  a11yClear: string;
  a11yMapLabel: string;
  periodLabels: Record<HistoryPeriod, string>;
  periodShortLabels: Record<HistoryPeriod, string>;
  summaryCoverageTitle: string;
  summaryAnswersTitle: string;
  summaryUsingAiTitle: string;
  summaryCoverageTooltip: string;
  summaryAnswersTooltip: string;
  summaryUsingAiTooltip: string;
  timelineBtn: string;
  timelineBefore: string;
  timelineAfter: string;
  timelineSplitBtn: string;
  timelineSplitHint: string;
  timelineCountriesShort: string;
  timelineAiShort: string;
  timelinePlay: string;
  timelinePause: string;
  timelineCollapse: string;
  timelineExpand: string;
  timelineSliderLabel: string;
  timelineCompareTooltip: string;
  shareBtn: string;
  shareTitle: string;
  shareSubtitle: string;
  shareCopyLink: string;
  shareCopied: string;
  shareNativeBtn: string;
  sharePlaceTooltip: string;
  shareTextGlobal: string;
  shareTextCountry: string;
  feedbackBtn: string;
  feedbackTitle: string;
  feedbackSubtitle: string;
  feedbackKinds: Record<FeedbackKind, string>;
  feedbackPlaceholder: string;
  feedbackContactPlaceholder: string;
  feedbackSend: string;
  feedbackSending: string;
  feedbackThanksTitle: string;
  feedbackThanksDesc: string;
  feedbackDone: string;
  aboutFeedbackLink: string;
  disputedTerritory: string;
}

const EN: Dictionary = {
  tagline: 'Live map of real-world usage',
  taglineShort: 'Live map of real-world usage',
  introHint: 'See who uses AI worldwide — and who skips it. Add your anonymous answer.',
  aboutBtn: 'About',
  aboutTitle: 'What is How’s AI Going?',
  aboutLead: 'An open, anonymous map showing how everyday people around the world actually use AI — or choose not to.',
  aboutPointMapTitle: 'Live global map & history',
  aboutPointMapDesc: 'Explore countries, cities, fields, and real use cases — and compare how adoption changed over the past year.',
  aboutPointAnonTitle: 'Strictly anonymous',
  aboutPointAnonDesc: 'No sign-up and no personal info. Only the answers and country or city you choose are saved.',
  aboutPointJoinTitle: 'Add your answer',
  aboutPointJoinDesc: 'Check in with a few quick taps — whether you use AI daily or never touch it — and compare with locals and the world.',
  aboutGotIt: 'Got it',
  ctaReport: 'How’s AI going for you?',
  ctaReportBadge: '15s · anon',
  ctaUpdate: 'My answer',
  statsCountries: 'Countries',
  statsCities: 'Cities',
  statsSignals: 'Answers',
  statsGlobalIndex: 'Of respondents use AI',
  filterAllRoles: 'All areas',
  filterAllContexts: 'Work & Life',
  contextLabels: {
    none: 'No AI',
    personal: 'Personal life',
    work: 'Work / Study',
    both: 'Work & Life',
  },
  levelLabels: {
    0: { title: 'Never', desc: 'Getting by without AI so far' },
    1: { title: 'Once in a while', desc: 'A few times a month for small things' },
    2: { title: 'Regularly', desc: 'Several times a week' },
    3: { title: 'Every day', desc: 'My go-to tool almost every day' },
  },
  verdicts: {
    0: { title: 'Old-School Mode', subtitle: 'Running on 100% organic human brainpower.' },
    1: { title: 'Casual Explorer', subtitle: 'Dipping into AI whenever the mood strikes.' },
    2: { title: 'AI Sidekick', subtitle: 'Quietly letting AI handle the boring bits.' },
    3: { title: 'Full Autopilot', subtitle: 'Your day basically starts with a prompt.' },
  },
  symptomQuips: {
    emails: 'Nobody has to know who’s really that polite.',
    search: 'Google quietly misses you.',
    work_tasks: 'Work smarter, not harder.',
    study: 'The tutor that never gets tired of explaining.',
    daily_life: 'Leftover-fridge dinners officially solved.',
    advice: 'Cheaper than therapy and awake at 3 AM.',
    fun_visuals: 'Certified meme and rabbit-hole generator.',
    think_myself: 'Keeping those neurons sharp!',
    no_trust: 'Healthy skepticism never hurt anyone.',
    no_need: 'If it ain’t broke, don’t prompt it.',
    hype_fatigue: 'Proudly holding out against the AI slop.',
    no_time: 'No rush — the robots aren’t going anywhere.',
  },
  roleLabels: {
    tech: 'Tech & Coding',
    design: 'Design & Creative',
    media: 'Writing & Marketing',
    office: 'Business & Office',
    student: 'Studying',
    education: 'Teaching & Science',
    health: 'Healthcare',
    trades: 'Hands-on & Trades',
    service: 'Service & Sales',
    founder: 'Own business / Freelance',
    home: 'Home & Family',
    other: 'Hobbies & Fun',
  },
  symptomLabels: {
    emails: { title: 'Polite emails & excuses', desc: 'Rewriting messages so I sound nicer' },
    search: { title: 'Instead of Google', desc: 'Asking AI is faster than searching' },
    work_tasks: { title: 'Work drafts & code', desc: 'Code, spreadsheets, docs, slides' },
    study: { title: 'Study helper', desc: 'Explaining topics, homework, summaries' },
    daily_life: { title: 'Everyday life hacks', desc: 'Recipes, trips, translations, shopping' },
    advice: { title: 'Pocket advisor', desc: 'Venting, brainstorming, life decisions' },
    fun_visuals: { title: 'Pictures, memes & fun', desc: 'Visuals, jokes, messing around' },
    think_myself: { title: 'Prefer my own brain', desc: 'Want to keep thinking independently' },
    no_trust: { title: 'Don’t trust it', desc: 'Errors, hallucinations, privacy' },
    no_need: { title: 'Just don’t need it', desc: 'Doing fine without it' },
    hype_fatigue: { title: 'Tired of AI hype', desc: 'Avoiding synthetic slop on principle' },
    no_time: { title: 'Haven’t tried yet', desc: 'Never got around to it' },
  },
  legendNoSignal: 'No data',
  legendNoSignalShort: 'None',
  legendCalibrating: 'Low data',
  legendCalibratingShort: 'Low',
  legendCities: 'Cities',
  legendScaleLabel: 'Use AI:',
  legendLow: '0%',
  legendHigh: '100%',
  signalStrengthLabels: {
    0: 'No data',
    1: 'Low data',
    2: 'Early score',
    3: 'Strong data',
  },
  votesCount: '{n} answers',
  panelTabs: {
    rankings: 'Countries',
    roles: 'Areas',
    cases: 'Use cases',
  },
  mobileListBtn: 'Stats',
  panelTopCountries: 'Countries on the map',
  panelTopCities: 'Cities on the map',
  panelSearchPlaceholder: 'Search any country or city...',
  panelSearchNoResults: 'Nothing found',
  panelCitiesInCountry: 'Cities in this country',
  panelBackToCountry: 'Back to {country}',
  panelCalibratingNote: 'Places with low data show live pins until enough answers arrive.',
  panelNoDataYet: 'No answers yet. Be the first on the map!',
  panelInspectBack: 'All places',
  panelAiIndex: 'AI activity score',
  panelUsingAi: 'of respondents use AI',
  panelPersonalVsWork: 'Life vs Work',
  panelTopCases: 'Top use cases',
  panelTopRoles: 'Top areas',
  panelRolesFilterHint: 'Click any area to filter the map',
  panelCasesFilterHint: 'Click any item to filter the map',
  panelCasesGroupAi: 'What people use AI for',
  panelCasesGroupNoAi: 'Why people skip AI',
  panelNeedsMoreSignals: '{n} more answers needed to unlock score',
  panelCompareYourself: 'And you? Add your anonymous answer',
  surveyTitle: 'How’s AI going for you?',
  surveySubtitle: 'Anonymous · No sign-up',
  surveyStepCounter: 'Step {step} of {total}',
  surveyStepLevel: 'How often do you use AI?',
  surveyStepDomainsAi: 'Where does AI help you?',
  surveyStepDomainsAiHint: 'Pick one or more',
  surveyStepDomainsNoAi: 'What do you mostly do?',
  surveyStepDomainsNoAiHint: 'Pick one or more',
  surveyDomainGroups: {
    life: 'Everyday & study',
    digital: 'Digital & office',
    offline: 'Offline & science',
  },
  surveySelectedCount: 'Selected: {n}',
  surveyStepSymptomsAi: 'What do you hand off to AI?',
  surveyStepSymptomsNoAi: 'Why do you skip AI?',
  surveyStepSymptomsHint: 'Optional — pick any that apply',
  surveySkip: 'Skip',
  surveyStepLocation: 'Where are you checking in from?',
  surveyCountryLabel: 'Country',
  surveyCityOptionalLabel: 'City (optional)',
  surveyPrivacyNote: 'No personal data — only the city or country you choose.',
  surveySearchCity: 'Search or type any city...',
  surveyUseCustomCity: 'Use “{city}”',
  surveySubmit: 'Done',
  surveySubmitting: 'Saving...',
  surveyNext: 'Next',
  surveyBack: 'Back',
  surveyAddDetails: 'Add details',
  surveyDetailsHint: 'Optional — powers the Areas & Use cases filters on the map',
  surveyChangeLocation: 'Change',
  reportTitle: 'Your answer',
  reportThanksTitle: 'Thanks! You’re on the map',
  reportFirstCity: 'FIRST FROM {city}!',
  reportFirstCountry: 'FIRST FROM {country}!',
  reportCountryCollectingTitle: '{country} — low data ({cur} of {target})',
  reportCountryCollectingDesc: 'Added! {n} more locals needed to unlock the full country stats.',
  reportCountryActiveTitle: '{pct}% use AI in {country}',
  reportCountryBasedOn: 'Based on {n} anonymous answers',
  reportDomainActiveTitle: '{pct}% use AI in “{domain}”',
  reportAroundYou: 'How others compare',
  reportOutOfTen: '{n} in 10 respondents use AI',
  reportUnlockShort: '{n} more locals needed to unlock this country',
  reportCompareHigher: 'You use AI more often than most people here.',
  reportCompareMatch: 'You’re right in line with the majority here.',
  reportCompareLower: 'You’re holding out more than most people here.',
  reportShareBtn: 'Invite friends',
  reportShareCopied: 'Link copied!',
  reportEditBtn: 'Edit my answer',
  reportExploreMap: 'Explore map',
  tickerLive: 'LIVE',
  tickerEmpty: 'Waiting for the first anonymous check-ins...',
  mapZoomIn: 'Zoom in',
  mapZoomOut: 'Zoom out',
  mapReset: 'Show whole world',
  themeLight: 'Light theme',
  themeDark: 'Dark theme',
  myLocationBadge: 'You',
  myLocationOnlyYou: 'Only you can see the “You” badge',
  a11yLanguage: 'Change language',
  a11yHideSidebar: 'Hide sidebar',
  a11yShowSidebar: 'Show sidebar',
  a11yClose: 'Close',
  a11yClear: 'Clear',
  a11yMapLabel: 'Interactive world map of AI usage',
  periodLabels: {
    '12m': '1 year ago',
    '6m': '6 months ago',
    '3m': '3 months ago',
    now: 'Now',
  },
  periodShortLabels: {
    '12m': '1 yr',
    '6m': '6 mo',
    '3m': '3 mo',
    now: 'Now',
  },
  summaryCoverageTitle: 'Countries',
  summaryAnswersTitle: 'Answers',
  summaryUsingAiTitle: 'Use AI',
  summaryCoverageTooltip: 'Countries with at least one anonymous response out of 195',
  summaryAnswersTooltip: 'Total anonymous responses on the map for this point in time',
  summaryUsingAiTooltip: 'Share of respondents who use AI at least occasionally',
  timelineBtn: 'History',
  timelineBefore: 'Then',
  timelineAfter: 'Now',
  timelineSplitBtn: 'World then & now',
  timelineSplitHint: 'Drag the divider to compare the world then and now',
  timelineCountriesShort: '{n} countries',
  timelineAiShort: '{pct}% use AI',
  timelinePlay: 'Play timeline animation',
  timelinePause: 'Pause animation',
  timelineCollapse: 'Minimize timeline',
  timelineExpand: 'Open timeline & comparison',
  timelineSliderLabel: 'Select time period',
  timelineCompareTooltip: 'Compare two periods side by side on the map',
  shareBtn: 'Share',
  shareTitle: 'Share the map',
  shareSubtitle: 'Send this map view or invite friends to add their answer',
  shareCopyLink: 'Copy link',
  shareCopied: 'Link copied!',
  shareNativeBtn: 'More apps...',
  sharePlaceTooltip: 'Share link to this place',
  shareTextGlobal: 'How’s AI Going? Explore the live anonymous map of how the world uses AI:',
  shareTextCountry: 'In {place}, {pct}% of respondents use AI. Check your country on How’s AI Going?:',
  feedbackBtn: 'Feedback',
  feedbackTitle: 'Send feedback',
  feedbackSubtitle: 'Got an idea, spotted a bug, or noticed a data issue? Let us know.',
  feedbackKinds: {
    idea: 'Idea',
    bug: 'Bug',
    data: 'Data / Map',
    other: 'Other',
  },
  feedbackPlaceholder: 'Tell us what could be better...',
  feedbackContactPlaceholder: 'Contact for reply (optional: Telegram, email)',
  feedbackSend: 'Send feedback',
  feedbackSending: 'Sending...',
  feedbackThanksTitle: 'Thanks for your feedback!',
  feedbackThanksDesc: 'We read every note and use it to make How’s AI Going? better.',
  feedbackDone: 'Done',
  aboutFeedbackLink: 'Have an idea or found a bug? Send feedback',
  disputedTerritory: 'Disputed territory',
};

const RU: Dictionary = {
  tagline: 'Живая карта использования ИИ',
  taglineShort: 'Живая карта использования ИИ',
  introHint: 'Смотри, кто в мире пользуется ИИ, а кто обходится без него — и анонимно отметь свой вариант.',
  aboutBtn: 'О проекте',
  aboutTitle: 'Что такое How’s AI Going?',
  aboutLead: 'Открытая анонимная карта, которая показывает, как обычные люди по всему миру на самом деле используют ИИ — или почему обходятся без него.',
  aboutPointMapTitle: 'Живая карта и динамика',
  aboutPointMapDesc: 'Изучай страны, города, сферы и реальные задачи — и сравнивай, как менялось покрытие за последний год.',
  aboutPointAnonTitle: 'Полностью анонимно',
  aboutPointAnonDesc: 'Без регистрации и личных данных. Сохраняются только твои ответы и выбранная страна или город.',
  aboutPointJoinTitle: 'Добавь свой ответ',
  aboutPointJoinDesc: 'Ответь за пару кликов — пользуешься ты ИИ каждый день или вообще нет — и сравни себя со своей страной и миром.',
  aboutGotIt: 'Понятно',
  ctaReport: 'Как у тебя с ИИ?',
  ctaReportBadge: '15 сек',
  ctaUpdate: 'Мой ответ',
  statsCountries: 'Стран',
  statsCities: 'Городов',
  statsSignals: 'Ответов',
  statsGlobalIndex: 'Среди ответивших с AI',
  filterAllRoles: 'Все темы',
  filterAllContexts: 'Работа и быт',
  contextLabels: {
    none: 'Без ИИ',
    personal: 'Личная жизнь',
    work: 'Работа и учёба',
    both: 'И работа, и быт',
  },
  levelLabels: {
    0: { title: 'Никогда', desc: 'Пока обхожусь без ИИ' },
    1: { title: 'Иногда', desc: 'Пару раз в месяц, по мелочи' },
    2: { title: 'Часто', desc: 'Несколько раз в неделю' },
    3: { title: 'Каждый день', desc: 'Привычный инструмент почти для всего' },
  },
  verdicts: {
    0: { title: 'Олдскул-режим', subtitle: 'Всё своими силами — мозг держится в тонусе!' },
    1: { title: 'Под настроение', subtitle: 'Заглядываешь к ИИ, когда есть повод.' },
    2: { title: 'На ты с ИИ', subtitle: 'ИИ уже стал твоим тихим напарником.' },
    3: { title: 'На автопилоте с ИИ', subtitle: 'Без ИИ день уже не начинается.' },
  },
  symptomQuips: {
    emails: 'Никто не догадается, откуда столько вежливости.',
    search: 'Гугл потихоньку по тебе скучает.',
    work_tasks: 'Зачем страдать вручную, если можно делегировать.',
    study: 'Репетитор, который не устаёт объяснять по пять раз.',
    daily_life: 'Ужин из остатков в холодильнике официально спасён.',
    advice: 'Дешевле психолога и не спит в три часа ночи.',
    fun_visuals: 'Главный поставщик мемов и странных картинок.',
    think_myself: 'Нейроны в отличной форме — уважаем!',
    no_trust: 'Здоровый скепсис ещё никому не мешал.',
    no_need: 'Если и так всё работает — зачем усложнять.',
    hype_fatigue: 'Принципиальная оборона от бесконечного ИИ-хайпа.',
    no_time: 'Никакой спешки — нейросети никуда не убегут.',
  },
  roleLabels: {
    tech: 'IT и код',
    design: 'Дизайн и творчество',
    media: 'Тексты и маркетинг',
    office: 'Офис и бизнес',
    student: 'Учёба',
    education: 'Наука и преподавание',
    health: 'Медицина',
    trades: 'Ремонт и производство',
    service: 'Сервис и продажи',
    founder: 'Своё дело / фриланс',
    home: 'Дом, быт и семья',
    other: 'Хобби и развлечения',
  },
  symptomLabels: {
    emails: { title: 'Вежливые письма и отмазки', desc: 'Переписать текст так, чтобы не звучать резко' },
    search: { title: 'Вместо Гугла', desc: 'Спросить у нейросети быстрее, чем искать' },
    work_tasks: { title: 'Рабочие задачи и черновики', desc: 'Код, таблицы, документы, презентации' },
    study: { title: 'Помощь с учёбой', desc: 'Разобрать тему, домашка, конспекты' },
    daily_life: { title: 'Бытовые мелочи', desc: 'Рецепты, поездки, переводы, выбор покупок' },
    advice: { title: 'Посоветоваться / поныть', desc: 'Разобрать ситуацию, принять решение' },
    fun_visuals: { title: 'Картинки, мемы и фан', desc: 'Генерация визуала, шутки, развлечения' },
    think_myself: { title: 'Люблю думать сам(а)', desc: 'Хочу тренировать свой мозг' },
    no_trust: { title: 'Не доверяю', desc: 'Много выдумок, ошибок и вопросы приватности' },
    no_need: { title: 'Просто не нужно', desc: 'В моей жизни и без него всё отлично' },
    hype_fatigue: { title: 'Устал(а) от ИИ-хайпа', desc: 'Принципиально избегаю синтетики' },
    no_time: { title: 'Ещё не дошли руки', desc: 'Не было времени спокойно разобраться' },
  },
  legendNoSignal: 'Нет данных',
  legendNoSignalShort: 'Нет',
  legendCalibrating: 'Мало данных',
  legendCalibratingShort: 'Мало',
  legendCities: 'Города',
  legendScaleLabel: 'С ИИ:',
  legendLow: '0%',
  legendHigh: '100%',
  signalStrengthLabels: {
    0: 'Нет данных',
    1: 'Мало данных',
    2: 'Предварительно',
    3: 'Точные данные',
  },
  votesCount: '{n} отв.',
  panelTabs: {
    rankings: 'Страны',
    roles: 'Сферы',
    cases: 'Задачи',
  },
  mobileListBtn: 'Статистика',
  panelTopCountries: 'Страны на карте',
  panelTopCities: 'Города на карте',
  panelSearchPlaceholder: 'Найти любую страну или город...',
  panelSearchNoResults: 'Ничего не найдено',
  panelCitiesInCountry: 'Города в этой стране',
  panelBackToCountry: 'Назад: {country}',
  panelCalibratingNote: 'Где данных ещё мало, видны живые точки — цвет страны появится после набора минимума.',
  panelNoDataYet: 'Ответов пока нет. Добавь первый ответ на карту!',
  panelInspectBack: 'Ко всем странам',
  panelAiIndex: 'Индекс активности ИИ',
  panelUsingAi: 'среди ответивших с AI',
  panelPersonalVsWork: 'Быт и работа',
  panelTopCases: 'Для каких задач',
  panelTopRoles: 'Где чаще используют',
  panelRolesFilterHint: 'Нажми на сферу, чтобы отфильтровать карту',
  panelCasesFilterHint: 'Нажми на пункт, чтобы отфильтровать карту',
  panelCasesGroupAi: 'Для чего используют AI',
  panelCasesGroupNoAi: 'Почему обходятся без AI',
  panelNeedsMoreSignals: 'Нужно ещё {n} ответов, чтобы открыть рейтинг',
  panelCompareYourself: 'А как у тебя с ИИ? Добавить свой ответ',
  surveyTitle: 'Как у тебя с ИИ?',
  surveySubtitle: 'Анонимно · Без регистрации',
  surveyStepCounter: 'Шаг {step} из {total}',
  surveyStepLevel: 'Как часто ты пользуешься ИИ?',
  surveyStepDomainsAi: 'Где именно тебе помогает ИИ?',
  surveyStepDomainsAiHint: 'Выбери один или несколько вариантов',
  surveyStepDomainsNoAi: 'Чем ты в основном занимаешься?',
  surveyStepDomainsNoAiHint: 'Выбери один или несколько вариантов',
  surveyDomainGroups: {
    life: 'Жизнь и учёба',
    digital: 'Диджитал и офис',
    offline: 'Офлайн и наука',
  },
  surveySelectedCount: 'Выбрано: {n}',
  surveyStepSymptomsAi: 'Что чаще всего спихиваешь на ИИ?',
  surveyStepSymptomsNoAi: 'Почему обходишься без ИИ?',
  surveyStepSymptomsHint: 'Необязательно — можно выбрать сколько угодно',
  surveySkip: 'Пропустить',
  surveyStepLocation: 'Откуда ты?',
  surveyCountryLabel: 'Страна',
  surveyCityOptionalLabel: 'Город (необязательно)',
  surveyPrivacyNote: 'Без личных данных — сохраняется только город или страна на твой выбор.',
  surveySearchCity: 'Найти или ввести любой город...',
  surveyUseCustomCity: 'Указать «{city}»',
  surveySubmit: 'Готово',
  surveySubmitting: 'Сохраняем...',
  surveyNext: 'Дальше',
  surveyBack: 'Назад',
  surveyAddDetails: 'Уточнить детали',
  surveyDetailsHint: 'Необязательно — помогает фильтровать карту по сферам и задачам',
  surveyChangeLocation: 'Изменить',
  reportTitle: 'Твой ответ',
  reportThanksTitle: 'Спасибо! Твой ответ на карте',
  reportFirstCity: 'ПЕРВЫЙ ОТВЕТ ИЗ ГОРОДА {city}!',
  reportFirstCountry: 'ПЕРВЫЙ ОТВЕТ ИЗ СТРАНЫ {country}!',
  reportCountryCollectingTitle: '{country} — мало данных ({cur} из {target})',
  reportCountryCollectingDesc: 'Записали! Нужно ещё {n} чел. отсюда, чтобы открыть статистику страны на карте.',
  reportCountryActiveTitle: 'В стране {country} ИИ пользуются {pct}%',
  reportCountryBasedOn: 'На основе {n} анонимных ответов',
  reportDomainActiveTitle: '«{domain}» — ИИ пользуются {pct}%',
  reportAroundYou: 'А как у других',
  reportOutOfTen: '{n} из 10 ответивших с AI',
  reportUnlockShort: 'Ещё {n} чел. — и откроется статистика страны',
  reportCompareHigher: 'Ты пользуешься ИИ чаще большинства здесь.',
  reportCompareMatch: 'Ты прямо на одной волне с большинством.',
  reportCompareLower: 'Ты держишься без ИИ стойче, чем большинство здесь.',
  reportShareBtn: 'Позвать друзей',
  reportShareCopied: 'Ссылка скопирована!',
  reportEditBtn: 'Изменить ответ',
  reportExploreMap: 'Смотреть карту',
  tickerLive: 'ЭФИР',
  tickerEmpty: 'Ждём первые анонимные ответы со всего мира...',
  mapZoomIn: 'Приблизить',
  mapZoomOut: 'Отдалить',
  mapReset: 'Показать весь мир',
  themeLight: 'Светлая тема',
  themeDark: 'Тёмная тема',
  myLocationBadge: 'Ты здесь',
  myLocationOnlyYou: 'Метку «Ты здесь» видишь только ты',
  a11yLanguage: 'Выбрать язык',
  a11yHideSidebar: 'Скрыть панель',
  a11yShowSidebar: 'Показать панель',
  a11yClose: 'Закрыть',
  a11yClear: 'Очистить',
  a11yMapLabel: 'Интерактивная карта использования AI по миру',
  periodLabels: {
    '12m': 'Год назад',
    '6m': '6 месяцев назад',
    '3m': '3 месяца назад',
    now: 'Сейчас',
  },
  periodShortLabels: {
    '12m': 'Год назад',
    '6m': '6 мес',
    '3m': '3 мес',
    now: 'Сейчас',
  },
  summaryCoverageTitle: 'Покрытие',
  summaryAnswersTitle: 'Ответов',
  summaryUsingAiTitle: 'С ИИ',
  summaryCoverageTooltip: 'Сколько стран из 195 уже отмечены на карте (хотя бы 1 анонимный ответ)',
  summaryAnswersTooltip: 'Сколько анонимных ответов учтено на карте на выбранный момент',
  summaryUsingAiTooltip: 'Доля ответивших, которые пользуются ИИ хотя бы иногда',
  timelineBtn: 'Динамика',
  timelineBefore: 'Тогда',
  timelineAfter: 'Сейчас',
  timelineSplitBtn: 'Мир тогда и сейчас',
  timelineSplitHint: 'Тяни разделитель влево-вправо, чтобы сравнить мир тогда и сейчас',
  timelineCountriesShort: '{n} стран',
  timelineAiShort: '{pct}% с ИИ',
  timelinePlay: 'Запустить анимацию роста',
  timelinePause: 'Пауза',
  timelineCollapse: 'Свернуть панель',
  timelineExpand: 'Показать динамику и сравнение',
  timelineSliderLabel: 'Выбрать период времени',
  timelineCompareTooltip: 'Сравнить два периода на карте («Было — стало»)',
  shareBtn: 'Поделиться',
  shareTitle: 'Поделиться картой',
  shareSubtitle: 'Отправь этот вид карты или позови друзей отметить свой ответ',
  shareCopyLink: 'Скопировать ссылку',
  shareCopied: 'Ссылка скопирована!',
  shareNativeBtn: 'Другие приложения...',
  sharePlaceTooltip: 'Поделиться ссылкой на это место',
  shareTextGlobal: 'How’s AI Going? — живая анонимная карта того, как в мире пользуются ИИ:',
  shareTextCountry: 'В локации {place} ИИ пользуются {pct}% ответивших. Посмотри карту How’s AI Going?:',
  feedbackBtn: 'Фидбек',
  feedbackTitle: 'Обратная связь',
  feedbackSubtitle: 'Есть идея, ошибка или неточность на карте? Напиши нам.',
  feedbackKinds: {
    idea: 'Идея',
    bug: 'Баг',
    data: 'Карта / данные',
    other: 'Другое',
  },
  feedbackPlaceholder: 'Расскажи, что можно улучшить...',
  feedbackContactPlaceholder: 'Контакт для ответа (необязательно: Telegram, email)',
  feedbackSend: 'Отправить',
  feedbackSending: 'Отправляем...',
  feedbackThanksTitle: 'Спасибо за фидбек!',
  feedbackThanksDesc: 'Мы читаем каждое сообщение и улучшаем How’s AI Going? по твоим идеям.',
  feedbackDone: 'Готово',
  aboutFeedbackLink: 'Есть идея или нашёлся баг? Написать нам',
  disputedTerritory: 'Спорная территория',
};

const ES: Dictionary = {
  ...EN,
  tagline: 'Mapa en vivo del uso real',
  taglineShort: 'Mapa en vivo del uso real',
  ctaReport: '¿Qué tal con la IA?',
  ctaUpdate: 'Mi respuesta',
  statsCountries: 'Países',
  statsCities: 'Ciudades',
  statsSignals: 'Respuestas',
  statsGlobalIndex: 'Usan IA',
  filterAllRoles: 'Todas las áreas',
  filterAllContexts: 'Trabajo y vida',
  levelLabels: {
    0: { title: 'Nunca', desc: 'Me arreglo sin IA por ahora' },
    1: { title: 'A veces', desc: 'Un par de veces al mes' },
    2: { title: 'A menudo', desc: 'Varias veces por semana' },
    3: { title: 'Todos los días', desc: 'Mi herramienta diaria para casi todo' },
  },
  verdicts: {
    0: { title: 'Modo Clásico', subtitle: '100% cerebro humano sin ayuda.' },
    1: { title: 'Explorador Curioso', subtitle: 'Usas IA cuando surge la ocasión.' },
    2: { title: 'Aliado Digital', subtitle: 'La IA ya es tu ayudante silenciosa.' },
    3: { title: 'Piloto Automático', subtitle: 'Tu día empieza con un prompt.' },
  },
  roleLabels: {
    tech: 'Tech y código',
    design: 'Diseño y arte',
    media: 'Textos y marketing',
    office: 'Oficina y negocios',
    student: 'Estudios',
    education: 'Ciencia y docencia',
    health: 'Salud',
    trades: 'Trabajo manual',
    service: 'Servicios y ventas',
    founder: 'Freelance / Negocio',
    home: 'Hogar y familia',
    other: 'Hobbies y ocio',
  },
  legendNoSignal: 'Sin datos',
  legendCalibrating: 'Pocos datos',
  legendScaleLabel: 'Con IA:',
  legendLow: '0%',
  legendHigh: '100%',
  votesCount: '{n} resp.',
  panelTabs: { rankings: 'Países', roles: 'Áreas', cases: 'Usos' },
  mobileListBtn: 'Datos',
  surveyTitle: '¿Qué tal con la IA?',
  surveyStepCounter: 'Paso {step} de {total}',
  surveyStepLevel: '¿Con qué frecuencia usas IA?',
  surveyStepDomainsAi: '¿Dónde te ayuda la IA?',
  surveyStepDomainsAiHint: 'Trabajo, estudio, día a día — elige hasta 3',
  surveyStepDomainsNoAi: '¿A qué te dedicas principalmente?',
  surveyStepDomainsNoAiHint: 'Elige 1 o 2 opciones',
  surveyStepSymptomsAi: '¿Para qué usas la IA con más frecuencia?',
  surveyStepSymptomsNoAi: '¿Por qué prefieres no usar IA?',
  surveyStepLocation: '¿Desde dónde respondes?',
  surveyCountryLabel: 'País',
  surveyCityOptionalLabel: 'Ciudad (opcional)',
  surveySearchCity: 'Buscar o escribir cualquier ciudad...',
  surveySubmit: 'Listo',
  surveyNext: 'Siguiente',
  surveyBack: 'Atrás',
  reportTitle: 'Tu respuesta',
  reportCountryCollectingTitle: '{country} — reuniendo votos ({cur} de {target})',
  reportCountryCollectingDesc: '¡Tu voto cuenta! Faltan {n} respuestas locales para abrir las estadísticas del país.',
  reportCountryActiveTitle: 'En {country}, el {pct}% usa IA',
  reportCountryBasedOn: 'Basado en {n} respuestas anónimas',
  reportDomainActiveTitle: '«{domain}» — el {pct}% usa IA',
  reportShareBtn: 'Invitar amigos',
  reportShareCopied: '¡Enlace copiado!',
  reportEditBtn: 'Cambiar mi respuesta',
  reportExploreMap: 'Explorar mapa',
  timelineSplitBtn: 'Mundo antes y ahora',
  tickerLive: 'EN VIVO',
};

const PT_BR: Dictionary = {
  ...EN,
  tagline: 'Mapa ao vivo do uso real',
  taglineShort: 'Mapa ao vivo do uso real',
  ctaReport: 'Como vai com a IA?',
  ctaUpdate: 'Minha resposta',
  statsCountries: 'Países',
  statsCities: 'Cidades',
  statsSignals: 'Respostas',
  statsGlobalIndex: 'Usam IA',
  filterAllRoles: 'Todas as áreas',
  filterAllContexts: 'Trabalho e vida',
  levelLabels: {
    0: { title: 'Nunca', desc: 'Me viro sem IA por enquanto' },
    1: { title: 'Às vezes', desc: 'Algumas vezes por mês' },
    2: { title: 'Com frequência', desc: 'Várias vezes por semana' },
    3: { title: 'Todo dia', desc: 'Ferramenta padrão no meu dia a dia' },
  },
  verdicts: {
    0: { title: 'Modo Raiz', subtitle: '100% cérebro humano em ação.' },
    1: { title: 'Explorador Casual', subtitle: 'Usa IA quando dá vontade.' },
    2: { title: 'Parceiro de IA', subtitle: 'A IA já virou sua aliada silenciosa.' },
    3: { title: 'Piloto Automático', subtitle: 'Seu dia já começa com um prompt.' },
  },
  roleLabels: {
    tech: 'Tech e código',
    design: 'Design e criação',
    media: 'Texto e marketing',
    office: 'Escritório e negócios',
    student: 'Estudos',
    education: 'Ciência e ensino',
    health: 'Saúde',
    trades: 'Trabalho manual',
    service: 'Serviços e vendas',
    founder: 'Negócio próprio',
    home: 'Casa e família',
    other: 'Hobbies e lazer',
  },
  legendNoSignal: 'Sem dados',
  legendCalibrating: 'Poucos dados',
  legendScaleLabel: 'Com IA:',
  legendLow: '0%',
  legendHigh: '100%',
  votesCount: '{n} resp.',
  panelTabs: { rankings: 'Países', roles: 'Áreas', cases: 'Usos' },
  mobileListBtn: 'Datos',
  surveyTitle: 'Como vai com a IA?',
  surveyStepCounter: 'Passo {step} de {total}',
  surveyStepLevel: 'Com que frequência você usa IA?',
  surveyStepDomainsAi: 'Onde a IA mais te ajuda?',
  surveyStepDomainsAiHint: 'Trabalho, estudos, dia a dia — escolha até 3',
  surveyStepDomainsNoAi: 'Com o que você mais se ocupa?',
  surveyStepDomainsNoAiHint: 'Escolha 1 ou 2 opções',
  surveyStepSymptomsAi: 'Para que você mais usa IA?',
  surveyStepSymptomsNoAi: 'Por que você evita usar IA?',
  surveyStepLocation: 'De onde você está respondendo?',
  surveyCountryLabel: 'País',
  surveyCityOptionalLabel: 'Cidade (opcional)',
  surveySearchCity: 'Buscar ou digitar qualquer cidade...',
  surveySubmit: 'Pronto',
  surveyNext: 'Continuar',
  surveyBack: 'Voltar',
  reportTitle: 'Sua resposta',
  reportCountryCollectingTitle: '{country} — coletando votos ({cur} de {target})',
  reportCountryCollectingDesc: 'Seu voto foi registrado! Faltam {n} respostas locais para liberar o índice do país.',
  reportCountryActiveTitle: 'Em {country}, {pct}% usam IA',
  reportCountryBasedOn: 'Com base em {n} respostas anônimas',
  reportDomainActiveTitle: '«{domain}» — {pct}% usam IA',
  reportShareBtn: 'Convidar amigos',
  reportShareCopied: 'Link copiado!',
  reportEditBtn: 'Editar minha resposta',
  reportExploreMap: 'Explorar mapa',
  timelineSplitBtn: 'Mundo antes e agora',
  tickerLive: 'AO VIVO',
};

const JA: Dictionary = {
  ...EN,
  tagline: '世界のリアルな利用マップ',
  taglineShort: '世界のリアルな利用マップ',
  ctaReport: 'AI、どうしてる？',
  ctaUpdate: '自分の回答',
  statsCountries: '国・地域',
  statsCities: '都市',
  statsSignals: '回答数',
  statsGlobalIndex: 'AI利用',
  filterAllRoles: 'すべての分野',
  levelLabels: {
    0: { title: '使わない', desc: '今のところ自力で十分' },
    1: { title: 'たまに使う', desc: '月に数回、ちょっとした時に' },
    2: { title: 'よく使う', desc: '週に数回は使っている' },
    3: { title: '毎日使う', desc: 'ほぼ毎日欠かせないツール' },
  },
  verdicts: {
    0: { title: 'アナログ派', subtitle: '100%自分の頭脳で勝負！' },
    1: { title: 'ライトユーザー', subtitle: '気が向いたときにAIを活用中。' },
    2: { title: 'AIパートナー', subtitle: '日常の頼れる相棒になっています。' },
    3: { title: 'フルオートモード', subtitle: '1日がプロンプトから始まる生活。' },
  },
  legendNoSignal: 'データなし',
  legendCalibrating: '集計中',
  legendScaleLabel: 'AI利用:',
  legendLow: '0%',
  legendHigh: '100%',
  votesCount: '{n}件',
  panelTabs: { rankings: '国・地域', roles: '分野', cases: '用途' },
  mobileListBtn: '統計',
  surveyTitle: 'AI、どうしてる？',
  surveyStepCounter: 'ステップ {step} / {total}',
  surveyStepLevel: 'どのくらいの頻度でAIを使っていますか？',
  surveyStepDomainsAi: 'どんな場面でAIを使っていますか？',
  surveyStepDomainsAiHint: '仕事・学習・日常から最大3つ選択',
  surveyStepDomainsNoAi: '普段は主に何をしていますか？',
  surveyStepDomainsNoAiHint: '1〜2つ選択',
  surveyStepSymptomsAi: 'AIに任せることが多いのは？',
  surveyStepSymptomsNoAi: 'AIを使わない理由は？',
  surveyStepLocation: 'どの地域から回答していますか？',
  surveyCountryLabel: '国・地域',
  surveyCityOptionalLabel: '都市（任意）',
  surveySearchCity: '都市名を入力または検索...',
  surveySubmit: '完了',
  surveyNext: '次へ',
  surveyBack: '戻る',
  reportTitle: 'あなたの回答',
  reportCountryCollectingTitle: '{country} — 集計中（{cur} / {target}件）',
  reportCountryCollectingDesc: '回答を記録しました！あと{n}件集まるとこの国のスコアが公開されます。',
  reportCountryActiveTitle: '{country}では{pct}%がAIを利用',
  reportCountryBasedOn: '匿名の回答{n}件に基づく',
  reportDomainActiveTitle: '「{domain}」では{pct}%がAIを利用',
  reportShareBtn: '友達を誘う',
  reportShareCopied: 'コピーしました！',
  reportEditBtn: '回答を変更する',
  reportExploreMap: 'マップを見る',
  timelineSplitBtn: '世界の過去と今',
  tickerLive: 'ライブ',
};

const KO: Dictionary = {
  ...EN,
  tagline: '전 세계 실제 사용 지도',
  taglineShort: '전 세계 실제 사용 지도',
  ctaReport: 'AI와는 어때요?',
  ctaUpdate: '내 답변',
  statsCountries: '국가',
  statsCities: '도시',
  statsSignals: '응답 수',
  statsGlobalIndex: 'AI 사용',
  filterAllRoles: '모든 영역',
  levelLabels: {
    0: { title: '안 써요', desc: '아직 AI 없이도 충분해요' },
    1: { title: '가끔 써요', desc: '한 달에 몇 번 가볍게' },
    2: { title: '자주 써요', desc: '일주일에 여러 번 사용해요' },
    3: { title: '매일 써요', desc: '거의 매일 쓰는 기본 도구예요' },
  },
  verdicts: {
    0: { title: '아날로그 파', subtitle: '100% 순수 두뇌로 버티는 중!' },
    1: { title: '가벼운 탐험가', subtitle: '필요할 때만 슬쩍 AI를 꺼내 써요.' },
    2: { title: 'AI 단짝', subtitle: 'AI가 이미 든든한 조수가 되었어요.' },
    3: { title: '풀 오토파일럿', subtitle: '하루가 프롬프트로 시작되는 삶.' },
  },
  legendNoSignal: '데이터 없음',
  legendCalibrating: '수집 중',
  legendScaleLabel: 'AI 사용:',
  legendLow: '0%',
  legendHigh: '100%',
  votesCount: '{n}명',
  panelTabs: { rankings: '국가', roles: '영역', cases: '용도' },
  mobileListBtn: '통계',
  surveyTitle: 'AI와는 어때요?',
  surveyStepCounter: '{step} / {total} 단계',
  surveyStepLevel: 'AI를 얼마나 자주 사용하나요?',
  surveyStepDomainsAi: '주로 어디에서 AI의 도움을 받나요?',
  surveyStepDomainsAiHint: '업무·학업·일상 중 최대 3개 선택',
  surveyStepDomainsNoAi: '주로 어떤 일을 하고 계신가요?',
  surveyStepDomainsNoAiHint: '1~2개 선택',
  surveyStepSymptomsAi: 'AI에게 가장 자주 맡기는 일은?',
  surveyStepSymptomsNoAi: 'AI를 쓰지 않는 이유는?',
  surveyStepLocation: '어디에서 참여하나요?',
  surveyCountryLabel: '국가',
  surveyCityOptionalLabel: '도시 (선택)',
  surveySearchCity: '도시 검색 또는 입력...',
  surveySubmit: '완료',
  surveyNext: '다음',
  surveyBack: '이전',
  reportTitle: '나의 답변',
  reportCountryCollectingTitle: '{country} — 응답 수집 중 ({cur} / {target})',
  reportCountryCollectingDesc: '응답이 반영됐어요! 지역 응답 {n}개가 더 모이면 국가 통계가 열립니다.',
  reportCountryActiveTitle: '{country}에서는 {pct}%가 AI를 사용해요',
  reportCountryBasedOn: '익명 응답 {n}개 기준',
  reportDomainActiveTitle: '‘{domain}’에서는 {pct}%가 AI를 사용해요',
  reportShareBtn: '친구 초대하기',
  reportShareCopied: '링크 복사됨!',
  reportEditBtn: '내 답변 수정',
  reportExploreMap: '지도 보기',
  timelineSplitBtn: '세계의 과거와 현재',
  tickerLive: '실시간',
};

const DE: Dictionary = {
  ...EN,
  tagline: 'Live-Karte der echten Nutzung',
  taglineShort: 'Live-Karte der echten Nutzung',
  ctaReport: 'Wie läuft’s mit KI?',
  ctaUpdate: 'Meine Antwort',
  statsCountries: 'Länder',
  statsCities: 'Städte',
  statsSignals: 'Antworten',
  statsGlobalIndex: 'Nutzen KI',
  filterAllRoles: 'Alle Bereiche',
  levelLabels: {
    0: { title: 'Nie', desc: 'Komme bisher ohne KI aus' },
    1: { title: 'Gelegentlich', desc: 'Ein paar Mal im Monat' },
    2: { title: 'Regelmäßig', desc: 'Mehrmals pro Woche' },
    3: { title: 'Täglich', desc: 'Fester Teil fast jedes Tages' },
  },
  verdicts: {
    0: { title: 'Oldschool-Modus', subtitle: '100% echtes menschliches Gehirn.' },
    1: { title: 'Neugieriger Gast', subtitle: 'Nutzt KI nach Lust und Laune.' },
    2: { title: 'KI-Teamplayer', subtitle: 'KI ist längst dein stiller Helfer.' },
    3: { title: 'Voll-Autopilot', subtitle: 'Dein Tag startet mit einem Prompt.' },
  },
  legendNoSignal: 'Keine Daten',
  legendCalibrating: 'Wenig Daten',
  legendScaleLabel: 'Mit KI:',
  legendLow: '0%',
  legendHigh: '100%',
  votesCount: '{n} Antw.',
  panelTabs: { rankings: 'Länder', roles: 'Bereiche', cases: 'Fälle' },
  mobileListBtn: 'Statistik',
  surveyTitle: 'Wie läuft’s mit KI?',
  surveyStepCounter: 'Schritt {step} von {total}',
  surveyStepLevel: 'Wie oft nutzt du KI?',
  surveyStepDomainsAi: 'Wo hilft dir KI im Alltag oder Job?',
  surveyStepDomainsAiHint: 'Bis zu 3 auswählen',
  surveyStepDomainsNoAi: 'Was machst du hauptsächlich?',
  surveyStepDomainsNoAiHint: '1–2 auswählen',
  surveyStepSymptomsAi: 'Wofür nutzt du KI am häufigsten?',
  surveyStepSymptomsNoAi: 'Warum verzichtest du auf KI?',
  surveyStepLocation: 'Von wo machst du mit?',
  surveyCountryLabel: 'Land',
  surveyCityOptionalLabel: 'Stadt (optional)',
  surveySearchCity: 'Stadt suchen oder eingeben...',
  surveySubmit: 'Fertig',
  surveyNext: 'Weiter',
  surveyBack: 'Zurück',
  reportTitle: 'Deine Antwort',
  reportCountryCollectingTitle: '{country} — wir sammeln Stimmen ({cur} von {target})',
  reportCountryCollectingDesc: 'Deine Stimme zählt! Noch {n} Antworten aus diesem Land, dann wird der Länder-Score freigeschaltet.',
  reportCountryActiveTitle: 'In {country} nutzen {pct}% KI',
  reportCountryBasedOn: 'Basierend auf {n} anonymen Antworten',
  reportDomainActiveTitle: '„{domain}“ — {pct}% nutzen KI',
  reportShareBtn: 'Freunde einladen',
  reportShareCopied: 'Link kopiert!',
  reportEditBtn: 'Antwort ändern',
  reportExploreMap: 'Karte erkunden',
  timelineSplitBtn: 'Welt damals & heute',
  tickerLive: 'LIVE',
};

const DICTIONARIES: Record<Locale, Dictionary> = {
  en: EN,
  ru: RU,
  es: ES,
  'pt-BR': PT_BR,
  ja: JA,
  ko: KO,
  de: DE,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? EN;
}

export function detectInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('ai-cover-locale') as Locale | null;
    if (saved && saved in DICTIONARIES) return saved;
  } catch {
    // ignore storage errors
  }

  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('pt')) return 'pt-BR';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('de')) return 'de';
  return 'en';
}
