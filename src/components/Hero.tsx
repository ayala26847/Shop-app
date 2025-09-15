// src/components/Hero.tsx
import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";

export default function Hero() {
  const { t } = useTranslation();
  const { dir } = useDirection();
  return (
    <section dir={dir} className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-bakery-cream-50 via-bakery-peach-50 to-bakery-gold-50 border-2 border-bakery-cream-200 shadow-warm animate-fade-in">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-bakery-peach-200 to-bakery-gold-200 rounded-full opacity-20 animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-10 w-20 h-20 bg-gradient-to-br from-bakery-brown-200 to-bakery-cream-300 rounded-full opacity-30 animate-bounce-subtle"></div>
      </div>

      <div className="relative px-6 py-16 sm:px-8 sm:py-20 md:px-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-slide-up">
          <div className="badge-new inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-bakery-peach-500 to-bakery-gold-500 animate-pulse" />
            {t("homepage.badge_new")}
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-bakery-brown-900 leading-tight">
            {t("homepage.hero_title")}
          </h1>
          <p className="mt-4 text-bakery-brown-600 text-lg sm:text-xl md:text-2xl leading-relaxed">
            {t("homepage.hero_sub")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="#featured"
              className="btn-primary text-lg px-8 py-4 text-center shadow-warm hover:shadow-large transform transition-all duration-300 hover:scale-105"
            >
              {t("cta.shop_now")}
            </a>
            <a
              href="#categories"
              className="btn-secondary text-lg px-8 py-4 text-center"
            >
              {t("cta.browse_cats")}
            </a>
          </div>
        </div>

        <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-white to-bakery-cream-50 shadow-large border-2 border-bakery-cream-200 overflow-hidden">
            {/* Placeholder for hero image with warm gradient background */}
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bakery-cream-100 via-bakery-peach-100 to-bakery-gold-100">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-bakery-brown-500 to-bakery-gold-500 rounded-full flex items-center justify-center shadow-warm">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <p className="text-bakery-brown-600 font-medium">Premium Bakery Products</p>
              </div>
            </div>
          </div>
          {/* Floating decoration */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-bakery-peach-400 to-bakery-gold-400 rounded-full shadow-warm animate-bounce-subtle opacity-80"></div>
        </div>
      </div>
    </section>
  );
}
