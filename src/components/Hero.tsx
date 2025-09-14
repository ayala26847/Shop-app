// src/components/Hero.tsx
import { useTranslation } from "react-i18next";
import { useDirection } from "../hooks/useDirection";

export default function Hero() {
  const { t } = useTranslation();
  const { dir } = useDirection();
  return (
    <section dir={dir} className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-pink-50 via-rose-50 to-amber-50 border">
      <div className="px-4 py-12 sm:px-6 sm:py-14 md:px-10 md:py-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/70 border">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />
            {t("homepage.badge_new")}
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {t("homepage.hero_title")}
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base md:text-lg">
            {t("homepage.hero_sub")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="#featured"
              className="btn-primary px-6 py-3 text-center"
            >
              {t("cta.shop_now")}
            </a>
            <a
              href="#categories"
              className="px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 text-center font-medium"
            >
              {t("cta.browse_cats")}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl bg-white shadow-inner border" />
          {/* אפשר לשים כאן תמונה/מונטאז' מוצרים בהמשך */}
        </div>
      </div>
    </section>
  );
}
