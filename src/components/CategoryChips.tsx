// src/components/CategoryChips.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesTree } from "../types/categoriesTree";

export default function CategoryChips() {
  const { t } = useTranslation();
  return (
    <div id="categories" className="mt-8 overflow-x-auto no-scrollbar">
      <div className="flex gap-3 min-w-max">
        {categoriesTree.map((c) => (
          <Link
            key={c.id}
            to={`/category/${c.id}`}
            className="px-4 py-2 rounded-full bg-white border hover:bg-pink-50 hover:border-pink-300 transition"
          >
            {t(`categories.${c.id}`)}
          </Link>
        ))}
      </div>
    </div>
  );
}
