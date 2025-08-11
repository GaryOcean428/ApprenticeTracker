export type ThemeConfig = {
  colors: Record<string, string>;
  fontFamily: Record<string, string[]>;
};

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#0055A4',
    secondary: '#8D9192',
    accent: '#FF9F1C',
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  },
};

export function createTheme(overrides: Partial<ThemeConfig> = {}): ThemeConfig {
  return {
    colors: { ...defaultTheme.colors, ...overrides.colors },
    fontFamily: { ...defaultTheme.fontFamily, ...overrides.fontFamily },
  };
}

export const theme = createTheme();
