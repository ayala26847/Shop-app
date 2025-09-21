import React from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useDirection } from '../../hooks/useDirection'
import type { BillingAddress } from '../../types/checkout'

interface BillingStepProps {
  onNext: (data: BillingAddress) => void
  onBack: () => void
  initialData?: Partial<BillingAddress>
}

const billingSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  address_line_1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state_province: yup.string().required('State/Province is required'),
  postal_code: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
  company: yup.string().optional(),
  address_line_2: yup.string().optional(),
  phone: yup.string().optional()
})

export function BillingStep({ onNext, onBack, initialData }: BillingStepProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<BillingAddress>({
    resolver: yupResolver(billingSchema),
    defaultValues: initialData
  })

  const onSubmit = (data: BillingAddress) => {
    onNext(data)
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h2 className="text-2xl font-bold text-bakery-brown-800 mb-2">
          {t('checkout.billing.title')}
        </h2>
        <p className="text-bakery-brown-600">
          {t('checkout.billing.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
              {t('checkout.billing.fullName')} *
            </label>
            <input
              {...register('full_name')}
              className={`input-field ${errors.full_name ? 'border-red-500' : ''}`}
              placeholder={t('checkout.billing.fullNamePlaceholder')}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
              {t('checkout.billing.company')}
            </label>
            <input
              {...register('company')}
              className="input-field"
              placeholder={t('checkout.billing.companyPlaceholder')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
            {t('checkout.billing.address')} *
          </label>
          <input
            {...register('address_line_1')}
            className={`input-field ${errors.address_line_1 ? 'border-red-500' : ''}`}
            placeholder={t('checkout.billing.addressPlaceholder')}
          />
          {errors.address_line_1 && (
            <p className="text-red-500 text-sm mt-1">{errors.address_line_1.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
            {t('checkout.billing.address2')}
          </label>
          <input
            {...register('address_line_2')}
            className="input-field"
            placeholder={t('checkout.billing.address2Placeholder')}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
              {t('checkout.billing.city')} *
            </label>
            <input
              {...register('city')}
              className={`input-field ${errors.city ? 'border-red-500' : ''}`}
              placeholder={t('checkout.billing.cityPlaceholder')}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
              {t('checkout.billing.state')} *
            </label>
            <input
              {...register('state_province')}
              className={`input-field ${errors.state_province ? 'border-red-500' : ''}`}
              placeholder={t('checkout.billing.statePlaceholder')}
            />
            {errors.state_province && (
              <p className="text-red-500 text-sm mt-1">{errors.state_province.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
              {t('checkout.billing.postalCode')} *
            </label>
            <input
              {...register('postal_code')}
              className={`input-field ${errors.postal_code ? 'border-red-500' : ''}`}
              placeholder={t('checkout.billing.postalCodePlaceholder')}
            />
            {errors.postal_code && (
              <p className="text-red-500 text-sm mt-1">{errors.postal_code.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
            {t('checkout.billing.country')} *
          </label>
          <select
            {...register('country')}
            className={`input-field ${errors.country ? 'border-red-500' : ''}`}
          >
            <option value="">{t('checkout.billing.selectCountry')}</option>
            <option value="IL">Israel</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
          </select>
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-bakery-brown-700 mb-2">
            {t('checkout.billing.phone')}
          </label>
          <input
            {...register('phone')}
            className="input-field"
            placeholder={t('checkout.billing.phonePlaceholder')}
          />
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            {t('common.back')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? t('common.processing') : t('common.continue')}
          </button>
        </div>
      </form>
    </div>
  )
}