import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({ lenis: null });

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    // Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false, // Keep false for native mobile feel
      touchMultiplier: 2,
      infinite: false,
    });

    setLenis(lenisInstance);

    // Request Animation Frame loop
    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenisInstance.destroy();
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return (
    <SmoothScrollContext.Provider value={{ lenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
