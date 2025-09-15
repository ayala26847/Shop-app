// src/pages/HomePage.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import Hero from "../components/Hero";
import BenefitsStrip from "../components/BenefitsStrip";
import CategoryChips from "../components/CategoryChips";
import { EnhancedProductList } from "../features/products/EnhancedProductList";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor";
import { useDirection } from "../hooks/useDirection";
import { TrustSignals } from "../components/ui/TrustSignals";

export default function HomePage() {
  const { t } = useTranslation();
  const { dir } = useDirection();

  // Performance monitoring
  usePerformanceMonitor('HomePage');

  return (
    <div className="space-y-12" dir={dir}>
      <div className="container mx-auto px-4 py-6">
        <Hero />
        <BenefitsStrip />
        <CategoryChips />

        {/* Trust Signals Section */}
        <section className="mt-16 animate-slide-up" style={{ animationDelay: '1s' }}>
          <h2 className="text-3xl font-bold text-bakery-brown-800 mb-8 text-center">
            {t("trust.whyChooseUs")}
          </h2>
          <TrustSignals type="guarantee" />
        </section>

        <section id="featured" className="mt-16">
          <h2 className="text-4xl font-bold text-bakery-brown-800 mb-8 text-center">
            {t("common.featured")}
          </h2>
          <EnhancedProductList
            featured={true}
            limit={8}
            showFilters={false}
            showPagination={false}
            showVariants={true}
          />
        </section>

        {/* Customer Testimonials */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-bakery-brown-800 mb-8 text-center">
            {t("trust.customerTestimonials")}
          </h2>
          <TrustSignals type="testimonial" />
        </section>
      </div>
    </div>
  );
}
