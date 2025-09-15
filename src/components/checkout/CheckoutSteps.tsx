import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDirection } from '../../hooks/useDirection'

interface CheckoutStep {
  id: string
  title: string
  titleKey: string
  description: string
  descriptionKey: string
}

interface CheckoutStepsProps {
  steps: CheckoutStep[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (stepIndex: number) => void
}

export function CheckoutSteps({ steps, currentStep, completedSteps, onStepClick }: CheckoutStepsProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" dir={dir}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isCurrent = index === currentStep
            const isClickable = index <= currentStep || completedSteps.includes(index - 1)

            return (
              <li key={step.id} className="relative flex-1">
                {/* Step connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-4 w-full h-0.5 ${
                      isCompleted || currentStep > index
                        ? 'bg-pink-500'
                        : 'bg-gray-200'
                    }`}
                    style={{
                      left: '50%',
                      right: '-50%'
                    }}
                  />
                )}

                {/* Step button */}
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`relative flex flex-col items-center group ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {/* Step circle */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ${
                      isCompleted
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : isCurrent
                        ? 'bg-white border-pink-500 text-pink-500'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        isCurrent || isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {t(step.titleKey)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {t(step.descriptionKey)}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}