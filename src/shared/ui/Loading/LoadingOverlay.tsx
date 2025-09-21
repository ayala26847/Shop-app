// Overlay loading component for modals and sections

import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { motion, AnimatePresence } from 'framer-motion';

export interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  backdrop?: 'blur' | 'dark' | 'light' | 'transparent';
  position?: 'center' | 'top' | 'bottom';
  zIndex?: number;
  className?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title,
  description,
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  backdrop = 'blur',
  position = 'center',
  zIndex = 50,
  className = '',
  children,
  onClose,
  closeOnBackdropClick = false,
  showCloseButton = false,
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-white/80',
    dark: 'bg-black/50',
    light: 'bg-white/90',
    transparent: 'bg-transparent',
  };

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20',
  };

  const overlayTitle = title || t('accessibility.loading');
  const overlayDescription = description || t('accessibility.loadingDescription');

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
      onClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 flex ${positionClasses[position]} ${backdropClasses[backdrop]} ${className}`}
          style={{ zIndex }}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
          aria-describedby="loading-description"
          {...getAriaAttributes({
            label: overlayTitle,
            description: overlayDescription,
          })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 text-center"
          >
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('accessibility.close')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <LoadingSpinner
              size={size}
              variant={variant}
              color={color}
              className="mb-4"
            />

            <h3 id="loading-title" className="text-lg font-semibold text-gray-900 mb-2">
              {overlayTitle}
            </h3>

            <p id="loading-description" className="text-gray-600 mb-4">
              {overlayDescription}
            </p>

            {children && (
              <div className="text-sm text-gray-500">
                {children}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Specialized overlay components
export const ModalLoadingOverlay: React.FC<{
  isVisible: boolean;
  title?: string;
  onClose?: () => void;
  className?: string;
}> = ({ isVisible, title, onClose, className = '' }) => (
  <LoadingOverlay
    isVisible={isVisible}
    title={title || 'Processing...'}
    variant="spinner"
    size="md"
    backdrop="dark"
    position="center"
    onClose={onClose}
    showCloseButton={!!onClose}
    className={className}
  />
);

export const SectionLoadingOverlay: React.FC<{
  isVisible: boolean;
  title?: string;
  className?: string;
}> = ({ isVisible, title, className = '' }) => (
  <LoadingOverlay
    isVisible={isVisible}
    title={title || 'Loading...'}
    variant="dots"
    size="sm"
    backdrop="light"
    position="center"
    className={className}
  />
);

export const InlineLoadingOverlay: React.FC<{
  isVisible: boolean;
  title?: string;
  className?: string;
}> = ({ isVisible, title, className = '' }) => (
  <LoadingOverlay
    isVisible={isVisible}
    title={title || 'Loading...'}
    variant="pulse"
    size="sm"
    backdrop="transparent"
    position="center"
    className={className}
  />
);
