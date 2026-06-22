'use client';

import { useEffect } from 'react';

export default function DisableScroll() {
  useEffect(() => {
    // We only disable scroll on larger screens where the form is guaranteed to fit.
    // Disabling it on mobile would break the checkout since the fields stack vertically and require scrolling.
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    
    const handleScrollLock = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };

    handleScrollLock(mediaQuery);
    mediaQuery.addEventListener('change', handleScrollLock);

    return () => {
      document.body.style.overflow = 'unset';
      mediaQuery.removeEventListener('change', handleScrollLock);
    };
  }, []);

  return null;
}

