import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesTree, CategoryTreeNode } from "../../types/categoriesTree";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCategoryId } from "../../features/products/productsSlice";
import { useDirection } from "../../hooks/useDirection";

type Props = {
  onSelectCategory?: (categoryId: string) => void;
};

export function CategoriesMenu({ onSelectCategory }: Props) {
  const { t } = useTranslation();
  const [rootOpen, setRootOpen] = useState(false);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const { isRTL, dir } = useDirection();

  const dispatch = useDispatch();
  
  const handleMouseEnter = (path: string[]) => {
    setOpenPath(path);
  };

  const handleMouseLeave = () => {
    setRootOpen(false);
    setOpenPath([]);
  };

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory?.(categoryId);
    setRootOpen(false);
    setOpenPath([]);
    dispatch(setSelectedCategoryId(categoryId));
  };

  const renderCategory = (cat: CategoryTreeNode, path: string[] = []) => {
    const newPath = [...path, cat.id];
    const hasChildren = cat.subcategories && cat.subcategories.length > 0;
    const isOpen =
      openPath.length >= newPath.length &&
      newPath.every((id, idx) => openPath[idx] === id);
    const dirClass = isRTL ? "right-full" : "left-full";

    return (
      <div
        key={cat.id}
        className="relative"
        onMouseEnter={() => handleMouseEnter(newPath)}
      >
        <Link
          to={`/category/${cat.id}`}
          onClick={() => handleSelectCategory(cat.id)}
          className="block px-4 py-2 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-pink-600 whitespace-nowrap transition-all duration-200 rounded-lg"
        >
          {t(`categories.${cat.id}`)}
        </Link>
        {hasChildren && isOpen && (
          <div className={`absolute top-0 bg-white shadow-xl rounded-xl p-3 min-w-max z-50 border border-gray-100 ${dirClass}`}>
            {cat.subcategories!.map((sub) => renderCategory(sub, newPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setRootOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button className="relative px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 group">
        {t("navbar.categories")}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-yellow-500 group-hover:w-full transition-all duration-300"></span>
        <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {rootOpen && (
        <div className="absolute top-full right-0 bg-white shadow-xl rounded-xl p-3 min-w-max z-50 border border-gray-100">
          {categoriesTree.map((cat) => renderCategory(cat))}
        </div>
      )}
    </div>
  );
}
