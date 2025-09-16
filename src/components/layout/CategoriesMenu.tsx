import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCategoryId } from "../../features/products/productsSlice";
import { useDirection } from "../../hooks/useDirection";
import { useGetCategoriesQuery } from "../../store/api/productsApi";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getCategoryDisplayName, handleCategoryError } from "../../utils/categoryUtils";

type Props = {
  onSelectCategory?: (categoryId: string) => void;
};

export function CategoriesMenu({ onSelectCategory }: Props) {
  const { t } = useTranslation();
  const [rootOpen, setRootOpen] = useState(false);
  const { isRTL, dir } = useDirection();

  const dispatch = useDispatch();

  // Fetch categories from API
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  const handleMouseLeave = () => {
    setRootOpen(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory?.(categoryId);
    setRootOpen(false);
    dispatch(setSelectedCategoryId(categoryId));
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="relative">
        <button className={`relative px-4 py-2 text-bakery-brown-700 font-medium transition-colors duration-200 group ${isRTL ? 'flex-row-reverse' : ''}`} dir={dir}>
          {t("navbar.categories")}
          <div className={`inline-block ${isRTL ? 'mr-2' : 'ml-2'}`}>
            <LoadingSpinner size="sm" />
          </div>
        </button>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative">
        <button className={`relative px-4 py-2 text-red-600 font-medium transition-colors duration-200 group ${isRTL ? 'flex-row-reverse' : ''}`} dir={dir}>
          {t("navbar.categories")} - {handleCategoryError(error, t)}
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setRootOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`relative px-4 py-2 text-bakery-brown-700 hover:text-bakery-brown-900 font-medium transition-colors duration-200 group ${isRTL ? 'flex-row-reverse' : ''}`} 
        dir={dir}
        onClick={() => setRootOpen(!rootOpen)}
      >
        {t("navbar.categories")}
        <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-gradient-to-r from-bakery-brown-500 to-bakery-gold-500 group-hover:w-full transition-all duration-300`}></span>
        <svg className={`inline-block w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'} transition-transform duration-200 ${rootOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {rootOpen && (
        <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} bg-white shadow-xl rounded-xl p-3 min-w-max z-50 border border-bakery-cream-200 transition-all duration-200 opacity-100 scale-100 animate-in fade-in-0 zoom-in-95`}>
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.id} className="relative">
                <Link
                  to={`/category/${cat.id}`}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`block px-4 py-2 hover:bg-gradient-to-r hover:from-bakery-cream-50 hover:to-bakery-peach-50 hover:text-bakery-brown-800 whitespace-nowrap transition-all duration-200 rounded-lg font-medium min-h-[44px] flex items-center ${isRTL ? 'text-right' : 'text-left'} touch-manipulation`}
                  dir={dir}
                >
                  {getCategoryDisplayName(cat, t)}
                </Link>
              </div>
            ))
          ) : (
            <div className="py-2 text-gray-500 text-sm text-center">
              {t('common.loading')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
