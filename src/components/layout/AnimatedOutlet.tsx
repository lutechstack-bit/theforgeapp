import React, { useEffect, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const [displayedOutlet, setDisplayedOutlet] = useState(currentOutlet);
  const [animationClass, setAnimationClass] = useState('page-enter');
  const previousKeyRef = React.useRef(location.key);

  useEffect(() => {
    // Only animate if route actually changed
    if (location.key !== previousKeyRef.current) {
      previousKeyRef.current = location.key;
      
      // Start exit animation
      setAnimationClass('page-exit');
      
      // After exit animation, swap content and start enter animation
      const exitTimer = setTimeout(() => {
        setDisplayedOutlet(currentOutlet);
        setAnimationClass('page-enter');
      }, 150);
      
      return () => clearTimeout(exitTimer);
    } else {
      // Initial render - just show enter animation
      setDisplayedOutlet(currentOutlet);
    }
  }, [location.key, currentOutlet]);

  return (
    <div className={cn('page-transition-wrapper', animationClass)}>
      {displayedOutlet}
    </div>
  );
};
