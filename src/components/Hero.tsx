// src/components/Hero.tsx
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export default function Hero() {
  const { t } = useTranslation();
      const isRTL = i18n.language === "he";
  const directionClass = isRTL ? "rtl" : "ltr";
  return (
    <section dir={directionClass}  className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-pink-50 via-rose-50 to-amber-50 border">
      <div className="px-6 py-14 md:px-10 md:py-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/70 border">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500" />
            {t("homepage.badge_new", "חדש באתר")}
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
            {t("homepage.hero_title", "כל חומרי האפייה במקום אחד")}
          </h1>
          <p className="mt-3 text-gray-600 md:text-lg">
            {t("homepage.hero_sub", "שוקולדים, קמחים, קישוטים ותבניות — עם משלוח מהיר.")}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#featured"
              className="px-5 py-3 rounded-xl bg-pink-600 text-white hover:bg-pink-700 transition"
            >
              {t("cta.shop_now", "לרכישה")}
            </a>
            <a
              href="#categories"
              className="px-5 py-3 rounded-xl bg-white border hover:bg-gray-50 transition"
            >
              {t("cta.browse_cats", "דפדוף בקטגוריות")}
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
