import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDirection } from '../../hooks/useDirection'
import type { PaymentMethod } from '../../types/checkout'

interface PaymentStepProps {
  onNext: (data: PaymentMethod) => void
  onBack: () => void
  initialData?: Partial<PaymentMethod>
}

export function PaymentStep({ onNext, onBack, initialData }: PaymentStepProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const [paymentData, setPaymentData] = useState<PaymentMethod>({
    method: initialData?.method || 'credit_card',
    card_number: initialData?.card_number || '',
    expiry_month: initialData?.expiry_month || '',
    expiry_year: initialData?.expiry_year || '',
    security_code: initialData?.security_code || '',
    cardholder_name: initialData?.cardholder_name || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (paymentData.method === 'credit_card') {
      if (!paymentData.card_number || paymentData.card_number.length < 16) {
        newErrors.card_number = t('checkout.payment.errors.invalidCard')
      }
      if (!paymentData.expiry_month || !paymentData.expiry_year) {
        newErrors.expiry = t('checkout.payment.errors.invalidExpiry')
      }
      if (!paymentData.security_code || paymentData.security_code.length < 3) {
        newErrors.security_code = t('checkout.payment.errors.invalidCvv')
      }
      if (!paymentData.cardholder_name) {
        newErrors.cardholder_name = t('checkout.payment.errors.cardholderRequired')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePayment()) {
      return
    }

    setIsProcessing(true)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsProcessing(false)
    onNext(paymentData)
  }

  const handleInputChange = (field: keyof PaymentMethod, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h2 className="text-2xl font-bold text-bakery-brown-800 mb-2">
          {t('checkout.payment.title')}
        </h2>
        <p className="text-bakery-brown-600">
          {t('checkout.payment.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-bakery-brown-700 mb-3">
            {t('checkout.payment.method')}
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="credit_card"
                name="payment_method"
                value="credit_card"
                checked={paymentData.method === 'credit_card'}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="mr-3"
              />
              <label htmlFor="credit_card" className="flex items-center cursor-pointer">
                <span>{t('checkout.payment.creditCard')}</span>
                <div className="ml-3 flex space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">MasterCard</span>
                </div>
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="paypal"
                name="payment_method"
                value="paypal"
                checked={paymentData.method === 'paypal'}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="mr-3"
              />
              <label htmlFor="paypal" className="cursor-pointer">
                {t('checkout.payment.paypal')}
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="bank_transfer"
                name="payment_method"
                value="bank_transfer"
                checked={paymentData.method === 'bank_transfer'}
                onChange={(e) => handleInputChange('method', e.target.value)}
                className="mr-3"
              />
              <label htmlFor="bank_transfer" className="cursor-pointer">
                {t('checkout.payment.bankTransfer')}
              </label>
            </div>
          </div>
        </div>

        {/* Credit Card Form */}
        {paymentData.method === 'credit_card' && (
          <div className="space-y-4 p-4 bg-bakery-cream-50 rounded-2xl border border-bakery-cream-200">
            <div>
              <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
                {t('checkout.payment.cardNumber')} *
              </label>
              <input
                type="text"
                value={paymentData.card_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                  handleInputChange('card_number', value)
                }}
                className={`input-field ${errors.card_number ? 'border-red-500' : ''}`}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
              />
              {errors.card_number && (
                <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
                {t('checkout.payment.cardholderName')} *
              </label>
              <input
                type="text"
                value={paymentData.cardholder_name}
                onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                className={`input-field ${errors.cardholder_name ? 'border-red-500' : ''}`}
                placeholder={t('checkout.payment.cardholderPlaceholder')}
              />
              {errors.cardholder_name && (
                <p className="text-red-500 text-sm mt-1">{errors.cardholder_name}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
                  {t('checkout.payment.expiryMonth')} *
                </label>
                <select
                  value={paymentData.expiry_month}
                  onChange={(e) => handleInputChange('expiry_month', e.target.value)}
                  className={`input-field ${errors.expiry ? 'border-red-500' : ''}`}
                >
                  <option value="">{t('checkout.payment.month')}</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                      {(i + 1).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
                  {t('checkout.payment.expiryYear')} *
                </label>
                <select
                  value={paymentData.expiry_year}
                  onChange={(e) => handleInputChange('expiry_year', e.target.value)}
                  className={`input-field ${errors.expiry ? 'border-red-500' : ''}`}
                >
                  <option value="">{t('checkout.payment.year')}</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
                  {t('checkout.payment.cvv')} *
                </label>
                <input
                  type="text"
                  value={paymentData.security_code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    handleInputChange('security_code', value)
                  }}
                  className={`input-field ${errors.security_code ? 'border-red-500' : ''}`}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            {(errors.expiry || errors.security_code) && (
              <p className="text-red-500 text-sm">
                {errors.expiry || errors.security_code}
              </p>
            )}
          </div>
        )}

        {/* PayPal */}
        {paymentData.method === 'paypal' && (
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <p className="text-blue-800">
              {t('checkout.payment.paypalDescription')}
            </p>
          </div>
        )}

        {/* Bank Transfer */}
        {paymentData.method === 'bank_transfer' && (
          <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
            <p className="text-green-800">
              {t('checkout.payment.bankTransferDescription')}
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-700">
              {t('checkout.payment.securityNotice')}
            </span>
          </div>
        </div>

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
            type="submit"
            disabled={isProcessing}
            className="btn-primary"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                {t('checkout.payment.processing')}
              </div>
            ) : (
              t('common.continue')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}