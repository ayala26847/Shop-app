import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useDirection } from '../../hooks/useDirection'
import { useGetProductsQuery } from '../../store/api/productsApi'
import { EnhancedProductCard } from '../../components/ui/EnhancedProductCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import type { ProductFilters } from '../../store/api/productsApi'

interface EnhancedProductListProps {
  categoryId?: string
  featured?: boolean
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  showVariants?: boolean
}

export function EnhancedProductList({
  categoryId,
  featured,
  limit = 12,
  showFilters = true,
  showPagination = true,
  showVariants = false
}: EnhancedProductListProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state
  const [filters, setFilters] = useState<ProductFilters>({
    category: categoryId,
    featured,
    limit,
    page: 1,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Update filters from URL params
  useEffect(() => {
    const newFilters: ProductFilters = {
      category: categoryId || searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      inStock: searchParams.get('inStock') === 'true',
      featured: featured || searchParams.get('featured') === 'true',
      priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: Number(searchParams.get('page')) || 1,
      limit
    }
    setFilters(newFilters)
  }, [searchParams, categoryId, featured, limit])

  // Update URL when filters change
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)

    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    setSearchParams(params)
  }

  // Fetch products
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch
  } = useGetProductsQuery(filters)

  const products = productsResponse?.products || []
  const hasMore = productsResponse?.hasMore || false
  const total = productsResponse?.total || 0

  // Load more products (pagination)
  const loadMore = () => {
    const nextPage = (filters.page || 1) + 1
    setFilters(prev => ({ ...prev, page: nextPage }))

    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
  }

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">{t('common.loading')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          {typeof error === 'string' ? error : t('errors.loadingProducts')}
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary"
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir={dir}>
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.search')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  placeholder={t('product.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('product.sortBy')}
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  updateFilters({ sortBy: sortBy as any, sortOrder: sortOrder as any })
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="created_at-desc">{t('product.sort.newest')}</option>
                <option value="created_at-asc">{t('product.sort.oldest')}</option>
                <option value="name-asc">{t('product.sort.nameAZ')}</option>
                <option value="name-desc">{t('product.sort.nameZA')}</option>
                <option value="price-asc">{t('product.sort.priceLowHigh')}</option>
                <option value="price-desc">{t('product.sort.priceHighLow')}</option>
                <option value="rating-desc">{t('product.sort.rating')}</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('product.priceRange')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('product.minPrice')}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-pink-500 focus:border-pink-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder={t('product.maxPrice')}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('product.availability')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => updateFilters({ inStock: e.target.checked || undefined })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('product.inStockOnly')}
                  </span>
                </label>
                {!featured && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured || false}
                      onChange={(e) => updateFilters({ featured: e.target.checked || undefined })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('product.featuredOnly')}
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setFilters({
                  category: categoryId,
                  featured,
                  limit,
                  page: 1,
                  sortBy: 'created_at',
                  sortOrder: 'desc'
                })
                setSearchParams({})
              }}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              {t('product.clearFilters')}
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {t('product.resultsCount', { count: total, showing: products.length })}
        </p>
        {filters.search && (
          <p className="text-sm text-gray-600">
            {t('product.searchResults', { query: filters.search })}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              showVariants={showVariants}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('product.noProducts')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('product.noProductsDescription')}
          </p>
          {(filters.search || filters.category || filters.inStock || filters.priceMin || filters.priceMax) && (
            <button
              onClick={() => {
                setFilters({
                  category: categoryId,
                  featured,
                  limit,
                  page: 1,
                  sortBy: 'created_at',
                  sortOrder: 'desc'
                })
                setSearchParams({})
              }}
              className="btn-secondary"
            >
              {t('product.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Load More / Pagination */}
      {showPagination && hasMore && products.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="btn-secondary px-8 py-3"
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            ) : (
              t('product.loadMore')
            )}
          </button>
        </div>
      )}
    </div>
  )
}