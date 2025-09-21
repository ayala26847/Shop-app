import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  blurDataURL?: string;
  quality?: number;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  showSkeleton?: boolean;
  enableZoom?: boolean;
  enableLazyLoading?: boolean;
  intersectionThreshold?: number;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  blurDataURL,
  quality = 75,
  width,
  height,
  objectFit = 'cover',
  objectPosition = 'center',
  showSkeleton = true,
  enableZoom = false,
  enableLazyLoading = true,
  intersectionThreshold = 0.1,
  fallbackSrc
}) => {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isInView, setIsInView] = useState(!enableLazyLoading || priority);
  const [isZoomed, setIsZoomed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: intersectionThreshold,
        rootMargin: '50px',
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoading, priority, intersectionThreshold]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
    
    if (enableLazyLoading) {
      announce(t('accessibility.loading'));
    }
  }, [onLoad, announce, t, enableLazyLoading]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
    
    // Retry with fallback
    if (fallbackSrc && retryCount === 0) {
      setRetryCount(1);
      setImageSrc(fallbackSrc);
    } else {
      announce(t('accessibility.error'));
    }
  }, [onError, fallbackSrc, retryCount, announce, t]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImageSrc(src);
      handleLoad();
    };

    img.onerror = handleError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView, handleLoad, handleError]);

  // Zoom functionality
  const handleZoom = useCallback(() => {
    if (!enableZoom) return;
    setIsZoomed(!isZoomed);
  }, [enableZoom, isZoomed]);

  // Generate optimized src with quality
  const getOptimizedSrc = useCallback(() => {
    if (!src) return '';
    
    // If it's a data URL or already optimized, return as is
    if (src.startsWith('data:') || src.includes('quality=')) {
      return src;
    }

    // Add quality parameter for optimization
    const url = new URL(src);
    url.searchParams.set('quality', quality.toString());
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    
    return url.toString();
  }, [src, quality, width, height]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-400 text-sm ${className}`}
        role="img"
        aria-label={`${t('accessibility.error')}: ${alt}`}
        {...getAriaAttributes({
          label: `${t('accessibility.error')}: ${alt}`,
          live: 'assertive',
        })}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
    );
  }

  const optimizedSrc = getOptimizedSrc();

  return (
    <div 
      className={`relative overflow-hidden ${className} ${isZoomed ? 'cursor-zoom-out' : enableZoom ? 'cursor-zoom-in' : ''}`}
      onClick={handleZoom}
      style={{ width, height }}
    >
      {/* Skeleton loader */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-sm"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${isZoomed ? 'transform scale-150' : ''}`}
          style={{
            objectFit,
            objectPosition,
          }}
          loading={priority ? 'eager' : loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          {...getAriaAttributes({
            label: alt,
            description: enableZoom ? t('accessibility.zoomImage') : undefined,
          })}
        />
      )}

      {/* Zoom overlay */}
      {isZoomed && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="text-white text-sm">
            {t('accessibility.zoomImage')}
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
};

// Hook for image preloading
export const useImagePreloader = () => {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedImages.has(src)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]));
        resolve();
      };

      img.onerror = reject;

      img.src = src;
    });
  }, [preloadedImages]);

  const preloadImages = useCallback((sources: string[]) => {
    return Promise.allSettled(
      sources.map(src => preloadImage(src))
    );
  }, [preloadImage]);

  return {
    preloadImage,
    preloadImages,
    isPreloaded: (src: string) => preloadedImages.has(src)
  };
};
