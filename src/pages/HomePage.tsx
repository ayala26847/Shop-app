// src/pages/HomePage.tsx
import React, { useMemo } from "react";
import Hero from "../components/Hero";
import BenefitsStrip from "../components/BenefitsStrip";
import CategoryChips from "../components/CategoryChips";
import { useSelector } from "react-redux";
import { ProductCard } from "../components/ui/ProductCard";
import { PageSkeleton } from "../components/ui/PageSkeleton";
import { selectProducts, selectProductsLoading, selectProductsError } from "../store/selectors/productSelectors";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";

export default function HomePage() {
  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);

  // Performance monitoring
  usePerformanceMonitor('HomePage');

  // Memoize featured products to prevent unnecessary re-renders
  const featuredProducts = useMemo(() =>
    products.slice(0, 8).map(product => (
      <ProductCard
        key={product.id}
        id={product.id}
        name={product.name}
        price={product.price}
        imageUrl={product.imageUrl}
        categoryIds={product.categoryIds}
      />
    )),
    [products]
  );
  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת המוצרים</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Hero />
      <BenefitsStrip />
      <CategoryChips />
      <section id="featured" className="mt-10">
        <h2 className="text-2xl font-bold mb-4">מוצרים נבחרים</h2>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">אין מוצרים זמינים כרגע</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts}
          </div>
        )}
      </section>
    </div>
  );
}
