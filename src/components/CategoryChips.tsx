// src/components/CategoryChips.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesTree } from "../types/categoriesTree";

export default function CategoryChips() {
  const { t } = useTranslation();
  return (
    <div id="categories" className="mt-8">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-3 min-w-max pb-2">
          {categoriesTree.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="px-6 py-3 rounded-full bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:border-pink-300 transition-all duration-200 font-medium whitespace-nowrap shadow-sm hover:shadow-md"
            >
              {t(`categories.${c.id}`)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
