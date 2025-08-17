// components/Header.tsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CategoriesMenu } from "./CategoriesMenu";
import { useSelector } from "react-redux";
import { selectCartCount } from "../features/cart/cartSlice";
import { useDirection } from "../hooks/useDirection";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const count = useSelector(selectCartCount);
  const { isRTL, dir } = useDirection();

  const handleSelectCategory = (id: string) => {
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

          <Link to="/cart" className="relative text-2xl">
            🛒
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
          <button className="text-2xl" onClick={() => setMenuOpen(true)}>
            &#9776;
          </button>
        </div>
      </div>

      {/* תפריט צד במובייל */}
      <div
        className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : isRTL ? "-translate-x-full" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button className="text-2xl" onClick={() => setMenuOpen(false)}>
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
