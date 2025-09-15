import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSignUpMutation, useGoogleSignUpMutation } from '../../store/api/authApi'
import { signUpSchema, type SignUpFormData } from '../../types/auth'
import { useDirection } from '../../hooks/useDirection'

interface SignUpFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export function SignUpForm({ onSuccess, redirectTo }: SignUpFormProps) {
  const { t } = useTranslation()
  const { dir, isRTL } = useDirection()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [signUp, { isLoading, error }] = useSignUpMutation()
  const [googleSignUp, { isLoading: isGoogleLoading }] = useGoogleSignUpMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      marketingConsent: false,
    },
  })

  const password = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUp(data).unwrap()

      if (result.success) {
        onSuccess?.()

        // Show success message and redirect
        if (result.user?.email_confirmed_at) {
          // Email confirmed immediately (e.g., for development)
          const redirectUrl = redirectTo || '/'
          navigate(redirectUrl)
        } else {
          // Email confirmation required
          navigate('/auth/verify-email', {
            state: { email: data.email, message: result.message }
          })
        }
      }
    } catch (err: any) {
      // Handle specific field errors
      if (err.includes('email') || err.includes('Email')) {
        setError('email', { message: err })
      } else if (err.includes('password') || err.includes('Password')) {
        setError('password', { message: err })
      } else {
        setError('root', { message: err })
      }
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password || '')
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-yellow-400', 'bg-green-500']
  const strengthLabels = [
    t('auth.password.veryWeak'),
    t('auth.password.weak'),
    t('auth.password.fair'),
    t('auth.password.good'),
    t('auth.password.strong')
  ]

  const handleGoogleSignUp = async () => {
    try {
      const result = await googleSignUp().unwrap()
      if (result.success) {
        onSuccess?.()
        const redirectUrl = redirectTo || '/'
        navigate(redirectUrl)
      }
    } catch (err: any) {
      setError('root', { message: err })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('auth.signUp.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('auth.signUp.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6" dir={dir}>
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              {t('auth.fields.fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              {...register('fullName')}
              className={`form-input ${
                errors.fullName
                  ? 'border-red-300 bg-red-50'
                  : ''
              }`}
              placeholder={t('auth.placeholders.fullName')}
            />
            {errors.fullName && (
              <p className="form-error" dir={dir}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fields.email')}
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder={t('auth.placeholders.email')}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" dir={dir}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Field (Optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fields.phone')} <span className="text-gray-500">({t('common.optional')})</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                errors.phone
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder={t('auth.placeholders.phone')}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600" dir={dir}>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fields.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder={t('auth.placeholders.password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-gray-200'}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {strengthLabels[passwordStrength - 1] || strengthLabels[0]}
                  </span>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-1 text-sm text-red-600" dir={dir}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.fields.confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder={t('auth.placeholders.confirmPassword')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" dir={dir}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Marketing Consent */}
          <div className="flex items-start">
            <div className="flex items-center h-6">
              <input
                id="marketingConsent"
                type="checkbox"
                {...register('marketingConsent')}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                {t('auth.fields.marketingConsent')}
              </label>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-sm text-gray-600" dir={dir}>
            {t('auth.signUp.termsText')}{' '}
            <Link to="/terms" className="text-pink-600 hover:text-pink-500">
              {t('legal.terms')}
            </Link>
            {' '}
            {t('common.and')}
            {' '}
            <Link to="/privacy" className="text-pink-600 hover:text-pink-500">
              {t('legal.privacy')}
            </Link>
          </div>

          {/* Error Display */}
          {(error || errors.root) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800" dir={dir}>
                    {typeof error === 'string' ? error : errors.root?.message || t('auth.errors.signUpFailed')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary ${isLoading ? 'btn-disabled' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('common.loading')}
              </div>
            ) : (
              t('auth.buttons.signUp')
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('auth.signUp.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className={`w-full btn-outline ${isGoogleLoading ? 'btn-disabled' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}
            dir={dir}
          >
            {!isGoogleLoading && (
              <svg className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isGoogleLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                {t('common.loading')}
              </div>
            ) : (
              t('auth.signUp.googleSignUp')
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t('auth.signUp.hasAccount')}{' '}
              <Link
                to="/auth/signin"
                className="text-pink-600 hover:text-pink-500 font-medium"
              >
                {t('auth.links.signIn')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}