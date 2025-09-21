import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useEmptyStateHandling } from '../../hooks/useErrorHandling';
import { EnhancedButton } from './EnhancedButton';
import { useMicroInteractions } from '../../hooks/useMicroInteractions';

interface EmptyStateProps {
  type: 'products' | 'orders' | 'cart' | 'search' | 'favorites' | 'reviews' | 'notifications' | 'custom';
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  };
  showIllustration?: boolean;
  enableAnimations?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  icon,
  action,
  secondaryAction,
  showIllustration = true,
  enableAnimations = true,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceChanges: true });
  const { getEmptyStateMessage } = useEmptyStateHandling();
  const { motionProps } = useMicroInteractions({
    hoverScale: 1.02,
    pressScale: 0.98,
  });

  // Get default content based on type
  const getDefaultContent = () => {
    const contentMap = {
      products: {
        title: t('accessibility.noProducts'),
        description: t('accessibility.noProductsDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      orders: {
        title: t('accessibility.noOrders'),
        description: t('accessibility.noOrdersDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      cart: {
        title: t('accessibility.cartEmpty'),
        description: t('accessibility.cartEmptyDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        ),
      },
      search: {
        title: t('accessibility.noSearchResults'),
        description: t('accessibility.noSearchResultsDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      },
      favorites: {
        title: t('accessibility.noFavorites'),
        description: t('accessibility.noFavoritesDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
      },
      reviews: {
        title: t('accessibility.noReviews'),
        description: t('accessibility.noReviewsDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      },
      notifications: {
        title: t('accessibility.noNotifications'),
        description: t('accessibility.noNotificationsDescription'),
        icon: (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4 7h8M4 7a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2" />
          </svg>
        ),
      },
      custom: {
        title: title || t('accessibility.emptyState'),
        description: description || t('accessibility.emptyStateDescription'),
        icon: icon || (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    };

    return contentMap[type] || contentMap.custom;
  };

  const content = getDefaultContent();
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalIcon = icon || content.icon;

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'w-12 h-12',
          title: 'text-lg font-semibold',
          description: 'text-sm',
          button: 'text-sm px-3 py-1.5',
        };
      case 'md':
        return {
          container: 'p-6',
          icon: 'w-16 h-16',
          title: 'text-xl font-semibold',
          description: 'text-base',
          button: 'text-base px-4 py-2',
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'w-20 h-20',
          title: 'text-2xl font-semibold',
          description: 'text-lg',
          button: 'text-lg px-6 py-3',
        };
      default:
        return {
          container: 'p-6',
          icon: 'w-16 h-16',
          title: 'text-xl font-semibold',
          description: 'text-base',
          button: 'text-base px-4 py-2',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Announce empty state to screen readers
  React.useEffect(() => {
    announce(finalTitle);
  }, [announce, finalTitle]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
        delay: 0.2 
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', delay: 0.4 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut', delay: 0.6 }
    }
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center ${sizeClasses.container} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      {showIllustration && (
        <motion.div
          className="mb-4"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <div className={`${sizeClasses.icon} text-gray-400`}>
            {finalIcon}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        className={`${sizeClasses.title} text-gray-900 mb-2`}
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        {finalTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        className={`${sizeClasses.description} text-gray-600 mb-6 max-w-md`}
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        {finalDescription}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
        >
          {action && (
            <EnhancedButton
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              className={sizeClasses.button}
              ariaLabel={action.label}
              {...(enableAnimations ? motionProps : {})}
            >
              {action.label}
            </EnhancedButton>
          )}

          {secondaryAction && (
            <EnhancedButton
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
              className={sizeClasses.button}
              ariaLabel={secondaryAction.label}
              {...(enableAnimations ? motionProps : {})}
            >
              {secondaryAction.label}
            </EnhancedButton>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Hook for empty state management
export function useEmptyState() {
  const { setEmptyState, isEmpty, getEmptyStateMessage } = useEmptyStateHandling();
  const { announce } = useAccessibility({ announceChanges: true });

  const setEmpty = React.useCallback((key: string, isEmpty: boolean) => {
    setEmptyState(key, isEmpty);
    if (isEmpty) {
      announce(getEmptyStateMessage(key));
    }
  }, [setEmptyState, announce, getEmptyStateMessage]);

  const getEmptyStateProps = React.useCallback((key: string, customProps?: Partial<EmptyStateProps>) => {
    const isCurrentlyEmpty = isEmpty(key);
    if (!isCurrentlyEmpty) return null;

    return {
      type: key as any,
      ...customProps,
    };
  }, [isEmpty]);

  return {
    setEmpty,
    isEmpty,
    getEmptyStateMessage,
    getEmptyStateProps,
  };
}
