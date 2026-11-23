import type { SignalStrength } from '../../shared/config';

interface SignalBarsProps {
  strength: SignalStrength;
}

const BAR_COLORS: Record<SignalStrength, string> = {
  0: 'bg-slate-300 dark:bg-slate-700',
  1: 'bg-sky-500',
  2: 'bg-cyan-500',
  3: 'bg-emerald-500',
};

export function SignalBars({ strength }: SignalBarsProps) {
  const activeColor = BAR_COLORS[strength];
  const muted = 'bg-slate-300/70 dark:bg-slate-700/80';

  return (
    <span
      className="inline-flex h-3 items-end gap-[2px] align-middle"
      aria-hidden="true"
    >
      <span
        className={`h-1.5 w-[2.5px] rounded-full ${strength >= 1 ? activeColor : muted}`}
      />
      <span
        className={`h-2 w-[2.5px] rounded-full ${strength >= 2 ? activeColor : muted}`}
      />
      <span
        className={`h-3 w-[2.5px] rounded-full ${strength >= 3 ? activeColor : muted}`}
      />
    </span>
  );
}
