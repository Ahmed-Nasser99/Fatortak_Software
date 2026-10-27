
export const COLORS = {
  primary: {
    main: '#8B5CF6', // Purple 500
    light: '#A78BFA', // Purple 400
    dark: '#7C3AED', // Purple 600
    50: '#F5F3FF',
    100: '#EDE9FE',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
  secondary: {
    main: '#A855F7', // Purple 500 variant
    light: '#C084FC', // Purple 400 variant
    dark: '#9333EA', // Purple 600 variant
    50: '#FAF5FF',
    100: '#F3E8FF',
    500: '#A855F7',
    600: '#9333EA',
  },
  success: {
    main: '#10B981', // Emerald 500
    light: '#34D399', // Emerald 400
    dark: '#059669', // Emerald 600
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    main: '#F59E0B', // Amber 500
    light: '#FBBF24', // Amber 400
    dark: '#D97706', // Amber 600
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    main: '#EF4444', // Red 500
    light: '#F87171', // Red 400
    dark: '#DC2626', // Red 600
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
};

export const getIconBackground = (type: 'primary' | 'success' | 'warning' | 'error' | 'secondary' = 'primary') => {
  switch (type) {
    case 'primary':
      return `bg-gradient-to-br from-purple-500 to-purple-600`;
    case 'secondary':
      return `bg-gradient-to-br from-purple-400 to-purple-500`;
    case 'success':
      return `bg-gradient-to-br from-emerald-500 to-emerald-600`;
    case 'warning':
      return `bg-gradient-to-br from-amber-500 to-amber-600`;
    case 'error':
      return `bg-gradient-to-br from-red-500 to-red-600`;
    default:
      return `bg-gradient-to-br from-purple-500 to-purple-600`;
  }
};
