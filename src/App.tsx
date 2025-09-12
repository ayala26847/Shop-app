import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import Newsletter from "./components/Newsletter";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useWebVitals } from "./hooks/usePerformanceMonitor";
import i18n from "./i18n";
import { useEffect } from "react";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));

// Loading fallback component
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">טוען...</p>
    </div>
  </div>
);

export default function App() {
  const isRTL = i18n.language === "he";
  const directionClass = isRTL ? "rtl" : "ltr";

  // Monitor web vitals
  useWebVitals();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <div
        dir={directionClass}
        className="min-h-screen bg-neutral-50 text-neutral-900"
      >
        <Header />
        <main>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/category/:id" element={<CategoryPage />} />
            </Routes>
          </Suspense>
        </main>
        <Newsletter />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
