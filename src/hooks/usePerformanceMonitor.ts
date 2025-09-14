import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(performance.now());
  const renderStartRef = useRef<number>(performance.now());

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    const loadTime = performance.now() - startTimeRef.current;
    const renderTime = performance.now() - renderStartRef.current;

    // Log performance metrics
    console.log(`🚀 ${componentName} Performance:`, {
      loadTime: `${loadTime.toFixed(2)}ms`,
      renderTime: `${renderTime.toFixed(2)}ms`,
    });

    // Send to analytics if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_performance', {
        component_name: componentName,
        load_time: Math.round(loadTime),
        render_time: Math.round(renderTime),
      });
    }
  }, [componentName]);

  const trackInteraction = (interactionName: string) => {
    const interactionTime = performance.now() - startTimeRef.current;
    console.log(`👆 ${componentName} - ${interactionName}:`, `${interactionTime.toFixed(2)}ms`);

    // Send interaction metrics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_interaction', {
        component_name: componentName,
        interaction_name: interactionName,
        interaction_time: Math.round(interactionTime),
      });
    }
  };

  return { trackInteraction };
};

// Web Vitals tracking
export const useWebVitals = () => {
  useEffect(() => {
    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const handleCLSEntry = (entry: PerformanceEntry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
        clsEntries.push(entry);
      }
    };

    // LCP - Largest Contentful Paint
    const handleLCPEntry = (entry: PerformanceEntry) => {
      console.log('📊 LCP:', `${(entry as any).startTime.toFixed(2)}ms`);
    };

    // FID - First Input Delay
    const handleFIDEntry = (entry: PerformanceEntry) => {
      console.log('👆 FID:', `${(entry as any).processingStart - entry.startTime}ms`);
    };

    if ('PerformanceObserver' in window) {
      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(handleCLSEntry);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        handleLCPEntry(lastEntry);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(handleFIDEntry);
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      return () => {
        clsObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);
};

// Bundle analyzer (development only)
export const useBundleAnalyzer = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Bundle analyzer not available in Vite - use rollup-plugin-visualizer instead');
    }
  }, []);
};
