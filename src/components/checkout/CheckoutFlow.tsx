import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDirection } from '../../hooks/useDirection'
import { useGetCartQuery } from '../../store/api/cartApi'
import { useCreateOrderMutation } from '../../store/api/ordersApi'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { CheckoutSteps } from './CheckoutSteps'
import { ContactStep } from './ContactStep'
import { ShippingStep } from './ShippingStep'
import { BillingStep } from './BillingStep'
import { PaymentStep } from './PaymentStep'
import { ReviewStep } from './ReviewStep'
import { checkoutSteps, type CheckoutData, validateCheckoutStep } from '../../types/checkout'

export function CheckoutFlow() {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Current step state
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Form data state
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({
    contact: user ? {
      email: user.email || '',
      phone: user.user_metadata?.phone || ''
    } : {
      email: '',
      phone: ''
    },
    billing_address: {
      full_name: user?.user_metadata?.full_name || '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'IL',
      phone: ''
    },
    shipping_address: {
      full_name: user?.user_metadata?.full_name || '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'IL',
      phone: ''
    },
    payment: {
      payment_method: 'credit_card',
      save_payment_method: false,
      terms_accepted: false
    },
    use_billing_for_shipping: true,
    notes: '',
    newsletter_signup: false
  })

  // API hooks
  const { data: cartSummary, isLoading: cartLoading } = useGetCartQuery()
  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation()

  // Check if cart is empty and redirect
  useEffect(() => {
    if (!cartLoading && (!cartSummary || cartSummary.items.length === 0)) {
      navigate('/cart')
    }
  }, [cartSummary, cartLoading, navigate])

  // Update form data
  const updateCheckoutData = (step: string, data: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [step]: { ...prev[step as keyof CheckoutData], ...data }
    }))
  }

  // Validate current step
  const validateCurrentStep = () => {
    const step = checkoutSteps[currentStep]
    if (!step) return false

    const validation = validateCheckoutStep(step.id, checkoutData)
    return validation.success
  }

  // Go to next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
      if (currentStep < checkoutSteps.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Go to specific step
  const goToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.includes(stepIndex - 1)) {
      setCurrentStep(stepIndex)
    }
  }

  // Handle order submission
  const handleSubmitOrder = async () => {
    try {
      if (!checkoutData.contact || !checkoutData.billing_address || !checkoutData.shipping_address || !checkoutData.payment) {
        throw new Error('Please complete all required fields')
      }

      const orderRequest = {
        email: checkoutData.contact.email,
        phone: checkoutData.contact.phone,
        billing_address: checkoutData.billing_address,
        shipping_address: checkoutData.use_billing_for_shipping
          ? checkoutData.billing_address
          : checkoutData.shipping_address,
        notes: checkoutData.notes,
        payment_method: checkoutData.payment.payment_method
      }

      const result = await createOrder(orderRequest).unwrap()

      // Redirect to order confirmation
      navigate(`/order-confirmation/${result.id}`)
    } catch (error) {
      console.error('Order creation failed:', error)
      // Handle error (show toast, etc.)
    }
  }

  // Show loading if cart is loading
  if (cartLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">{t('common.loading')}</span>
      </div>
    )
  }

  // Redirect if cart is empty
  if (!cartSummary || cartSummary.items.length === 0) {
    return null
  }

  const currentStepData = checkoutSteps[currentStep]
  const isLastStep = currentStep === checkoutSteps.length - 1

  return (
    <div className="max-w-6xl mx-auto space-y-8" dir={dir}>
      {/* Progress Steps */}
      <CheckoutSteps
        steps={checkoutSteps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t(currentStepData.titleKey)}
              </h2>
              <p className="text-gray-600 mt-2">
                {t(currentStepData.descriptionKey)}
              </p>
            </div>

            {/* Step Content */}
            <div className="space-y-6">
              {currentStep === 0 && (
                <ContactStep
                  data={checkoutData.contact}
                  onChange={(data) => updateCheckoutData('contact', data)}
                />
              )}

              {currentStep === 1 && (
                <ShippingStep
                  data={checkoutData.shipping_address}
                  onChange={(data) => updateCheckoutData('shipping_address', data)}
                />
              )}

              {currentStep === 2 && (
                <BillingStep
                  data={checkoutData.billing_address}
                  useBillingForShipping={checkoutData.use_billing_for_shipping}
                  onAddressChange={(data) => updateCheckoutData('billing_address', data)}
                  onUseBillingChange={(value) => updateCheckoutData('use_billing_for_shipping', value)}
                />
              )}

              {currentStep === 3 && (
                <PaymentStep
                  data={checkoutData.payment}
                  onChange={(data) => updateCheckoutData('payment', data)}
                />
              )}

              {currentStep === 4 && (
                <ReviewStep
                  checkoutData={checkoutData}
                  cartSummary={cartSummary}
                  onNotesChange={(notes) => updateCheckoutData('notes', notes)}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('checkout.navigation.previous')}
              </button>

              {isLastStep ? (
                <button
                  onClick={handleSubmitOrder}
                  disabled={orderLoading || !validateCurrentStep()}
                  className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {orderLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{t('checkout.submitting')}</span>
                    </div>
                  ) : (
                    t('checkout.placeOrder')
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!validateCurrentStep()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('checkout.navigation.next')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('checkout.orderSummary')}
            </h3>

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cartSummary.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                    <img
                      src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name}
                      {item.variant && ` - ${item.variant.title}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('common.quantity')}: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₪{item.subtotal.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.items')}</span>
                <span className="font-medium">₪{cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span className="font-medium text-green-600">
                  {cartSummary.subtotal >= 200 ? t('cart.freeShipping') : '₪15.00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('checkout.tax')}</span>
                <span className="font-medium">₪{(cartSummary.subtotal * 0.17).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span>{t('cart.total')}</span>
                <span>₪{(cartSummary.subtotal * 1.17 + (cartSummary.subtotal >= 200 ? 0 : 15)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}