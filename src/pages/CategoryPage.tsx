// pages/CategoryPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedProductList } from '../features/products/EnhancedProductList';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../hooks/useDirection';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { dir } = useDirection();

  return (
    <div className="container mx-auto px-4 py-6" dir={dir}>
      <h1 className="text-3xl font-bold mb-8">{t(`categories.${id}`)}</h1>
      <EnhancedProductList
        categoryId={id}
        showFilters={true}
        showPagination={true}
        showVariants={true}
      />
    </div>
  );
}
