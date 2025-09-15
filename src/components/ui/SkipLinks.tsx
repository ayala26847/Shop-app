import React from 'react';
import { useTranslation } from 'react-i18next';

export function SkipLinks() {
  const { t } = useTranslation();

  const skipLinkStyle = `
    absolute -top-40 left-6 z-50 bg-bakery-brown-800 text-white px-4 py-2 rounded-lg
    focus:top-6 focus:outline-none focus:ring-4 focus:ring-bakery-cream-300
    transition-all duration-200 font-medium text-sm
  `;

  return (
    <div className="sr-only focus:not-sr-only">
      <a href="#main-content" className={skipLinkStyle}>
        {t('accessibility.skipToMain')}
      </a>
      <a href="#main-navigation" className={`${skipLinkStyle} left-32`}>
        {t('accessibility.skipToNav')}
      </a>
      <a href="#featured" className={`${skipLinkStyle} left-56`}>
        {t('accessibility.skipToProducts')}
      </a>
    </div>
  );
}

export default SkipLinks;