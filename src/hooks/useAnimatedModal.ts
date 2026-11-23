import { useEffect, useState } from 'react';

/**
 * Keeps a modal mounted briefly after `open` flips to false so exit animations
 * (slide-down on mobile, scale/fade-out on desktop) can finish cleanly.
 */
export function useAnimatedModal(open: boolean, exitMs = 210) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [open, exitMs]);

  return {
    mounted: open || mounted,
    closing: !open && mounted,
  };
}
