// src/components/BenefitsStrip.tsx
import { useTranslation } from "react-i18next";

const items = [
  {
    titleKey: "benefits.fast_shipping",
    subKey: "benefits.fast_shipping_sub",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    titleKey: "benefits.fresh_quality",
    subKey: "benefits.fresh_quality_sub",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    titleKey: "benefits.support",
    subKey: "benefits.support_sub",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
];

export default function BenefitsStrip() {
  const { t } = useTranslation();
  return (
    <section className="mt-12 grid sm:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
      {items.map((item, index) => (
        <div
          key={item.titleKey}
          className="feature-card text-center group"
          style={{ animationDelay: `${0.6 + index * 0.1}s` }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-bakery-brown-500 to-bakery-gold-500 rounded-full flex items-center justify-center text-white shadow-warm group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
            {item.icon}
          </div>
          <h3 className="text-xl font-bold mb-3 text-bakery-brown-800">{t(item.titleKey)}</h3>
          <p className="text-bakery-brown-600 leading-relaxed">{t(item.subKey)}</p>
        </div>
      ))}
    </section>
  );
}
