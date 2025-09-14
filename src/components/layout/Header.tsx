// components/Header.tsx
import React, { useState, useEffect } from "react";
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
  const { t, i18n } = useTranslation();
  const count = useSelector(selectCartCount);
  const { isRTL, dir } = useDirection();

  // Close mobile menu when language changes
  useEffect(() => {
    setMenuOpen(false);
  }, [i18n.language]);

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
    <header dir={dir} className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
            Bakeo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavLink 
            to="/" 
            className="relative px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 group"
          >
            {t("navbar.home")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </NavLink>
          <NavLink 
            to="/about" 
            className="relative px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 group"
          >
            {t("navbar.about")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </NavLink>
          <CategoriesMenu onSelectCategory={handleSelectCategory} />
          <NavLink 
            to="/contact" 
            className="relative px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 group"
          >
            {t("navbar.contact")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-yellow-500 group-hover:w-full transition-all duration-300"></span>
          </NavLink>
        </nav>

        {/* Right side - Search, Cart, Language */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("navbar.search")}
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors duration-200 group">
            <svg className="w-6 h-6 text-gray-700 group-hover:text-pink-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                {count}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
            onClick={() => setMenuOpen(true)}
            aria-label={t("common.menu")}
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className={`fixed top-0 ${isRTL ? "left-0" : "right-0"} h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Bakeo</span>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={() => setMenuOpen(false)}
            aria-label={t("common.close")}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("navbar.search")}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex flex-col p-6 space-y-2">
          <NavLink 
            to="/" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-pink-600 rounded-xl transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("navbar.home")}
          </NavLink>
          <NavLink 
            to="/about" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-pink-600 rounded-xl transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("navbar.about")}
          </NavLink>
          <div className="px-4 py-3">
            <CategoriesMenu onSelectCategory={handleSelectCategory} />
          </div>
          <NavLink 
            to="/contact" 
            onClick={() => setMenuOpen(false)}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 hover:text-pink-600 rounded-xl transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t("navbar.contact")}
          </NavLink>
        </nav>
        </div>
      )}

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
