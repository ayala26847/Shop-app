import React from 'react';
import { useTranslation } from 'react-i18next';

interface TrustSignalProps {
  type: 'security' | 'guarantee' | 'testimonial' | 'certification' | 'stats';
  compact?: boolean;
}

export function TrustSignals({ type, compact = false }: TrustSignalProps) {
  const { t } = useTranslation();

  const signals = {
    security: [
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        title: t('trust.securePayment'),
        subtitle: t('trust.securePaymentDesc'),
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
        title: t('trust.dataProtection'),
        subtitle: t('trust.dataProtectionDesc'),
      },
    ],
    guarantee: [
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: t('trust.moneyBackGuarantee'),
        subtitle: t('trust.moneyBackGuaranteeDesc'),
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        title: t('trust.qualityPromise'),
        subtitle: t('trust.qualityPromiseDesc'),
      },
    ],
    testimonial: [
      {
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
        title: t('trust.customerRating'),
        subtitle: t('trust.customerRatingDesc'),
      },
    ],
    certification: [
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
        title: t('trust.certifiedKosher'),
        subtitle: t('trust.certifiedKosherDesc'),
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        ),
        title: t('trust.freshDaily'),
        subtitle: t('trust.freshDailyDesc'),
      },
    ],
    stats: [
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        title: t('trust.happyCustomers'),
        subtitle: t('trust.happyCustomersDesc'),
      },
      {
        icon: (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        title: t('trust.fastDelivery'),
        subtitle: t('trust.fastDeliveryDesc'),
      },
    ],
  };

  const currentSignals = signals[type] || [];

  if (compact) {
    return (
      <div className="flex items-center gap-6 py-4 px-6 bg-bakery-cream-50 rounded-2xl border border-bakery-cream-200">
        {currentSignals.slice(0, 3).map((signal, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-bakery-brown-500 to-bakery-gold-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {React.cloneElement(signal.icon, { className: 'w-5 h-5' })}
            </div>
            <div>
              <p className="text-sm font-bold text-bakery-brown-800">{signal.title}</p>
              <p className="text-xs text-bakery-brown-600">{signal.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentSignals.map((signal, index) => (
        <div
          key={index}
          className="feature-card text-center group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-bakery-brown-500 to-bakery-gold-500 rounded-full flex items-center justify-center text-white shadow-warm group-hover:shadow-large transition-all duration-300 group-hover:scale-110">
            {signal.icon}
          </div>
          <h3 className="text-lg font-bold mb-2 text-bakery-brown-800">{signal.title}</h3>
          <p className="text-bakery-brown-600 leading-relaxed">{signal.subtitle}</p>
        </div>
      ))}
    </div>
  );
}

export function TrustBar() {
  return (
    <div className="bg-bakery-cream-50 border-t border-bakery-cream-200 py-4">
      <div className="container mx-auto px-4">
        <TrustSignals type="security" compact />
      </div>
    </div>
  );
}