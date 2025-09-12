// components/Header.tsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { CategoriesMenu } from "./CategoriesMenu";
import { useSelector } from "react-redux";
import { selectCartCount } from "../../store/selectors/cartSelectors";
import { useDirection } from "../../hooks/useDirection";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { t } = useTranslation();
  const count = useSelector(selectCartCount);
  const { isRTL, dir } = useDirection();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close menu on swipe left (LTR) or swipe right (RTL)
    if ((isRTL && isRightSwipe) || (!isRTL && isLeftSwipe)) {
      setMenuOpen(false);
    }
  };

  const handleSelectCategory = (_id: string) => {
    setMenuOpen(false);
  };

  return (
    <header dir={dir} className="bg-white shadow sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* לוגו */}
        <Link to="/" className="text-2xl font-bold text-yellow-600">
          Bakeo
        </Link>

        {/* תפריט ניווט */}
        <nav className="hidden md:flex items-center gap-8 text-gray-800 font-medium">
          <NavLink to="/" className="hover:text-yellow-600">
            {t("navbar.home")}
          </NavLink>
          <NavLink to="/about" className="hover:text-yellow-600">
            {t("navbar.about")}
          </NavLink>
          <CategoriesMenu onSelectCategory={handleSelectCategory} />
          <NavLink to="/contact" className="hover:text-yellow-600">
            {t("navbar.contact")}
          </NavLink>
        </nav>

        {/* צד שמאל – חיפוש, עגלה, שפה */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t("navbar.search") || "חיפוש..."}
              className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-yellow-200"
            />
          </div>

          <Link to="/cart" className="relative">
            <svg className="text-2xl w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-yellow-600 text-white rounded-full px-1.5">
                {count}
              </span>
            )}
          </Link>

          <LanguageSwitcher />
        </div>

        {/* תפריט מובייל */}
        <div className="md:hidden">
          <button
            className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            onClick={() => setMenuOpen(true)}
            aria-label="פתח תפריט"
            aria-expanded={menuOpen}
          >
            &#9776;
          </button>
        </div>
      </div>

      {/* תפריט צד במובייל */}
      <div
        className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : isRTL ? "-translate-x-full" : "translate-x-full"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-end p-4">
          <button
            className="text-2xl p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            onClick={() => setMenuOpen(false)}
            aria-label="סגור תפריט"
          >
            &times;
          </button>
        </div>
        <nav className="flex flex-col space-y-4 px-6 text-gray-800 font-medium">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            {t("navbar.home")}
          </NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>
            {t("navbar.about")}
          </NavLink>
          <CategoriesMenu onSelectCategory={handleSelectCategory} />
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>
            {t("navbar.contact")}
          </NavLink>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
