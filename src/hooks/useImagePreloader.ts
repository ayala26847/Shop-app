import { useEffect, useState } from 'react';

export function useImagePreloader(imageUrls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    const preloadImage = (url: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    };

    const preloadAllImages = async () => {
      const promises = imageUrls.map(url => preloadImage(url));

      try {
        const results = await Promise.allSettled(promises);
        const loaded = new Set<string>();

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            loaded.add(imageUrls[index]);
          }
        });

        setLoadedImages(loaded);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadAllImages();
  }, [imageUrls]);

  return { loadedImages, isLoading };
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return isIntersecting;
}

export function usePageLoadOptimization() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      const handleLoad = () => setIsPageLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Preload critical resources
  useEffect(() => {
    if (isPageLoaded) {
      // Preload hero images or other critical resources
      const criticalImages = [
        '/images/hero-bg.jpg',
        '/images/featured-product-1.jpg',
        '/images/featured-product-2.jpg'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
  }, [isPageLoaded]);

  return { isPageLoaded };
}