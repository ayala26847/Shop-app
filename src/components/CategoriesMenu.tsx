import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoriesTree, CategoryTreeNode } from "../types/categoriesTree";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedCategoryId } from "../features/products/productsSlice";
import { useDirection } from "../hooks/useDirection";

type Props = {
  onSelectCategory?: (categoryId: string) => void;
};

export function CategoriesMenu({ onSelectCategory }: Props) {
  const { t } = useTranslation();
  const [rootOpen, setRootOpen] = useState(false);
  const [openPath, setOpenPath] = useState<string[]>([]);
    const { isRTL, dir, directionClass } = useDirection();

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
          className={`block px-4 py-1 hover:bg-pink-100 whitespace-nowrap `}
        >
          {t(`categories.${cat.id}`)}
        </Link>
        {hasChildren && isOpen && (
          <div className={`absolute top-0 bg-white shadow rounded p-2 min-w-max z-50 ${dirClass}`}>
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
      <button className="hover:text-pink-600">{t("navbar.categories")}</button>

      {rootOpen && (
        <div className="absolute top-full right-0 bg-white shadow rounded p-2 min-w-max z-50">
          {categoriesTree.map((cat) => renderCategory(cat))}
        </div>
      )}
    </div>
  );
}
