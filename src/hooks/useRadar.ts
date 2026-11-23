import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoleId, SymptomId, UsageContext } from '../../shared/taxonomy';
import {
  HISTORY_PERIODS,
  type FieldReportResponse,
  type GeoInfo,
  type HistoryPeriod,
  type RadarSnapshot,
  type SignalSubmission,
} from '../../shared/types';

const ANON_TOKEN_KEY = 'ai-cover-anon-token';
const SUBMITTED_KEY = 'ai-cover-has-submitted';
const MY_LOCATION_KEY = 'ai-cover-my-location';
const MY_PROFILE_KEY = 'ai-cover-my-profile';

export interface MySavedLocation {
  countryCode: string;
  cityName: string | null;
}

export type MySavedProfile = FieldReportResponse['signal'];

function readSavedProfile(): MySavedProfile | null {
  try {
    const raw = localStorage.getItem(MY_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.countryCode === 'string' &&
      typeof parsed?.level === 'number' &&
      Array.isArray(parsed?.domains) &&
      Array.isArray(parsed?.symptoms)
    ) {
      return parsed as MySavedProfile;
    }
    return null;
  } catch {
    return null;
  }
}

function readSavedLocation(): MySavedLocation | null {
  try {
    const raw = localStorage.getItem(MY_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.countryCode === 'string') {
      return {
        countryCode: parsed.countryCode,
        cityName: typeof parsed.cityName === 'string' ? parsed.cityName : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function getOrCreateAnonToken(): string {
  try {
    const existing = localStorage.getItem(ANON_TOKEN_KEY);
    if (existing && existing.length >= 16) return existing;
    const fresh = crypto.randomUUID() + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(ANON_TOKEN_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

export function useRadar(
  roleFilter: RoleId | 'all',
  symptomFilter: SymptomId | 'all',
  contextFilter: UsageContext | 'all',
  period: HistoryPeriod = 'now',
) {
  const [snapshotsByPeriod, setSnapshotsByPeriod] = useState<
    Partial<Record<HistoryPeriod, RadarSnapshot>>
  >({});
  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SUBMITTED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [myLocation, setMyLocation] = useState<MySavedLocation | null>(() =>
    readSavedLocation(),
  );
  const [myProfile, setMyProfile] = useState<MySavedProfile | null>(() =>
    readSavedProfile(),
  );

  const filterKey = `${roleFilter}|${symptomFilter}|${contextFilter}`;
  const filterKeyRef = useRef(filterKey);
  filterKeyRef.current = filterKey;

  const fetchForPeriod = useCallback(
    async (targetPeriod: HistoryPeriod, expectedFilterKey: string) => {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (symptomFilter !== 'all') params.set('symptom', symptomFilter);
      if (contextFilter !== 'all') params.set('context', contextFilter);
      if (targetPeriod !== 'now') params.set('period', targetPeriod);
      const query = params.toString();
      const res = await fetch(`/api/snapshot${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RadarSnapshot;
      if (filterKeyRef.current !== expectedFilterKey) return null;
      setSnapshotsByPeriod((prev) => ({ ...prev, [targetPeriod]: data }));
      return data;
    },
    [roleFilter, symptomFilter, contextFilter],
  );

  // Fetch 'now' immediately and prefetch historical periods smoothly for zero-lag scrubbing
  useEffect(() => {
    let cancelled = false;
    const currentKey = filterKey;

    const loadInitial = async () => {
      try {
        await fetchForPeriod('now', currentKey);
        if (!cancelled) {
          setError(null);
          setLoading(false);
        }
        // Quietly warm the 4 historical periods in parallel so dragging the slider is instant
        const pastPeriods = HISTORY_PERIODS.filter((p) => p !== 'now');
        await Promise.allSettled(
          pastPeriods.map((p) => fetchForPeriod(p, currentKey)),
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load radar');
          setLoading(false);
        }
      }
    };

    loadInitial();

    const timer = window.setInterval(() => {
      fetchForPeriod('now', currentKey).catch(() => {});
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [fetchForPeriod, filterKey]);

  // If user switches to a period that hasn't finished prefetching yet, prioritize it
  useEffect(() => {
    if (period === 'now' || snapshotsByPeriod[period]) return;
    fetchForPeriod(period, filterKey).catch(() => {});
  }, [period, snapshotsByPeriod, fetchForPeriod, filterKey]);

  useEffect(() => {
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GeoInfo | null) => {
        if (data) setGeo(data);
      })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    const currentKey = filterKeyRef.current;
    await fetchForPeriod('now', currentKey);
    if (period !== 'now') {
      await fetchForPeriod(period, currentKey);
    }
  }, [fetchForPeriod, period]);

  const submitSignal = useCallback(
    async (
      payload: Omit<SignalSubmission, 'anonToken'>,
    ): Promise<FieldReportResponse> => {
      const anonToken = getOrCreateAnonToken();
      const res = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, anonToken }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      const savedLoc: MySavedLocation = {
        countryCode: json.signal.countryCode,
        cityName: json.signal.cityName ?? null,
      };
      try {
        localStorage.setItem(SUBMITTED_KEY, '1');
        localStorage.setItem(MY_LOCATION_KEY, JSON.stringify(savedLoc));
        localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(json.signal));
      } catch {
        // ignore
      }
      setHasSubmitted(true);
      setMyLocation(savedLoc);
      setMyProfile(json.signal);
      await fetchForPeriod('now', filterKeyRef.current);
      return json as FieldReportResponse;
    },
    [fetchForPeriod],
  );

  const nowSnapshot = snapshotsByPeriod.now ?? null;
  const snapshot = snapshotsByPeriod[period] ?? nowSnapshot;

  return {
    snapshot,
    nowSnapshot,
    snapshotsByPeriod,
    geo,
    loading,
    error,
    hasSubmitted,
    myLocation,
    myProfile,
    refresh,
    submitSignal,
  };
}
