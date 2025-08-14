// components/Header.tsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CategoriesMenu } from "./CategoriesMenu";
import { useSelector } from "react-redux";
import { selectCartCount } from "../features/cart/cartSlice";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
const count = useSelector(selectCartCount);

  const handleSelectCategory = (id: string) => {
    setMenuOpen(false); // סגירת תפריט במובייל אחרי בחירה
    // פה בעתיד נוכל להפעיל פילטור בסטור/Redux
  };

  const navLinks = (
    <>
      <LanguageSwitcher />
      <NavLink to="/" className="hover:text-pink-600" onClick={() => setMenuOpen(false)}>
        {t("navbar.home")}
      </NavLink>
      <NavLink to="/about" className="hover:text-pink-600" onClick={() => setMenuOpen(false)}>
        {t("navbar.about")}
      </NavLink>
     
      <CategoriesMenu onSelectCategory={handleSelectCategory} />
       <NavLink to="/cart" className="relative hover:text-pink-600">
  {t('navbar.cart')}
  {count > 0 && (
    <span className="absolute -top-2 -right-3 text-xs bg-pink-600 text-white rounded-full px-1.5">
      {count}
    </span>
  )}
</NavLink>
    </>
  );

  return (
    <header className="bg-white shadow sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-pink-600">Shop</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6 items-center">
          {navLinks}
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <button
            className="text-2xl"
            onClick={() => setMenuOpen(true)}
          >
            &#9776;
          </button>
        </div>
      </div>

      {/* Mobile side drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button className="text-2xl" onClick={() => setMenuOpen(false)}>
            &times;
          </button>
        </div>
        <nav className="flex flex-col space-y-4 px-6">
          {navLinks}
        </nav>
      </div>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
// This component serves as the header for the application, providing navigation links and a responsive design for both desktop and mobile views.