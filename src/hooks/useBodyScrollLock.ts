import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal/sheet is open.
 * Prevents background scrolling on mobile.
 *
 * @param shouldLock - Whether to lock body scroll
 */
export function useBodyScrollLock(shouldLock: boolean) {
  useEffect(() => {
    if (shouldLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldLock]);
}
