import { useEffect } from 'react';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

/**
 * Mantém o ecrã aceso durante partidas ativas (quando suportado pelo navegador móvel).
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (cancelled) {
          await lock.release();
        } else {
          sentinel = lock;
        }
      } catch {
        // Ignore if battery saver or browser denies wake lock
      }
    };

    acquire();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, [active]);
}
