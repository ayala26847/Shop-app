import { z } from 'zod'

// Address validation schema
export const addressSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  company: z.string().optional(),
  address_line_1: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(100, 'Address must be less than 100 characters'),
  address_line_2: z.string().optional(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  state_province: z
    .string()
    .min(2, 'State/Province must be at least 2 characters')
    .max(50, 'State/Province must be less than 50 characters'),
  postal_code: z
    .string()
    .min(5, 'Postal code must be at least 5 characters')
    .max(10, 'Postal code must be less than 10 characters'),
  country: z.string().default('IL'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\-\s()]{10,}$/, 'Please enter a valid phone number')
    .optional()
})

// Contact information schema
export const contactSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[+]?[0-9\-\s()]{10,}$/, 'Please enter a valid phone number')
    .optional()
})

// Payment schema
export const paymentSchema = z.object({
  payment_method: z.enum(['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']),

  // Credit card fields (conditional)
  card_number: z.string().optional(),
  card_expiry: z.string().optional(),
  card_cvc: z.string().optional(),
  card_name: z.string().optional(),

  // Additional options
  save_payment_method: z.boolean().default(false),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
})

// Complete checkout schema
export const checkoutSchema = z.object({
  contact: contactSchema,
  billing_address: addressSchema,
  shipping_address: addressSchema,
  payment: paymentSchema,
  use_billing_for_shipping: z.boolean().default(false),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  newsletter_signup: z.boolean().default(false)
})

// TypeScript types
export type Address = z.infer<typeof addressSchema>
export type ContactInfo = z.infer<typeof contactSchema>
export type PaymentInfo = z.infer<typeof paymentSchema>
export type CheckoutData = z.infer<typeof checkoutSchema>

// Checkout step validation
export const validateCheckoutStep = (step: string, data: Partial<CheckoutData>) => {
  switch (step) {
    case 'contact':
      return contactSchema.safeParse(data.contact)
    case 'shipping':
      return addressSchema.safeParse(data.shipping_address)
    case 'billing':
      return addressSchema.safeParse(data.billing_address)
    case 'payment':
      return paymentSchema.safeParse(data.payment)
    default:
      return { success: false, error: { issues: [{ message: 'Invalid step' }] } }
  }
}

// Checkout steps configuration
export const checkoutSteps = [
  {
    id: 'contact',
    title: 'Contact Information',
    titleKey: 'checkout.steps.contact',
    description: 'Enter your contact details',
    descriptionKey: 'checkout.steps.contactDescription'
  },
  {
    id: 'shipping',
    title: 'Shipping Address',
    titleKey: 'checkout.steps.shipping',
    description: 'Where should we deliver your order?',
    descriptionKey: 'checkout.steps.shippingDescription'
  },
  {
    id: 'billing',
    title: 'Billing Address',
    titleKey: 'checkout.steps.billing',
    description: 'Billing information for your order',
    descriptionKey: 'checkout.steps.billingDescription'
  },
  {
    id: 'payment',
    title: 'Payment',
    titleKey: 'checkout.steps.payment',
    description: 'Choose your payment method',
    descriptionKey: 'checkout.steps.paymentDescription'
  },
  {
    id: 'review',
    title: 'Review Order',
    titleKey: 'checkout.steps.review',
    description: 'Review your order before placing it',
    descriptionKey: 'checkout.steps.reviewDescription'
  }
]

// Payment methods configuration
export const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    nameKey: 'checkout.payment.creditCard',
    description: 'Pay securely with your credit card',
    descriptionKey: 'checkout.payment.creditCardDescription',
    icon: 'credit-card',
    available: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameKey: 'checkout.payment.paypal',
    description: 'Pay with your PayPal account',
    descriptionKey: 'checkout.payment.paypalDescription',
    icon: 'paypal',
    available: true
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameKey: 'checkout.payment.bankTransfer',
    description: 'Pay via bank transfer',
    descriptionKey: 'checkout.payment.bankTransferDescription',
    icon: 'bank',
    available: true
  },
  {
    id: 'cash_on_delivery',
    name: 'Cash on Delivery',
    nameKey: 'checkout.payment.cashOnDelivery',
    description: 'Pay when your order arrives',
    descriptionKey: 'checkout.payment.cashOnDeliveryDescription',
    icon: 'cash',
    available: true
  }
]