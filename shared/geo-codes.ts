/**
 * Mapping between ISO-3166 numeric IDs (used in world-atlas/countries-110m.json)
 * and ISO-3166-1 alpha-2 codes (used by Cloudflare request.cf.country & Intl.DisplayNames).
 */
export const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '010': 'AQ', '012': 'DZ', '020': 'AD', '024': 'AO',
  '031': 'AZ', '032': 'AR', '036': 'AU', '040': 'AT', '044': 'BS', '048': 'BH',
  '050': 'BD', '051': 'AM', '056': 'BE', '064': 'BT', '068': 'BO',
  '070': 'BA', '072': 'BW', '076': 'BR', '084': 'BZ', '090': 'SB',
  '096': 'BN', '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY',
  '116': 'KH', '120': 'CM', '124': 'CA', '140': 'CF', '144': 'LK',
  '148': 'TD', '152': 'CL', '156': 'CN', '158': 'TW', '170': 'CO',
  '178': 'CG', '180': 'CD', '188': 'CR', '191': 'HR', '192': 'CU',
  '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '214': 'DO',
  '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER',
  '233': 'EE', '238': 'FK', '242': 'FJ', '246': 'FI', '250': 'FR',
  '260': 'TF', '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM',
  '275': 'PS', '276': 'DE', '288': 'GH', '300': 'GR', '304': 'GL',
  '320': 'GT', '324': 'GN', '328': 'GY', '332': 'HT', '340': 'HN', '344': 'HK',
  '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR',
  '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI',
  '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE',
  '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA',
  '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY',
  '440': 'LT', '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV',
  '466': 'ML', '470': 'MT', '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC',
  '496': 'MN', '498': 'MD',
  '499': 'ME', '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA',
  '524': 'NP', '528': 'NL', '540': 'NC', '548': 'VU', '554': 'NZ',
  '558': 'NI', '562': 'NE', '566': 'NG', '578': 'NO', '586': 'PK',
  '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH',
  '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR',
  '634': 'QA', '642': 'RO', '643': 'RU', '646': 'RW', '682': 'SA',
  '686': 'SN', '688': 'RS', '694': 'SL', '702': 'SG', '703': 'SK',
  '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW',
  '724': 'ES', '728': 'SS', '729': 'SD', '732': 'EH', '740': 'SR',
  '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ',
  '764': 'TH', '768': 'TG', '780': 'TT', '784': 'AE', '788': 'TN',
  '792': 'TR', '795': 'TM', '800': 'UG', '804': 'UA', '807': 'MK',
  '818': 'EG', '826': 'GB', '834': 'TZ', '840': 'US', '854': 'BF',
  '858': 'UY', '860': 'UZ', '862': 'VE', '887': 'YE', '894': 'ZM',
};

export const ALPHA2_SET = new Set(Object.values(NUMERIC_TO_ALPHA2));

export type SupportedLocale = 'en' | 'ru' | 'es' | 'pt-BR' | 'ja' | 'ko' | 'de';

export interface PresetCity {
  /** Canonical English key stored in DB so votes merge across languages */
  city: string;
  countryCode: string;
  lat: number;
  lng: number;
  names: Partial<Record<SupportedLocale, string>>;
}

