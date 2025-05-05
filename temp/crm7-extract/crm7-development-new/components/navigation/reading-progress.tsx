import { useState, useEffect } from 'react';

export function ReadingProgress(): JSX.Element {
  const [progress, setProgress] = useState<number>(0);

  useEffect((): () => void => {
    const updateProgress = (): void => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = (scrolled / maxHeight) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    };

    window.addEventListener('scroll', updateProgress);
    return (): void => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
