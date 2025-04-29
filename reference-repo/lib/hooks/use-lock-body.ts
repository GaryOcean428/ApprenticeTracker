import { useEffect } from 'react';

export function useLockBody(shouldLock: boolean): void {
  useEffect((): () => void => {
    if (typeof shouldLock !== "undefined" && shouldLock !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }

    return (): void => {
      document.body.style.overflow = 'visible';
    };
  }, [shouldLock]);
}
