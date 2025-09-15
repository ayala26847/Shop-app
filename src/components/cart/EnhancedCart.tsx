import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDirection } from '../../hooks/useDirection'
import { useAuth } from '../../contexts/AuthContext'
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useSyncGuestCartMutation
} from '../../store/api/cartApi'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { OptimizedImage } from '../ui/OptimizedImage'
import type { EnhancedCartItem } from '../../store/api/cartApi'

interface CartItemComponentProps {
  item: EnhancedCartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  isUpdating: boolean
}

function CartItemComponent({ item, onUpdateQuantity, onRemove, isUpdating }: CartItemComponentProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const product = item.product!
  const variant = item.variant

  // Get display name and price
  const displayName = variant ? `${product.name} - ${variant.title}` : product.name
  const displayPrice = variant?.price ?? product.price
  const mainImage = product.images?.[0] || '/placeholder-product.jpg'

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id)
    } else {
      onUpdateQuantity(item.id, newQuantity)
    }
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-white rounded-lg border transition-colors ${
        !item.is_available ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
      dir={dir}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link to={`/products/${product.id}`}>
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <OptimizedImage
              src={mainImage}
              alt={displayName}
              className={`w-full h-full object-cover ${!item.is_available ? 'grayscale' : ''}`}
            />
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <Link
          to={`/products/${product.id}`}
          className="block hover:text-pink-600 transition-colors"
        >
          <h3 className="font-medium text-gray-900 truncate">
            {displayName}
          </h3>
        </Link>

        {/* Variant Details */}
        {variant && (
          <p className="text-sm text-gray-600 mt-1">
            {variant.title}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-gray-900">
            ₪{displayPrice.toFixed(2)}
          </span>
          {item.quantity > 1 && (
            <span className="text-sm text-gray-500">
              × {item.quantity}
            </span>
          )}
        </div>

        {/* Availability Status */}
        {!item.is_available && (
          <div className="mt-2">
            {item.stock_available <= 0 ? (
              <p className="text-sm text-red-600 font-medium">
                {t('cart.outOfStock')}
              </p>
            ) : (
              <p className="text-sm text-orange-600 font-medium">
                {t('cart.limitedStock', { available: item.stock_available })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex-shrink-0">
        {item.is_available ? (
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('cart.decreaseQuantity')}
            >
              -
            </button>
            <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.stock_available}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('cart.increaseQuantity')}
            >
              +
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              {t('cart.remove')}
            </button>
          </div>
        )}
      </div>

      {/* Subtotal */}
      <div className="flex-shrink-0 text-right min-w-[4rem]">
        <p className="font-semibold text-gray-900">
          ₪{item.subtotal.toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          aria-label={t('cart.removeItem', { item: displayName })}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function EnhancedCart() {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const { user } = useAuth()

  const {
    data: cartSummary,
    isLoading,
    error,
    refetch
  } = useGetCartQuery()

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation()
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation()
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation()
  const [syncGuestCart] = useSyncGuestCartMutation()

  // Sync guest cart when user logs in
  useEffect(() => {
    if (user) {
      syncGuestCart()
    }
  }, [user, syncGuestCart])

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await updateCartItem({ itemId, quantity }).unwrap()
    } catch (error) {
      console.error('Update cart item error:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId).unwrap()
    } catch (error) {
      console.error('Remove cart item error:', error)
    }
  }

  const handleClearCart = async () => {
    if (window.confirm(t('cart.confirmClear'))) {
      try {
        await clearCart().unwrap()
      } catch (error) {
        console.error('Clear cart error:', error)
      }
    }
  }

  if (isLoading) {
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
          {typeof error === 'string' ? error : t('cart.loadError')}
        </div>
        <button onClick={() => refetch()} className="btn-secondary">
          {t('common.retry')}
        </button>
      </div>
    )
  }

  const { items = [], unavailableItems = [], itemCount = 0, subtotal = 0 } = cartSummary || {}
  const availableItems = items.filter(item => item.is_available)

  if (items.length === 0) {
    return (
      <div className="text-center py-12" dir={dir}>
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('cart.empty')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('cart.emptyDescription')}
        </p>
        <Link to="/" className="btn-primary">
          {t('cart.continueShopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={dir}>
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('cart.title')} ({itemCount})
        </h1>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            {isClearing ? t('common.loading') : t('cart.clear')}
          </button>
        )}
      </div>

      {/* Unavailable Items Warning */}
      {unavailableItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {t('cart.unavailableItems')}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {t('cart.unavailableDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemComponent
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              isUpdating={isUpdating || isRemoving}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('cart.orderSummary')}
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('cart.items')} ({itemCount})
                </span>
                <span className="font-medium">
                  ₪{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {t('cart.shipping')}
                </span>
                <span className="font-medium text-green-600">
                  {subtotal >= 200 ? t('cart.freeShipping') : '₪15.00'}
                </span>
              </div>

              {/* Free shipping threshold */}
              {subtotal < 200 && (
                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  {t('cart.freeShippingThreshold', { amount: (200 - subtotal).toFixed(2) })}
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>{t('cart.total')}</span>
                  <span>₪{(subtotal + (subtotal >= 200 ? 0 : 15)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="mt-6 space-y-3">
              {availableItems.length > 0 ? (
                <Link
                  to="/checkout"
                  className="w-full btn-primary py-3 text-center block"
                >
                  {t('cart.checkout')}
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full btn-primary py-3 opacity-50 cursor-not-allowed"
                >
                  {t('cart.fixItemsToCheckout')}
                </button>
              )}

              <Link
                to="/"
                className="w-full btn-secondary py-3 text-center block"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('cart.secureCheckout')}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('cart.easyReturns')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}