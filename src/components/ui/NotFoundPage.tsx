import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import { EnhancedButton } from './EnhancedButton';
import { useMicroInteractions } from '../../hooks/useMicroInteractions';

interface NotFoundPageProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  showNavigation?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title,
  description,
  showSearch = true,
  showNavigation = true,
  enableAnimations = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { announce } = useAccessibility({ announceChanges: true });
  const { motionProps } = useMicroInteractions({
    hoverScale: 1.02,
    pressScale: 0.98,
  });

  const [searchQuery, setSearchQuery] = React.useState('');

  // Announce 404 to screen readers
  React.useEffect(() => {
    announce(t('accessibility.pageNotFound'));
  }, [announce, t]);

  const handleGoHome = () => {
    navigate('/');
    announce(t('accessibility.navigatedToHome'));
  };

  const handleGoBack = () => {
    navigate(-1);
    announce(t('accessibility.navigatedBack'));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      announce(t('accessibility.searchPerformed', { query: searchQuery }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const pageTitle = title || t('accessibility.pageNotFound');
  const pageDescription = description || t('accessibility.pageNotFoundDescription');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 0.2 
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', delay: 0.4 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', delay: 0.6 }
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 ${className}`}>
      <motion.div
        className="max-w-2xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="main"
        aria-labelledby="not-found-title"
        aria-describedby="not-found-description"
      >
        {/* 404 Icon */}
        <motion.div
          className="mb-8"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative">
            <svg
              className="w-32 h-32 text-gray-400 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-600">404</span>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          id="not-found-title"
          className="text-4xl font-bold text-gray-900 mb-4"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {pageTitle}
        </motion.h1>

        {/* Description */}
        <motion.p
          id="not-found-description"
          className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {pageDescription}
        </motion.p>

        {/* Search Form */}
        {showSearch && (
          <motion.form
            onSubmit={handleSearch}
            className="mb-8 max-w-md mx-auto"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t('accessibility.searchPlaceholder')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={t('accessibility.searchInput')}
              />
              <EnhancedButton
                type="submit"
                variant="primary"
                ariaLabel={t('accessibility.search')}
              >
                {t('accessibility.search')}
              </EnhancedButton>
            </div>
          </motion.form>
        )}

        {/* Navigation Buttons */}
        {showNavigation && (
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
          >
            <EnhancedButton
              variant="primary"
              onClick={handleGoHome}
              ariaLabel={t('accessibility.goToHome')}
              {...(enableAnimations ? motionProps : {})}
            >
              {t('accessibility.goToHome')}
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              onClick={handleGoBack}
              ariaLabel={t('accessibility.goBack')}
              {...(enableAnimations ? motionProps : {})}
            >
              {t('accessibility.goBack')}
            </EnhancedButton>
          </motion.div>
        )}

        {/* Additional Help */}
        <motion.div
          className="mt-12 text-sm text-gray-500"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="mb-2">{t('accessibility.needHelp')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-800 underline"
              aria-label={t('accessibility.contactSupport')}
            >
              {t('accessibility.contactSupport')}
            </a>
            <a
              href="/help"
              className="text-blue-600 hover:text-blue-800 underline"
              aria-label={t('accessibility.helpCenter')}
            >
              {t('accessibility.helpCenter')}
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Hook for 404 handling
export function useNotFoundHandling() {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceChanges: true });

  const handleNotFound = React.useCallback((path: string) => {
    announce(t('accessibility.pageNotFound'));
    console.warn(`404: Page not found - ${path}`);
  }, [announce, t]);

  const handleNotFoundRedirect = React.useCallback((fallbackPath: string = '/') => {
    announce(t('accessibility.redirectingToHome'));
    // In a real app, you might want to use a router redirect here
    window.location.href = fallbackPath;
  }, [announce, t]);

  return {
    handleNotFound,
    handleNotFoundRedirect,
  };
}