export const PRESET_CITIES: PresetCity[] = [
  { city: 'New York', countryCode: 'US', lat: 40.7, lng: -74.0, names: { ru: 'Нью-Йорк', es: 'Nueva York', 'pt-BR': 'Nova York', ja: 'ニューヨーク', ko: '뉴욕', de: 'New York' } },
  { city: 'San Francisco', countryCode: 'US', lat: 37.8, lng: -122.4, names: { ru: 'Сан-Франциско', ja: 'サンフランシスコ', ko: '샌프란시스코' } },
  { city: 'Los Angeles', countryCode: 'US', lat: 34.1, lng: -118.2, names: { ru: 'Лос-Анджелес', es: 'Los Ángeles', ja: 'ロサンゼルス', ko: '로스앤젤레스' } },
  { city: 'Austin', countryCode: 'US', lat: 30.3, lng: -97.7, names: { ru: 'Остин', ja: 'オースティン', ko: '오스틴' } },
  { city: 'London', countryCode: 'GB', lat: 51.5, lng: -0.1, names: { ru: 'Лондон', es: 'Londres', 'pt-BR': 'Londres', ja: 'ロンドン', ko: '런던', de: 'London' } },
  { city: 'Berlin', countryCode: 'DE', lat: 52.5, lng: 13.4, names: { ru: 'Берлин', es: 'Berlín', 'pt-BR': 'Berlim', ja: 'ベルリン', ko: '베를린', de: 'Berlin' } },
  { city: 'Munich', countryCode: 'DE', lat: 48.1, lng: 11.6, names: { ru: 'Мюнхен', es: 'Múnich', 'pt-BR': 'Munique', ja: 'ミュンヘン', ko: '뮌헨', de: 'München' } },
  { city: 'Paris', countryCode: 'FR', lat: 48.9, lng: 2.4, names: { ru: 'Париж', es: 'París', 'pt-BR': 'Paris', ja: 'パリ', ko: '파리', de: 'Paris' } },
  { city: 'Madrid', countryCode: 'ES', lat: 40.4, lng: -3.7, names: { ru: 'Мадрид', ja: 'マドリード', ko: '마드리드' } },
  { city: 'Barcelona', countryCode: 'ES', lat: 41.4, lng: 2.2, names: { ru: 'Барселона', ja: 'バルセロナ', ko: '바르셀로나' } },
  { city: 'Lisbon', countryCode: 'PT', lat: 38.7, lng: -9.1, names: { ru: 'Лиссабон', es: 'Lisboa', 'pt-BR': 'Lisboa', ja: 'リスボン', ko: '리스본', de: 'Lissabon' } },
  { city: 'Amsterdam', countryCode: 'NL', lat: 52.4, lng: 4.9, names: { ru: 'Амстердам', es: 'Ámsterdam', 'pt-BR': 'Amsterdã', ja: 'アムステルダム', ko: '암스테르담' } },
  { city: 'Rome', countryCode: 'IT', lat: 41.9, lng: 12.5, names: { ru: 'Рим', es: 'Roma', 'pt-BR': 'Roma', ja: 'ローマ', ko: '로마', de: 'Rom' } },
  { city: 'Milan', countryCode: 'IT', lat: 45.5, lng: 9.2, names: { ru: 'Милан', es: 'Milán', 'pt-BR': 'Milão', ja: 'ミラノ', ko: '밀라노', de: 'Mailand' } },
  { city: 'Prague', countryCode: 'CZ', lat: 50.1, lng: 14.4, names: { ru: 'Прага', es: 'Praga', 'pt-BR': 'Praga', ja: 'プラハ', ko: '프라하', de: 'Prag' } },
  { city: 'Warsaw', countryCode: 'PL', lat: 52.2, lng: 21.0, names: { ru: 'Варшава', es: 'Varsovia', 'pt-BR': 'Varsóvia', ja: 'ワルシャワ', ko: '바르샤바', de: 'Warschau' } },
  { city: 'Stockholm', countryCode: 'SE', lat: 59.3, lng: 18.1, names: { ru: 'Стокгольм', es: 'Estocolmo', 'pt-BR': 'Estocolmo', ja: 'ストックホルム', ko: '스톡홀름' } },
  { city: 'Helsinki', countryCode: 'FI', lat: 60.2, lng: 24.9, names: { ru: 'Хельсинки', ja: 'ヘルシンキ', ko: '헬싱키' } },
  { city: 'Belgrade', countryCode: 'RS', lat: 44.8, lng: 20.5, names: { ru: 'Белград', es: 'Belgrado', 'pt-BR': 'Belgrado', ja: 'ベオグラード', ko: '베오그라드', de: 'Belgrad' } },
  { city: 'Tokyo', countryCode: 'JP', lat: 35.7, lng: 139.7, names: { ru: 'Токио', es: 'Tokio', 'pt-BR': 'Tóquio', ja: '東京', ko: '도쿄', de: 'Tokio' } },
  { city: 'Osaka', countryCode: 'JP', lat: 34.7, lng: 135.5, names: { ru: 'Осака', ja: '大阪', ko: '오사카' } },
  { city: 'Seoul', countryCode: 'KR', lat: 37.6, lng: 127.0, names: { ru: 'Сеул', es: 'Seúl', 'pt-BR': 'Seul', ja: 'ソウル', ko: '서울' } },
  { city: 'Singapore', countryCode: 'SG', lat: 1.4, lng: 103.8, names: { ru: 'Сингапур', es: 'Singapur', 'pt-BR': 'Singapura', ja: 'シンガポール', ko: '싱가포르', de: 'Singapur' } },
  { city: 'Bangkok', countryCode: 'TH', lat: 13.8, lng: 100.5, names: { ru: 'Бангкок', ja: 'バンコク', ko: '방콕' } },
  { city: 'Chiang Mai', countryCode: 'TH', lat: 18.8, lng: 99.0, names: { ru: 'Чиангмай', ja: 'チェンマイ', ko: '치앙마이' } },
  { city: 'Phuket', countryCode: 'TH', lat: 7.9, lng: 98.4, names: { ru: 'Пхукет', ja: 'プーケット', ko: '푸껫' } },
  { city: 'Bali', countryCode: 'ID', lat: -8.4, lng: 115.2, names: { ru: 'Бали', ja: 'バリ', ko: '발리' } },
  { city: 'Jakarta', countryCode: 'ID', lat: -6.2, lng: 106.8, names: { ru: 'Джакарта', es: 'Yakarta', 'pt-BR': 'Jacarta', ja: 'ジャカルタ', ko: '자카르타' } },
  { city: 'Kuala Lumpur', countryCode: 'MY', lat: 3.1, lng: 101.7, names: { ru: 'Куала-Лумпур', ja: 'クアラルンプール', ko: '쿠알라룸푸르' } },
  { city: 'Manila', countryCode: 'PH', lat: 14.6, lng: 121.0, names: { ru: 'Манила', ja: 'マニラ', ko: '마닐라' } },
  { city: 'Limassol', countryCode: 'CY', lat: 34.7, lng: 33.0, names: { ru: 'Лимасол', ja: 'リマソール', ko: '리마솔' } },
  { city: 'Ho Chi Minh City', countryCode: 'VN', lat: 10.8, lng: 106.7, names: { ru: 'Хошимин', ja: 'ホーチミン', ko: '호찌민' } },
  { city: 'Bengaluru', countryCode: 'IN', lat: 13.0, lng: 77.6, names: { ru: 'Бангалор', ja: 'ベンガルール', ko: '벵갈루루' } },
  { city: 'Mumbai', countryCode: 'IN', lat: 19.1, lng: 72.9, names: { ru: 'Мумбаи', ja: 'ムンバイ', ko: '뭄바이' } },
  { city: 'Sydney', countryCode: 'AU', lat: -33.9, lng: 151.2, names: { ru: 'Сидней', es: 'Sídney', ja: 'シドニー', ko: '시드니' } },
  { city: 'Melbourne', countryCode: 'AU', lat: -37.8, lng: 145.0, names: { ru: 'Мельбурн', ja: 'メルボルン', ko: '멜버른' } },
  { city: 'São Paulo', countryCode: 'BR', lat: -23.6, lng: -46.6, names: { ru: 'Сан-Паулу', es: 'São Paulo', 'pt-BR': 'São Paulo', ja: 'サンパウロ', ko: '상파울루' } },
  { city: 'Rio de Janeiro', countryCode: 'BR', lat: -22.9, lng: -43.2, names: { ru: 'Рио-де-Жанейро', es: 'Río de Janeiro', 'pt-BR': 'Rio de Janeiro', ja: 'リオデジャネイロ', ko: '리우데자네이루' } },
  { city: 'Buenos Aires', countryCode: 'AR', lat: -34.6, lng: -58.4, names: { ru: 'Буэнос-Айрес', ja: 'ブエノスアイレス', ko: '부에노스아이레스' } },
  { city: 'Mexico City', countryCode: 'MX', lat: 19.4, lng: -99.1, names: { ru: 'Мехико', es: 'Ciudad de México', 'pt-BR': 'Cidade do México', ja: 'メキシコシティ', ko: '멕시코시티', de: 'Mexiko-Stadt' } },
  { city: 'Bogotá', countryCode: 'CO', lat: 4.7, lng: -74.1, names: { ru: 'Богота', ja: 'ボゴタ', ko: '보고타' } },
  { city: 'Toronto', countryCode: 'CA', lat: 43.7, lng: -79.4, names: { ru: 'Торонто', ja: 'トロント', ko: '토론토' } },
  { city: 'Vancouver', countryCode: 'CA', lat: 49.3, lng: -123.1, names: { ru: 'Ванкувер', ja: 'バンクーバー', ko: '밴쿠버' } },
  { city: 'Moscow', countryCode: 'RU', lat: 55.8, lng: 37.6, names: { ru: 'Москва', es: 'Moscú', 'pt-BR': 'Moscou', ja: 'モスクワ', ko: '모스크바', de: 'Moskau' } },
  { city: 'Saint Petersburg', countryCode: 'RU', lat: 59.9, lng: 30.3, names: { ru: 'Санкт-Петербург', es: 'San Petersburgo', 'pt-BR': 'São Petersburgo', ja: 'サンクトペテルブルク', ko: '상트페테르부르크', de: 'Sankt Petersburg' } },
  { city: 'Novosibirsk', countryCode: 'RU', lat: 55.0, lng: 82.9, names: { ru: 'Новосибирск', ja: 'ノヴォシビルスク', ko: '노보시비르스크', de: 'Nowosibirsk' } },
  { city: 'Kazan', countryCode: 'RU', lat: 55.8, lng: 49.1, names: { ru: 'Казань', ja: 'カザン', ko: '카잔', de: 'Kasan' } },
  { city: 'Yekaterinburg', countryCode: 'RU', lat: 56.8, lng: 60.6, names: { ru: 'Екатеринбург', ja: 'エカテリンブルク', ko: '예카테린부르크', de: 'Jekaterinburg' } },
  { city: 'Almaty', countryCode: 'KZ', lat: 43.2, lng: 76.9, names: { ru: 'Алматы', ja: 'アルマトイ', ko: '알마티' } },
  { city: 'Astana', countryCode: 'KZ', lat: 51.2, lng: 71.4, names: { ru: 'Астана', ja: 'アスタナ', ko: '아스타나' } },
  { city: 'Tbilisi', countryCode: 'GE', lat: 41.7, lng: 44.8, names: { ru: 'Тбилиси', es: 'Tiflis', ja: 'トビリシ', ko: '트빌리시', de: 'Tiflis' } },
  { city: 'Yerevan', countryCode: 'AM', lat: 40.2, lng: 44.5, names: { ru: 'Ереван', es: 'Ereván', ja: 'エレバン', ko: '예레반', de: 'Jerewan' } },
  { city: 'Minsk', countryCode: 'BY', lat: 53.9, lng: 27.6, names: { ru: 'Минск', ja: 'ミンスク', ko: '민스크' } },
  { city: 'Kyiv', countryCode: 'UA', lat: 50.4, lng: 30.5, names: { ru: 'Киев', es: 'Kiev', 'pt-BR': 'Kiev', ja: 'キーウ', ko: '키이우', de: 'Kiew' } },
  { city: 'Tashkent', countryCode: 'UZ', lat: 41.3, lng: 69.3, names: { ru: 'Ташкент', ja: 'タシケント', ko: '타슈켄트', de: 'Taschkent' } },
  { city: 'Istanbul', countryCode: 'TR', lat: 41.0, lng: 29.0, names: { ru: 'Стамбул', es: 'Estambul', 'pt-BR': 'Istambul', ja: 'イスタンブール', ko: '이스탄불' } },
  { city: 'Dubai', countryCode: 'AE', lat: 25.2, lng: 55.3, names: { ru: 'Дубай', es: 'Dubái', ja: 'ドバイ', ko: '두바이' } },
  { city: 'Cairo', countryCode: 'EG', lat: 30.0, lng: 31.2, names: { ru: 'Каир', es: 'El Cairo', 'pt-BR': 'Cairo', ja: 'カイロ', ko: '카이로', de: 'Kairo' } },
  { city: 'Cape Town', countryCode: 'ZA', lat: -33.9, lng: 18.4, names: { ru: 'Кейптаун', es: 'Ciudad del Cabo', 'pt-BR': 'Cidade do Cabo', ja: 'ケープタウン', ko: '케이프타운', de: 'Kapstadt' } },
  { city: 'Lagos', countryCode: 'NG', lat: 6.5, lng: 3.4, names: { ru: 'Лагос', ja: 'ラゴス', ko: '라고스' } },
  { city: 'Reykjavik', countryCode: 'IS', lat: 64.1, lng: -21.9, names: { ru: 'Рейкьявик', es: 'Reikiavik', ja: 'レイキャビク', ko: '레이캬비크' } },
  { city: 'Nuuk', countryCode: 'GL', lat: 64.2, lng: -51.7, names: { ru: 'Нуук', ja: 'ヌーク', ko: '누크' } },
];

const CITY_LOOKUP = new Map<string, PresetCity>(
  PRESET_CITIES.map((c) => [`${c.countryCode}:${c.city.toLowerCase()}`, c]),
);

export function getLocalizedCityName(
  cityName: string,
  countryCode: string,
  locale: SupportedLocale,
): string {
  const match = CITY_LOOKUP.get(`${countryCode.toUpperCase()}:${cityName.toLowerCase()}`);
  if (!match) return cityName;
  return match.names[locale] ?? match.city;
}

export function roundCoord(val: number | null | undefined): number | null {
  if (typeof val !== 'number' || Number.isNaN(val)) return null;
  return Math.round(val * 10) / 10;
}
