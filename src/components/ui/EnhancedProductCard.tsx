import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDirection } from '../../hooks/useDirection'
import { useAddToCartMutation } from '../../store/api/cartApi'
import { OptimizedImage } from './OptimizedImage'
import type { EnhancedProduct } from '../../store/api/productsApi'

interface EnhancedProductCardProps {
  product: EnhancedProduct
  showVariants?: boolean
  onAddToCart?: (productId: string, variantId?: string, quantity?: number) => void
}

export function EnhancedProductCard({
  product,
  showVariants = false,
  onAddToCart
}: EnhancedProductCardProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const [addToCart] = useAddToCartMutation()

  // Get current variant or use base product
  const currentVariant = selectedVariant
    ? product.variants?.find(v => v.id === selectedVariant)
    : null

  // Calculate current price and stock
  const currentPrice = currentVariant?.price ?? product.price
  const currentStock = currentVariant?.inventory_quantity ?? product.inventory_quantity ?? 0
  const isInStock = product.track_inventory ? currentStock > 0 : true
  const maxQuantity = product.track_inventory ? currentStock : 10

  // Check if product has discount
  const hasDiscount = product.compare_at_price && product.compare_at_price > currentPrice
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_at_price! - currentPrice) / product.compare_at_price!) * 100)
    : 0

  const handleAddToCart = async () => {
    if (!isInStock) return

    setIsAdding(true)

    try {
      if (onAddToCart) {
        onAddToCart(product.id, selectedVariant || undefined, quantity)
      } else {
        await addToCart({
          productId: product.id,
          variantId: selectedVariant || undefined,
          quantity
        }).unwrap()
      }
    } catch (error) {
      console.error('Add to cart error:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)))
  }

  return (
    <article
      className="group product-card relative touch-manipulation"
      role="article"
      aria-labelledby={`product-${product.id}-title`}
      dir={dir}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="badge-sale absolute top-3 left-3 z-10">
          -{discountPercentage}%
        </div>
      )}

      {/* Stock Status Badge */}
      {!isInStock && (
        <div className="absolute top-3 right-3 z-10 bg-bakery-brown-500 text-white text-xs px-3 py-1.5 rounded-full font-bold">
          {t('product.outOfStock')}
        </div>
      )}

      {/* Low Stock Warning */}
      {isInStock && product.track_inventory && currentStock <= 5 && (
        <div className="absolute top-3 right-3 z-10 bg-bakery-peach-500 text-white text-xs px-3 py-1.5 rounded-full font-bold">
          {t('product.lowStock', { count: currentStock })}
        </div>
      )}

      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="block">
        <div className="image-overlay aspect-[4/3] bg-bakery-cream-50 relative">
          <OptimizedImage
            src={product.main_image || product.images?.[0] || '/placeholder-product.jpg'}
            alt={`${product.name} - ${t('common.productImage')}`}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!isInStock ? 'grayscale opacity-75' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-bakery-brown-900 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30">
              {t('product.quickView')}
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6">
        {/* Product Name */}
        <Link to={`/products/${product.slug}`}>
          <h3
            id={`product-${product.id}-title`}
            className="font-bold text-xl text-bakery-brown-800 line-clamp-2 mb-3 hover:text-bakery-brown-900 transition-colors duration-300"
          >
            {product.name}
          </h3>
        </Link>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-bakery-brown-600 mb-4 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <span className="price-display">
              ₪{currentPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-bakery-brown-400 line-through">
                ₪{product.compare_at_price!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Price Range for Variants */}
          {product.has_variants && !selectedVariant && (
            <p className="text-sm text-bakery-brown-500 mt-1 font-medium">
              {t('product.priceFrom')}
            </p>
          )}
        </div>

        {/* Product Variants */}
        {showVariants && product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <label className="block text-sm font-bold text-bakery-brown-700 mb-2">
              {t('product.selectVariant')}
            </label>
            <select
              value={selectedVariant || ''}
              onChange={(e) => setSelectedVariant(e.target.value || null)}
              className="input-field text-sm py-2"
            >
              <option value="">{t('product.baseProduct')}</option>
              {product.variants.map((variant) => (
                <option
                  key={variant.id}
                  value={variant.id}
                  disabled={(variant.inventory_quantity || 0) <= 0}
                >
                  {variant.title} - ₪{(variant.price || product.price).toFixed(2)}
                  {(variant.inventory_quantity || 0) <= 0 && ` (${t('product.outOfStock')})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity Selector */}
        {isInStock && (
          <div className="mb-3">
            <label className="block text-sm font-bold text-bakery-brown-700 mb-2">
              {t('product.quantity')}
            </label>
            <div className="flex items-center border-2 border-bakery-cream-300 rounded-2xl w-fit bg-white/50">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-2 text-bakery-brown-600 hover:text-bakery-brown-800 hover:bg-bakery-cream-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-2xl transition-all duration-200"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold text-bakery-brown-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
                className="px-3 py-2 text-bakery-brown-600 hover:text-bakery-brown-800 hover:bg-bakery-cream-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-2xl transition-all duration-200"
              >
                +
              </button>
            </div>
            {product.track_inventory && (
              <p className="text-sm text-bakery-brown-500 mt-2 font-medium">
                {t('product.stockAvailable', { count: currentStock })}
              </p>
            )}
          </div>
        )}

        {/* Categories */}
        {product.categories && product.categories.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="category-chip text-xs"
                >
                  {t(`categories.${category.id}`)}
                </Link>
              ))}
              {product.categories.length > 3 && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-bakery-cream-100 text-bakery-brown-600 border border-bakery-cream-200 font-medium">
                  +{product.categories.length - 3} {t('common.more')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {product.rating && product.rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(product.rating!)
                      ? 'text-bakery-gold-500'
                      : 'text-bakery-cream-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-bakery-brown-600 ml-2 font-medium">
              {product.rating.toFixed(1)} ({product.reviews_count || 0})
            </span>
          </div>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isAdding}
          className={`w-full touch-manipulation ${
            isInStock
              ? 'btn-primary'
              : 'bg-bakery-brown-300 text-bakery-brown-500 cursor-not-allowed py-3 px-4 rounded-2xl font-medium'
          } ${isAdding ? 'opacity-75' : ''}`}
          aria-label={`${t('cta.add_to_cart')} - ${product.name}`}
        >
          {isAdding ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              {t('common.adding')}
            </div>
          ) : !isInStock ? (
            t('product.outOfStock')
          ) : (
            t('cta.add_to_cart')
          )}
        </button>

        {/* Featured Badge */}
        {product.featured && (
          <div className="mt-3 text-center">
            <span className="badge-new inline-flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t('product.featured')}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}