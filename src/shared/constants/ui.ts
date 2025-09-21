// UI constants

export const UI_BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

export const UI_SPACING = {
  XS: '0.25rem', // 4px
  SM: '0.5rem',  // 8px
  MD: '1rem',    // 16px
  LG: '1.5rem',  // 24px
  XL: '2rem',    // 32px
  '2XL': '3rem', // 48px
  '3XL': '4rem', // 64px
} as const;

export const UI_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  SECONDARY: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

export const UI_TYPOGRAPHY = {
  FONT_SIZES: {
    XS: '0.75rem',   // 12px
    SM: '0.875rem',  // 14px
    BASE: '1rem',    // 16px
    LG: '1.125rem',  // 18px
    XL: '1.25rem',   // 20px
    '2XL': '1.5rem', // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem',  // 36px
    '5XL': '3rem',     // 48px
    '6XL': '3.75rem',  // 60px
  },
  FONT_WEIGHTS: {
    THIN: 100,
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
    EXTRABOLD: 800,
    BLACK: 900,
  },
  LINE_HEIGHTS: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
} as const;

export const UI_SHADOWS = {
  SM: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  BASE: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  MD: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  LG: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  XL: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2XL': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  INNER: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

export const UI_BORDER_RADIUS = {
  NONE: '0px',
  SM: '0.125rem',   // 2px
  BASE: '0.25rem',  // 4px
  MD: '0.375rem',   // 6px
  LG: '0.5rem',     // 8px
  XL: '0.75rem',    // 12px
  '2XL': '1rem',    // 16px
  '3XL': '1.5rem',  // 24px
  FULL: '9999px',
} as const;

export const UI_ANIMATIONS = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },
  EASING: {
    LINEAR: 'linear',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  TRANSITIONS: {
    FADE: 'opacity 300ms ease-in-out',
    SLIDE: 'transform 300ms ease-in-out',
    SCALE: 'transform 300ms ease-in-out',
    COLOR: 'color 300ms ease-in-out, background-color 300ms ease-in-out',
  },
} as const;

export const UI_Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const UI_COMPONENT_SIZES = {
  BUTTON: {
    SM: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      height: '2rem',
    },
    MD: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      height: '2.5rem',
    },
    LG: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      height: '3rem',
    },
  },
  INPUT: {
    SM: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      height: '2rem',
    },
    MD: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      height: '2.5rem',
    },
    LG: {
      padding: '1rem 1.25rem',
      fontSize: '1.125rem',
      height: '3rem',
    },
  },
  CARD: {
    SM: {
      padding: '1rem',
      borderRadius: '0.375rem',
    },
    MD: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
    },
    LG: {
      padding: '2rem',
      borderRadius: '0.75rem',
    },
  },
} as const;

export const UI_LAYOUT = {
  CONTAINER_MAX_WIDTH: '1280px',
  CONTENT_MAX_WIDTH: '1024px',
  SIDEBAR_WIDTH: '256px',
  HEADER_HEIGHT: '64px',
  FOOTER_HEIGHT: '200px',
} as const;

export const UI_GRID = {
  COLUMNS: 12,
  GUTTER: '1rem',
  BREAKPOINTS: {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
    XXL: 1400,
  },
} as const;
