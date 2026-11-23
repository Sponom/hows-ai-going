import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

const POSITION_CLASSES: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Lightweight hover (desktop pointer only) + keyboard focus-visible tooltip.
 * Never triggers on mouse click or touch tap.
 */
export function Tooltip({ label, side = 'top', children }: TooltipProps) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 [@media(hover:hover)]:group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 dark:bg-slate-100 dark:text-slate-900 ${POSITION_CLASSES[side]}`}
      >
        {label}
      </span>
    </span>
  );
}
