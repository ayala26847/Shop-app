// components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { CategoriesMenu } from "./CategoriesMenu";
import { useGetCartCountQuery } from "../../store/api/cartApi";
import { useDirection } from "../../hooks/useDirection";
import { useAuth } from "../../contexts/AuthContext";
import { useSignOutMutation } from "../../store/api/authApi";
import fallbackSvg from "../../logo.svg";
import brandPng from "../../Bake_logo.png";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const { data: cartCount = 0 } = useGetCartCountQuery();
  const { isRTL, dir } = useDirection();
  const { user, loading } = useAuth();
  const [signOut] = useSignOutMutation();

  // Prefer Bake_logo.png, fall back to svg if it fails for any reason
  const [brandLogoSrc, setBrandLogoSrc] = useState<string>(brandPng);
  const handleLogoError = () => setBrandLogoSrc(fallbackSvg);

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

  const handleSignOut = async () => {
    try {
      await signOut().unwrap();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header dir={dir} className="header-glass shadow-warm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={brandLogoSrc}
            onError={handleLogoError}
            alt="Bakeo"
            className="h-12 md:h-14 lg:h-16 w-auto object-contain mix-blend-multiply select-none pointer-events-none"
            decoding="async"
            loading="eager"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav id="main-navigation" className="hidden lg:flex items-center gap-8" aria-label={t("navbar.mainNavigation")}>
          <NavLink to="/" className="nav-link" aria-label={t("navbar.home")}>
            {t("navbar.home")}
          </NavLink>
          <NavLink to="/about" className="nav-link" aria-label={t("navbar.about")}>
            {t("navbar.about")}
          </NavLink>
          <CategoriesMenu onSelectCategory={handleSelectCategory} />
          <NavLink to="/contact" className="nav-link" aria-label={t("navbar.contact")}>
            {t("navbar.contact")}
          </NavLink>
        </nav>

        {/* Right side - Search, Cart, Language */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <label htmlFor="header-search" className="sr-only">
              {t("navbar.searchProducts")}
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-bakery-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="header-search"
              type="search"
              placeholder={t("navbar.search")}
              aria-label={t("navbar.searchProducts")}
              className="w-64 pl-10 pr-4 py-2 border-2 border-bakery-cream-300 rounded-full bg-white/50 backdrop-blur-sm
                         focus:outline-none focus:ring-4 focus:ring-bakery-cream-200 focus:border-bakery-brown-400
                         transition-all duration-300 placeholder-bakery-brown-400
                         hover:border-bakery-cream-400 hover:bg-white/80"
            />
          </div>

          {/* Cart */}
          <Link to="/cart" className="relative p-3 hover:bg-bakery-cream-50 rounded-2xl transition-all duration-300 group hover:scale-110">
            <svg className="w-6 h-6 text-bakery-brown-600 group-hover:text-bakery-brown-800 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-bakery-peach-500 to-bakery-gold-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce-subtle shadow-warm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Authentication */}
          {!loading && (
            <div className="user-menu relative">
              {user ? (
                // Authenticated User Menu
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
                    aria-label={t("auth.links.account")}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-bakery-brown-500 to-bakery-gold-500 rounded-full flex items-center justify-center shadow-warm">
                      <span className="text-white text-sm font-bold">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t("auth.links.profile")}
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {t("navbar.orders")}
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {t("navbar.wishlist")}
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t("auth.buttons.signOut")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Guest User - Sign In/Up Links
                <div className="flex items-center space-x-3">
                  <Link
                    to="/auth/signin"
                    className="btn-outline text-sm py-2 px-4"
                  >
                    {t("auth.buttons.signIn")}
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {t("auth.buttons.signUp")}
                  </Link>
                </div>
              )}
            </div>
          )}

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
          <div className="flex items-center gap-2">
            <img
              src={brandLogoSrc}
              onError={handleLogoError}
              alt="Bakeo"
              className="h-12 w-auto object-contain mix-blend-multiply select-none pointer-events-none"
              decoding="async"
            />
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
