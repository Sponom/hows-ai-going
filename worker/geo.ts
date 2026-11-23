import { ALPHA2_SET, roundCoord } from '../shared/geo-codes';
import type { GeoInfo } from '../shared/types';

interface CfGeoProperties {
  country?: string;
  city?: string;
  latitude?: string | number;
  longitude?: string | number;
}

export function extractGeoFromRequest(request: Request): GeoInfo {
  const cf = (request as Request & { cf?: CfGeoProperties }).cf;
  const rawCountry = cf?.country?.toUpperCase();

  if (rawCountry && rawCountry !== 'XX' && rawCountry !== 'T1' && ALPHA2_SET.has(rawCountry)) {
    const lat =
      cf?.latitude !== undefined ? roundCoord(Number(cf.latitude)) : null;
    const lng =
      cf?.longitude !== undefined ? roundCoord(Number(cf.longitude)) : null;

    return {
      countryCode: rawCountry,
      cityName: cf?.city ? sanitizeCityName(cf.city) : null,
      lat,
      lng,
      source: 'cloudflare',
    };
  }

  // Local dev fallback (no Cloudflare edge headers)
  return {
    countryCode: null,
    cityName: null,
    lat: null,
    lng: null,
    source: 'local',
  };
}

export function sanitizeCityName(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, 64);
  return cleaned.length > 0 ? cleaned : null;
}
