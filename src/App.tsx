import { Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import Newsletter from "./components/Newsletter";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useWebVitals } from "./hooks/usePerformanceMonitor";
import { useDirection } from "./hooks/useDirection";

// Lazy load pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CartPage = lazy(() => import("./pages/CartPage"));

// Loading fallback component
const PageFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">{t("common.loading")}</p>
      </div>
    </div>
  );
};

export default function App() {
  const { dir } = useDirection();

  // Monitor web vitals
  useWebVitals();

  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <ErrorBoundary>
      <div
        dir={dir}
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
