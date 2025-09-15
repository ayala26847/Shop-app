// src/components/CategoryChips.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesTree } from "../types/categoriesTree";

export default function CategoryChips() {
  const { t } = useTranslation();
  return (
    <div id="categories" className="mt-12">
      <h2 className="text-3xl font-bold text-bakery-brown-800 mb-6 text-center">
        {t("categories.browse_by_category")}
      </h2>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max pb-4 px-2 justify-center">
          {categoriesTree.map((c, index) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="category-chip animate-slide-up whitespace-nowrap"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              {t(`categories.${c.id}`)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
