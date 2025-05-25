
import { useState, useEffect } from 'react';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768, // Ajustado para coincidir com o breakpoint do shadcn
  tablet: 1024,
  desktop: 1280,
  largeDesktop: 1536,
};

export function useResponsive(customBreakpoints?: Partial<BreakpointConfig>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop' | 'largeDesktop'>('desktop');

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < breakpoints.mobile) {
        setDeviceType('mobile');
      } else if (width < breakpoints.tablet) {
        setDeviceType('tablet');
      } else if (width < breakpoints.desktop) {
        setDeviceType('desktop');
      } else {
        setDeviceType('largeDesktop');
      }
    }

    // Set initial values
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints]);

  return {
    windowSize,
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop' || deviceType === 'largeDesktop',
    isLargeDesktop: deviceType === 'largeDesktop',
    breakpoints,
  };
}
