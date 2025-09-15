import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useDirection } from '../../hooks/useDirection'
import { contactSchema, type ContactInfo } from '../../types/checkout'

interface ContactStepProps {
  data?: Partial<ContactInfo>
  onChange: (data: ContactInfo) => void
}

export function ContactStep({ data, onChange }: ContactStepProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ContactInfo>({
    resolver: zodResolver(contactSchema),
    defaultValues: data,
    mode: 'onChange'
  })

  // Watch for changes and update parent
  const watchedValues = watch()
  React.useEffect(() => {
    if (watchedValues.email || watchedValues.phone) {
      const validation = contactSchema.safeParse(watchedValues)
      if (validation.success) {
        onChange(validation.data)
      }
    }
  }, [watchedValues, onChange])

  return (
    <div className="space-y-6" dir={dir}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.fields.email')} *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('auth.placeholders.email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.fields.phone')}
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder={t('auth.placeholders.phone')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Newsletter signup */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('checkout.contact.newsletterSignup')}
            </p>
            <p className="text-sm text-gray-600">
              {t('checkout.contact.newsletterDescription')}
            </p>
          </div>
        </label>
      </div>

      {/* Account creation notice for guests */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              {t('checkout.contact.accountCreation')}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {t('checkout.contact.accountCreationDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}