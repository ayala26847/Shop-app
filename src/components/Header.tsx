import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Category } from "../types/products";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
    // Toggle language function
   
  const navLinks = (
    <>
      <LanguageSwitcher />
      <NavLink to="/" className="hover:text-pink-600" onClick={() => setMenuOpen(false)}>{t("navbar.home")}</NavLink>
      <NavLink to="/about" className="hover:text-pink-600" onClick={() => setMenuOpen(false)}>{t("navbar.about")}</NavLink>

      <div className="relative group">
        <button className="hover:text-pink-600">Categories</button>
        <div className="absolute hidden group-hover:block bg-white shadow rounded mt-0 p-2 min-w-max z-50">
          {Object.values(Category).map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat.toLowerCase()}`}
              className="block px-4 py-1 hover:bg-pink-100"
              onClick={() => setMenuOpen(false)}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
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
