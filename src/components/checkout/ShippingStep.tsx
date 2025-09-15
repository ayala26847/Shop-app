import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useDirection } from '../../hooks/useDirection'
import { addressSchema, type Address } from '../../types/checkout'

interface ShippingStepProps {
  data?: Partial<Address>
  onChange: (data: Address) => void
}

export function ShippingStep({ data, onChange }: ShippingStepProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: data,
    mode: 'onChange'
  })

  // Watch for changes and update parent
  const watchedValues = watch()
  React.useEffect(() => {
    const validation = addressSchema.safeParse(watchedValues)
    if (validation.success) {
      onChange(validation.data)
    }
  }, [watchedValues, onChange])

  return (
    <div className="space-y-6" dir={dir}>
      {/* Full Name and Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.fullName')} *
          </label>
          <input
            type="text"
            id="full_name"
            {...register('full_name')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.full_name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('checkout.address.fullNamePlaceholder')}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.company')} ({t('common.optional')})
          </label>
          <input
            type="text"
            id="company"
            {...register('company')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder={t('checkout.address.companyPlaceholder')}
          />
        </div>
      </div>

      {/* Address Lines */}
      <div>
        <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-2">
          {t('checkout.address.addressLine1')} *
        </label>
        <input
          type="text"
          id="address_line_1"
          {...register('address_line_1')}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
            errors.address_line_1 ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={t('checkout.address.addressLine1Placeholder')}
        />
        {errors.address_line_1 && (
          <p className="mt-1 text-sm text-red-600">{errors.address_line_1.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-2">
          {t('checkout.address.addressLine2')} ({t('common.optional')})
        </label>
        <input
          type="text"
          id="address_line_2"
          {...register('address_line_2')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder={t('checkout.address.addressLine2Placeholder')}
        />
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.city')} *
          </label>
          <input
            type="text"
            id="city"
            {...register('city')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('checkout.address.cityPlaceholder')}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state_province" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.stateProvince')} *
          </label>
          <input
            type="text"
            id="state_province"
            {...register('state_province')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.state_province ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('checkout.address.stateProvincePlaceholder')}
          />
          {errors.state_province && (
            <p className="mt-1 text-sm text-red-600">{errors.state_province.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.postalCode')} *
          </label>
          <input
            type="text"
            id="postal_code"
            {...register('postal_code')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.postal_code ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('checkout.address.postalCodePlaceholder')}
          />
          {errors.postal_code && (
            <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
          )}
        </div>
      </div>

      {/* Country and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.country')} *
          </label>
          <select
            id="country"
            {...register('country')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="IL">{t('checkout.address.countries.israel')}</option>
            <option value="US">{t('checkout.address.countries.unitedStates')}</option>
            <option value="CA">{t('checkout.address.countries.canada')}</option>
            <option value="GB">{t('checkout.address.countries.unitedKingdom')}</option>
            <option value="AU">{t('checkout.address.countries.australia')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('checkout.address.phone')} ({t('common.optional')})
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('checkout.address.phonePlaceholder')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('checkout.shipping.deliveryInstructions')}
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t('checkout.shipping.deliveryInstructionsDescription')}
        </p>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder={t('checkout.shipping.deliveryInstructionsPlaceholder')}
        />
      </div>
    </div>
  )
}