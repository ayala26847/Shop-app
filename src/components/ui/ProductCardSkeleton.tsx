import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group border rounded-2xl bg-white overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/3] bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>

        {/* Price skeleton */}
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>

        {/* Tags skeleton */}
        <div className="flex gap-1 mb-4">
          <div className="h-5 bg-gray-200 rounded-full w-12"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};
