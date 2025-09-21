import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDirection } from '../../hooks/useDirection'
import { useGetCartQuery } from '../../store/api/cartApi'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { CheckoutData } from '../../types/checkout'

interface ReviewStepProps {
  checkoutData: CheckoutData
  onBack: () => void
  onConfirm: () => void
  isProcessing?: boolean
}

export function ReviewStep({ checkoutData, onBack, onConfirm, isProcessing }: ReviewStepProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const { data: cart, isLoading } = useGetCartQuery()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-bakery-brown-600">{t('cart.empty')}</p>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = subtotal >= 150 ? 0 : 25
  const total = subtotal + shippingCost

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h2 className="text-2xl font-bold text-bakery-brown-800 mb-2">
          {t('checkout.review.title')}
        </h2>
        <p className="text-bakery-brown-600">
          {t('checkout.review.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-bakery-brown-800 mb-4">
              {t('cart.orderSummary')}
            </h3>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={`${item.product_id}-${item.variant_id || 'default'}`} className="flex justify-between items-center py-3 border-b border-bakery-cream-200">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-bakery-brown-800">{item.name}</h4>
                      {item.variant_title && (
                        <p className="text-sm text-bakery-brown-600">{item.variant_title}</p>
                      )}
                      <p className="text-sm text-bakery-brown-600">
                        {t('common.quantity')}: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-bakery-brown-800">
                      ₪{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-bakery-cream-300">
              <div className="flex justify-between">
                <span className="text-bakery-brown-600">{t('cart.subtotal')}:</span>
                <span className="font-medium">₪{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bakery-brown-600">{t('cart.shipping')}:</span>
                <span className="font-medium">
                  {shippingCost > 0 ? `₪${shippingCost.toFixed(2)}` : t('cart.freeShipping')}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-bakery-brown-800 pt-3 border-t border-bakery-cream-300">
                <span>{t('cart.total')}:</span>
                <span>₪{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-bold text-bakery-brown-800 mb-3">
              {t('checkout.contact.title')}
            </h3>
            <div className="bg-bakery-cream-50 p-4 rounded-2xl border border-bakery-cream-200">
              <p className="text-bakery-brown-800">{checkoutData.contact.email}</p>
              {checkoutData.contact.phone && (
                <p className="text-bakery-brown-600">{checkoutData.contact.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-bold text-bakery-brown-800 mb-3">
              {t('checkout.shipping.title')}
            </h3>
            <div className="bg-bakery-cream-50 p-4 rounded-2xl border border-bakery-cream-200">
              <p className="text-bakery-brown-800 font-medium">{checkoutData.shipping.full_name}</p>
              <p className="text-bakery-brown-600">{checkoutData.shipping.address_line_1}</p>
              {checkoutData.shipping.address_line_2 && (
                <p className="text-bakery-brown-600">{checkoutData.shipping.address_line_2}</p>
              )}
              <p className="text-bakery-brown-600">
                {checkoutData.shipping.city}, {checkoutData.shipping.state_province} {checkoutData.shipping.postal_code}
              </p>
              <p className="text-bakery-brown-600">{checkoutData.shipping.country}</p>
            </div>
          </div>

          {/* Billing Address */}
          {checkoutData.billing && (
            <div>
              <h3 className="text-lg font-bold text-bakery-brown-800 mb-3">
                {t('checkout.billing.title')}
              </h3>
              <div className="bg-bakery-cream-50 p-4 rounded-2xl border border-bakery-cream-200">
                <p className="text-bakery-brown-800 font-medium">{checkoutData.billing.full_name}</p>
                <p className="text-bakery-brown-600">{checkoutData.billing.address_line_1}</p>
                {checkoutData.billing.address_line_2 && (
                  <p className="text-bakery-brown-600">{checkoutData.billing.address_line_2}</p>
                )}
                <p className="text-bakery-brown-600">
                  {checkoutData.billing.city}, {checkoutData.billing.state_province} {checkoutData.billing.postal_code}
                </p>
                <p className="text-bakery-brown-600">{checkoutData.billing.country}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-bold text-bakery-brown-800 mb-3">
              {t('checkout.payment.method')}
            </h3>
            <div className="bg-bakery-cream-50 p-4 rounded-2xl border border-bakery-cream-200">
              {checkoutData.payment.method === 'credit_card' && (
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-bakery-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div>
                    <p className="text-bakery-brown-800 font-medium">{t('checkout.payment.creditCard')}</p>
                    {checkoutData.payment.card_number && (
                      <p className="text-bakery-brown-600">
                        **** **** **** {checkoutData.payment.card_number.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {checkoutData.payment.method === 'paypal' && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <p className="text-bakery-brown-800 font-medium">{t('checkout.payment.paypal')}</p>
                </div>
              )}
              {checkoutData.payment.method === 'bank_transfer' && (
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-bakery-brown-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M7 6L12 2l5 4v14H7V6z" />
                  </svg>
                  <p className="text-bakery-brown-800 font-medium">{t('checkout.payment.bankTransfer')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1"
            required
          />
          <label htmlFor="terms" className="text-sm text-yellow-800">
            {t('checkout.review.termsAcceptance')}
            <a href="/terms" className="underline hover:no-underline ml-1" target="_blank">
              {t('checkout.review.termsLink')}
            </a>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary"
          disabled={isProcessing}
        >
          {t('common.back')}
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="btn-primary text-lg px-8"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="spinner mr-2"></div>
              {t('checkout.review.processing')}
            </div>
          ) : (
            t('checkout.review.confirmOrder')
          )}
        </button>
      </div>
    </div>
  )
}