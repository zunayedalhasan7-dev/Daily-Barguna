import { useState, useEffect } from 'react';

export function useScrollShrink(threshold = 50) {
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    let requestRunning: number | null = null;

    const handleScroll = () => {
      if (requestRunning === null) {
        requestRunning = window.requestAnimationFrame(() => {
          setIsShrunk(window.scrollY > threshold);
          requestRunning = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (requestRunning) {
        window.cancelAnimationFrame(requestRunning);
      }
    };
  }, [threshold]);

  return isShrunk;
}
