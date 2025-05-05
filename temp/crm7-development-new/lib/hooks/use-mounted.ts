import { useState, useEffect } from 'react';

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect((): void => {
    setMounted(true);
  }, []);

  return mounted;
}
