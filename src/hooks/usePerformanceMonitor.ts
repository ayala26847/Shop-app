import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './useAccessibility';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fmp: number; // First Meaningful Paint
  tti: number; // Time to Interactive
}

export interface PerformanceThresholds {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fmp: number;
  tti: number;
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  hasData: boolean;
  score: number;
  recommendations: string[];
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  fid: 100,  // 100ms
  cls: 0.1,  // 0.1
  ttfb: 600, // 600ms
  fmp: 2000, // 2s
  tti: 3800, // 3.8s
};

export function usePerformanceMonitor(
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS,
  options: {
    enableReporting?: boolean;
    enableAnnouncements?: boolean;
    reportInterval?: number;
  } = {}
) {
  const { t } = useTranslation();
  const { announce } = useAccessibility({
    announceChanges: options.enableAnnouncements,
  });

  const [state, setState] = useState<PerformanceState>({
    metrics: {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      fmp: 0,
      tti: 0,
    },
    isMonitoring: false,
    hasData: false,
    score: 0,
    recommendations: [],
  });

  const observerRef = useRef<PerformanceObserver | null>(null);
  const reportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate performance score
  const calculateScore = useCallback((metrics: PerformanceMetrics): number => {
    const weights = {
      fcp: 0.15,
      lcp: 0.25,
      fid: 0.25,
      cls: 0.15,
      ttfb: 0.1,
      fmp: 0.05,
      tti: 0.05,
    };

    let score = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([metric, weight]) => {
      const value = metrics[metric as keyof PerformanceMetrics];
      const threshold = thresholds[metric as keyof PerformanceThresholds];
      
      if (value > 0) {
        const normalizedScore = Math.max(0, Math.min(1, 1 - (value / threshold)));
        score += normalizedScore * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(score * 100) : 0;
  }, [thresholds]);

  // Generate performance recommendations
  const generateRecommendations = useCallback((metrics: PerformanceMetrics): string[] => {
    const recommendations: string[] = [];

    if (metrics.fcp > thresholds.fcp) {
      recommendations.push(t('performance.recommendations.fcp'));
    }

    if (metrics.lcp > thresholds.lcp) {
      recommendations.push(t('performance.recommendations.lcp'));
    }

    if (metrics.fid > thresholds.fid) {
      recommendations.push(t('performance.recommendations.fid'));
    }

    if (metrics.cls > thresholds.cls) {
      recommendations.push(t('performance.recommendations.cls'));
    }

    if (metrics.ttfb > thresholds.ttfb) {
      recommendations.push(t('performance.recommendations.ttfb'));
    }

    if (metrics.fmp > thresholds.fmp) {
      recommendations.push(t('performance.recommendations.fmp'));
    }

    if (metrics.tti > thresholds.tti) {
      recommendations.push(t('performance.recommendations.tti'));
    }

    return recommendations;
  }, [thresholds, t]);

  // Update metrics
  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setState(prev => {
      const updatedMetrics = { ...prev.metrics, ...newMetrics };
      const score = calculateScore(updatedMetrics);
      const recommendations = generateRecommendations(updatedMetrics);

      return {
        ...prev,
        metrics: updatedMetrics,
        hasData: true,
        score,
        recommendations,
      };
    });
  }, [calculateScore, generateRecommendations]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (state.isMonitoring || typeof window === 'undefined') return;

    setState(prev => ({ ...prev, isMonitoring: true }));

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      try {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            updateMetrics({ fcp: fcpEntry.startTime });
          }
        });
        observerRef.current.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            updateMetrics({ lcp: lastEntry.startTime });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.processingStart && entry.startTime) {
              updateMetrics({ fid: entry.processingStart - entry.startTime });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          if (clsValue > 0) {
            updateMetrics({ cls: clsValue });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }

    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        updateMetrics({
          ttfb: nav.responseStart - nav.requestStart,
        });
      }
    }

    // Monitor resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource');
      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') || entry.name.includes('javascript')
      );
      
      if (jsResources.length > 0) {
        const totalJsSize = jsResources.reduce((total, entry) => {
          return total + (entry.transferSize || 0);
        }, 0);
        
        // Estimate TTI based on JS bundle size
        const estimatedTti = Math.min(totalJsSize / 1000, 5000);
        updateMetrics({ tti: estimatedTti });
      }
    }

    // Report performance data
    if (options.enableReporting && options.reportInterval) {
      reportTimeoutRef.current = setTimeout(() => {
        reportPerformanceData();
      }, options.reportInterval);
    }
  }, [state.isMonitoring, updateMetrics, options.enableReporting, options.reportInterval]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (reportTimeoutRef.current) {
      clearTimeout(reportTimeoutRef.current);
      reportTimeoutRef.current = null;
    }

    setState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  // Report performance data
  const reportPerformanceData = useCallback(() => {
    if (!state.hasData) return;

    const reportData = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics: state.metrics,
      score: state.score,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
    };

    // Send to analytics service
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      }).catch(error => {
        console.warn('Failed to report performance data:', error);
      });
    }

    // Announce performance score
    if (options.enableAnnouncements) {
      const scoreMessage = t('performance.score', { score: state.score });
      announce(scoreMessage);
    }
  }, [state, announce, t, options.enableAnnouncements]);

  // Get performance insights
  const getInsights = useCallback(() => {
    if (!state.hasData) return null;

    const insights = {
      score: state.score,
      grade: state.score >= 90 ? 'A' : state.score >= 80 ? 'B' : state.score >= 70 ? 'C' : 'D',
      recommendations: state.recommendations,
      criticalIssues: state.recommendations.length,
      isGood: state.score >= 80,
    };

    return insights;
  }, [state]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    getInsights,
    reportPerformanceData,
  };
}

// Hook for monitoring specific performance metrics
export function useWebVitals() {
  const { startMonitoring } = usePerformanceMonitor(
    DEFAULT_THRESHOLDS,
    {
      enableReporting: true,
      enableAnnouncements: false,
      reportInterval: 5000,
    }
  );

  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);
}

// Hook for performance-based feature flags
export function usePerformanceBasedFeatures() {
  const { metrics, score } = usePerformanceMonitor();
  const [features, setFeatures] = useState({
    enableAnimations: true,
    enableLazyLoading: true,
    enablePreloading: true,
    enableComplexInteractions: true,
  });

  useEffect(() => {
    if (score > 0) {
      setFeatures({
        enableAnimations: score >= 70,
        enableLazyLoading: score >= 60,
        enablePreloading: score >= 80,
        enableComplexInteractions: score >= 75,
      });
    }
  }, [score]);

  return features;
}