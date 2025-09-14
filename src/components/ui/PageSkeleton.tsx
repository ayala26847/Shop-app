import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
