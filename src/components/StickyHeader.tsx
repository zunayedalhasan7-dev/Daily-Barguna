import React from 'react';
import { useScrollShrink } from '../hooks/useScrollShrink';

interface StickyHeaderProps {
  children: (isShrunk: boolean) => React.ReactNode;
}

export default function StickyHeader({ children }: StickyHeaderProps) {
  const isShrunk = useScrollShrink(40);

  return (
    <header 
      className={`sticky top-0 z-50 transition-colors duration-500 ease-out ${
        isShrunk 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-800' 
          : 'bg-white dark:bg-gray-900 border-b border-transparent dark:border-transparent'
      }`}
    >
      {children(isShrunk)}
    </header>
  );
}
