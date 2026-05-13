export const Theme = {
  colors: {
    background: '#0a0a0a',
    card: '#1a1a1a',
    primary: '#ef4444', // Red
    secondary: '#3b82f6', // Blue
    accent: '#10b981', // Green
    text: '#ffffff',
    textMuted: '#a0a0a0',
    border: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.05)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      color: '#a0a0a0',
    }
  }
};
