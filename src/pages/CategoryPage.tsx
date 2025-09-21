// pages/CategoryPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedProductList } from '../features/products/EnhancedProductList';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';
import { useGetCategoryQuery } from '../store/api/productsApi';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getCategoryDisplayName } from '../utils/categoryUtils';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { dir } = useDirection();

  // Fetch category data
  const { data: category, isLoading, error } = useGetCategoryQuery(id || '');


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6" dir={dir}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-6" dir={dir}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('common.error')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('category.empty')}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-bakery-brown-600 text-white rounded-lg hover:bg-bakery-brown-700 transition-colors"
          >
            {t('common.back')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" dir={dir}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getCategoryDisplayName(category, t)}
        </h1>
        {category.description && (
          <p className="text-gray-600 text-lg">
            {category.description}
          </p>
        )}
      </div>
      <EnhancedProductList
        categoryId={id}
        showFilters={true}
        showPagination={true}
        showVariants={true}
      />
    </div>
  );
}
