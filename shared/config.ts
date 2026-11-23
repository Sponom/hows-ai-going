export const APP_CONFIG = {
  brandName: 'How’s AI Going?',
  /**
   * Configurable calibration thresholds ("Signal Strength" 0..3 bars).
   * Adjust these freely as traffic grows — no schema changes required.
   */
  thresholds: {
    country: {
      /** Minimum signals to unlock preliminary AI Cover Index color */
      preliminary: 25,
      /** Signals for confident (3-bar) status */
      confident: 150,
    },
    city: {
      preliminary: 10,
      confident: 50,
    },
  },
  /** Total UN-recognized countries for the global coverage progress bar */
  totalCountriesTarget: 195,
  /** Edge cache TTL in seconds for /api/snapshot */
  snapshotCacheSeconds: 15,
} as const;

/**
 * Signal strength tiers (like cellular coverage bars):
 * 0 = No signal (fog of war)
 * 1 = Calibrating (below preliminary threshold — visible beacon, no ranking)
 * 2 = Preliminary index (preliminary..confident-1)
 * 3 = Confident index (confident+)
 */
export type SignalStrength = 0 | 1 | 2 | 3;

export function getSignalStrength(
  count: number,
  scope: 'country' | 'city',
): SignalStrength {
  if (count <= 0) return 0;
  const { preliminary, confident } = APP_CONFIG.thresholds[scope];
  if (count < preliminary) return 1;
  if (count < confident) return 2;
  return 3;
}

/**
 * Converts discrete usage level (0..3) into a 0..100 score.
 * 0 = 0%, 1 = 33.3%, 2 = 66.7%, 3 = 100%
 */
export function levelToScore(level: number): number {
  const clamped = Math.max(0, Math.min(3, level));
  return Math.round((clamped / 3) * 100);
}
