// components/Header.tsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { HiUser, HiShoppingCart, HiSearch } from "react-icons/hi";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useGetCartCountQuery } from "../../store/api/cartApi";
import { useGetCategoriesQuery } from "../../store/api/productsApi";
import { useDirection } from "../../hooks/useDirection";
import { useAuth } from "../../contexts/AuthContext";
import { useSignOutMutation } from "../../store/api/authApi";
import { getCategoryDisplayName } from "../../utils/categoryUtils";
import fallbackSvg from "../../logo.svg";
import brandSvg from "../../Bake_logo.svg";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const { data: cartCount = 0 } = useGetCartCountQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { isRTL, dir } = useDirection();
  const { user, loading } = useAuth();
  const [signOut] = useSignOutMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use Bake_logo.svg, fall back to generic logo.svg if it fails for any reason
  const [brandLogoSrc, setBrandLogoSrc] = useState<string>(brandSvg);
  const handleLogoError = () => setBrandLogoSrc(fallbackSvg);

  // Scroll effect for header shrinking
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when language changes
  useEffect(() => {
    setMenuOpen(false);
  }, [i18n.language]);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu') && !target.closest('.mega-menu') && !target.closest('.search-container')) {
        setUserMenuOpen(false);
        setMegaMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectCategory = () => {
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

  // Check viewport position and adjust dropdown position
  const checkMenuPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuHeight = 300; // Approximate menu height - increased for safety

    // Calculate available space below and above
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Position menu based on available space
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setMenuPosition('top');
    } else {
      setMenuPosition('bottom');
    }

    // For mobile screens, prioritize keeping menu visible
    if (viewportWidth < 768) {
      // On mobile, prefer top positioning if there's not enough space below
      if (spaceBelow < 250) {
        setMenuPosition('top');
      }
    }
  };

  const handleUserMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const currentTarget = event.currentTarget;
    if (!userMenuOpen) {
      checkMenuPosition(currentTarget);
    }
    setUserMenuOpen(!userMenuOpen);
  };

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Group categories into sections for mega menu
  const categorizeItems = (items: Array<{ id: string; name?: string; name_en?: string; name_he?: string }>) => {
    const sections = {
      bakery: [] as Array<{ id: string; name?: string; name_en?: string; name_he?: string }>,
      dairy: [] as Array<{ id: string; name?: string; name_en?: string; name_he?: string }>,
      other: [] as Array<{ id: string; name?: string; name_en?: string; name_he?: string }>
    };

    items.forEach(item => {
      const name = getCategoryDisplayName(item, t).toLowerCase();
      if (name.includes('bread') || name.includes('cake') || name.includes('pastry') || name.includes('לחם') || name.includes('עוגה')) {
        sections.bakery.push(item);
      } else if (name.includes('dairy') || name.includes('milk') || name.includes('cheese') || name.includes('חלב') || name.includes('גבינה')) {
        sections.dairy.push(item);
      } else {
        sections.other.push(item);
      }
    });

    return sections;
  };

  const categorizedItems = categorizeItems(categories);

  return (
    <>
      <motion.header
        dir={dir}
        className="header-glass shadow-warm sticky top-0 z-50 transition-all duration-300"
        animate={{
          height: scrolled ? '60px' : '90px',
          paddingTop: scrolled ? '8px' : '12px',
          paddingBottom: scrolled ? '8px' : '12px'
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between gap-4 h-full">
        
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.img
              src={brandLogoSrc}
              onError={handleLogoError}
              alt="Bakeo"
              className="w-auto object-contain select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
              animate={{
                height: scrolled ? '40px' : '64px'
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              decoding="async"
              loading="eager"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav id="main-navigation" className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label={t("navbar.mainNavigation")}>
            <NavLink to="/" className="nav-link" aria-label={t("navbar.home")}>
              {t("navbar.home")}
            </NavLink>
            <NavLink to="/about" className="nav-link" aria-label={t("navbar.about")}>
              {t("navbar.about")}
            </NavLink>

            {/* Categories Mega Menu */}
            <div
              className="mega-menu relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`relative px-4 py-2 text-bakery-brown-700 hover:text-bakery-brown-900 font-medium transition-colors duration-200 group ${isRTL ? 'flex-row-reverse' : ''}`}
                dir={dir}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              >
                {t("navbar.categories")}
                <span className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-gradient-to-r from-bakery-brown-500 to-bakery-gold-500 group-hover:w-full transition-all duration-300`}></span>
                <svg className={`inline-block w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'} transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <NavLink to="/contact" className="nav-link" aria-label={t("navbar.contact")}>
              {t("navbar.contact")}
            </NavLink>
          </nav>

          {/* Right side - Icons */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            {/* Search Icon */}
            <div className="search-container relative">
              <motion.button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-bakery-cream-50 rounded-full transition-all duration-300 group"
                title={t("navbar.search")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <HiSearch className="w-5 h-5 text-bakery-brown-600 group-hover:text-bakery-brown-800 transition-colors duration-300" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: isRTL ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-xl shadow-xl border border-bakery-cream-200 p-4 z-50`}
                  >
                    <form onSubmit={handleSearch} className="relative">
                      <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                        <HiSearch className="h-5 w-5 text-bakery-brown-400" />
                      </div>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        placeholder={t("navbar.searchProducts")}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-bakery-cream-300 rounded-full bg-white
                                   focus:outline-none focus:ring-4 focus:ring-bakery-cream-200 focus:border-bakery-brown-400
                                   transition-all duration-300 placeholder-bakery-brown-400`}
                        dir={dir}
                        autoFocus
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Icon */}
            <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cart" className="p-2 hover:bg-bakery-cream-50 rounded-full transition-all duration-300 group block">
                <HiShoppingCart className="w-5 h-5 text-bakery-brown-600 group-hover:text-bakery-brown-800 transition-colors duration-300" />
                {cartCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-bakery-peach-500 to-bakery-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-warm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Language Switcher */}
           

            {/* User Icon */}
            {!loading && (
              <div className="user-menu relative">
                {user ? (
                  // Authenticated User Menu
                  <div className="relative">
                    <motion.button
                      onClick={handleUserMenuToggle}
                      className="p-2 hover:bg-bakery-cream-50 rounded-full transition-all duration-300 group"
                      aria-label={t("auth.links.account")}
                      title={user.user_metadata?.full_name || user.email}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <HiUser className="w-5 h-5 text-bakery-brown-600 group-hover:text-bakery-brown-800 transition-colors duration-300" />
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-bakery-cream-200 py-2 z-[9999]`}
                        >
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
                          className={`flex items-center px-4 py-2 text-sm text-bakery-brown-700 hover:bg-bakery-cream-50 hover:text-bakery-brown-900 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t("auth.links.profile")}
                        </Link>

                        <Link
                          to="/orders"
                          className={`flex items-center px-4 py-2 text-sm text-bakery-brown-700 hover:bg-bakery-cream-50 hover:text-bakery-brown-900 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {t("navbar.orders")}
                        </Link>

                        <Link
                          to="/wishlist"
                          className={`flex items-center px-4 py-2 text-sm text-bakery-brown-700 hover:bg-bakery-cream-50 hover:text-bakery-brown-900 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <svg className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {t("navbar.wishlist")}
                        </Link>

                        <div className="border-t border-bakery-cream-200 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                          >
                            <svg className={`w-4 h-4 ${isRTL ? 'ml-3' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {t("auth.buttons.signOut")}
                          </button>
                        </div>
                      </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Guest User - Sign In Icon
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/auth/signin"
                      className="p-2 hover:bg-bakery-cream-50 rounded-full transition-all duration-300 group"
                      title={t("auth.buttons.signIn")}
                    >
                      <HiUser className="w-5 h-5 text-bakery-brown-600 group-hover:text-bakery-brown-800 transition-colors duration-300" />
                    </Link>
                  </motion.div>
                )}
              </div>
              
            )}
             <LanguageSwitcher />

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 hover:bg-bakery-cream-50 rounded-full transition-colors duration-200 touch-manipulation"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("common.menu")}
              aria-expanded={menuOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 text-bakery-brown-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mega Menu */}
      <AnimatePresence>
        {megaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-[90px] left-0 right-0 bg-white shadow-2xl border-t border-bakery-cream-200 z-40"
            style={{ top: scrolled ? '60px' : '90px' }}
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Bakery Section */}
                {categorizedItems.bakery.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-bakery-brown-800 mb-4 border-b border-bakery-cream-200 pb-2">
                      {t('categories.bakery', 'Bakery')}
                    </h3>
                    <div className="space-y-2">
                      {categorizedItems.bakery.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.id}`}
                          onClick={() => {
                            setMegaMenuOpen(false);
                            handleSelectCategory(category.id);
                          }}
                          className="block px-3 py-2 text-bakery-brown-600 hover:text-bakery-brown-800 hover:bg-bakery-cream-50 rounded-lg transition-all duration-200"
                          dir={dir}
                        >
                          {getCategoryDisplayName(category, t)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dairy Section */}
                {categorizedItems.dairy.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-bakery-brown-800 mb-4 border-b border-bakery-cream-200 pb-2">
                      {t('categories.dairy', 'Dairy Products')}
                    </h3>
                    <div className="space-y-2">
                      {categorizedItems.dairy.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.id}`}
                          onClick={() => {
                            setMegaMenuOpen(false);
                            handleSelectCategory(category.id);
                          }}
                          className="block px-3 py-2 text-bakery-brown-600 hover:text-bakery-brown-800 hover:bg-bakery-cream-50 rounded-lg transition-all duration-200"
                          dir={dir}
                        >
                          {getCategoryDisplayName(category, t)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Categories */}
                {categorizedItems.other.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-bakery-brown-800 mb-4 border-b border-bakery-cream-200 pb-2">
                      {t('categories.other', 'Other')}
                    </h3>
                    <div className="space-y-2">
                      {categorizedItems.other.map((category) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.id}`}
                          onClick={() => {
                            setMegaMenuOpen(false);
                            handleSelectCategory(category.id);
                          }}
                          className="block px-3 py-2 text-bakery-brown-600 hover:text-bakery-brown-800 hover:bg-bakery-cream-50 rounded-lg transition-all duration-200"
                          dir={dir}
                        >
                          {getCategoryDisplayName(category, t)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: isRTL ? 320 : -320 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? 320 : -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
        {/* Mobile Menu Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2">
            <img
              src={brandLogoSrc}
              onError={handleLogoError}
              alt="Bakeo"
              className="h-12 sm:h-14 w-auto object-contain select-none pointer-events-none"
              decoding="async"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            />
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation"
            onClick={() => setMenuOpen(false)}
            aria-label={t("common.close")}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder={t("navbar.search")}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
              dir={dir}
            />
          </form>
        </div>

        {/* Mobile Navigation */}
        <nav className={`flex flex-col p-4 sm:p-6 space-y-3 ${isRTL ? 'text-right' : 'text-left'}`} dir={dir}>
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center px-4 py-3 text-bakery-brown-700 hover:bg-gradient-to-r hover:from-bakery-cream-50 hover:to-bakery-peach-50 hover:text-bakery-brown-800 rounded-xl transition-all duration-200 font-medium touch-manipulation min-h-[48px] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {t("navbar.home")}
          </NavLink>

          <NavLink
            to="/about"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center px-4 py-3 text-bakery-brown-700 hover:bg-gradient-to-r hover:from-bakery-cream-50 hover:to-bakery-peach-50 hover:text-bakery-brown-800 rounded-xl transition-all duration-200 font-medium touch-manipulation min-h-[48px] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("navbar.about")}
          </NavLink>

          {/* Categories Section */}
          <div className="py-2 border-t border-bakery-cream-200">
            <div className="px-4 py-2 text-sm font-semibold text-bakery-brown-600 uppercase tracking-wide">
              {t("navbar.categories")}
            </div>
            <div className="mt-2 space-y-1">
              <CategoriesMenu onSelectCategory={handleSelectCategory} />
            </div>
          </div>

          <NavLink
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center px-4 py-3 text-bakery-brown-700 hover:bg-gradient-to-r hover:from-bakery-cream-50 hover:to-bakery-peach-50 hover:text-bakery-brown-800 rounded-xl transition-all duration-200 font-medium touch-manipulation min-h-[48px] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t("navbar.contact")}
          </NavLink>

          {/* User Section for Mobile */}
          {!loading && (
            <div className="border-t border-bakery-cream-200 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-semibold text-bakery-brown-600">
                    {user.user_metadata?.full_name || 'משתמש'}
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-bakery-brown-700 hover:bg-bakery-cream-50 rounded-xl transition-all duration-200 font-medium ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t("auth.links.profile")}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-bakery-brown-700 hover:bg-bakery-cream-50 rounded-xl transition-all duration-200 font-medium ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {t("navbar.orders")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
                  >
                    <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("auth.buttons.signOut")}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/auth/signin"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center py-3 px-4 bg-bakery-brown-600 text-white rounded-xl hover:bg-bakery-brown-700 transition-colors font-medium"
                  >
                    {t("auth.buttons.signIn")}
                  </Link>
                  <Link
                    to="/auth/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center py-3 px-4 border-2 border-bakery-brown-600 text-bakery-brown-600 rounded-xl hover:bg-bakery-brown-50 transition-colors font-medium"
                  >
                    {t("auth.buttons.signUp")}
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
