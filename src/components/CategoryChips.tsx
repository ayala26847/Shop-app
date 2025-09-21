// src/components/CategoryChips.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetCategoriesQuery } from "../store/api/productsApi";
import { getCategoryDisplayName } from "../utils/categoryUtils";
import { LoadingSpinner } from "./ui/LoadingSpinner";

export default function CategoryChips() {
  const { t } = useTranslation();
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <div id="categories" className="mt-12">
        <h2 className="text-3xl font-bold text-bakery-brown-800 mb-6 text-center">
          {t('categories.browse_by_category')}
        </h2>
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !categories || categories.length === 0) {
    return (
      <div id="categories" className="mt-12">
        <h2 className="text-3xl font-bold text-bakery-brown-800 mb-6 text-center">
          {t('categories.browse_by_category')}
        </h2>
        <div className="text-center text-gray-500">
          {t('errors.loadingProducts')}
        </div>
      </div>
    );
  }

  return (
    <div id="categories" className="mt-12">
      <h2 className="text-3xl font-bold text-bakery-brown-800 mb-6 text-center">
        {t('categories.browse_by_category')}
      </h2>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max pb-4 px-2 justify-center">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="category-chip animate-slide-up whitespace-nowrap"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              {getCategoryDisplayName(category, t)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
