interface ColorShades {
  DEFAULT: string;
  [shade: string]: string;
}

interface ThemeColors {
  [key: string]: ColorShades;
}

interface ThemeConfig {
  colors: ThemeColors;
  fonts: {
    [key: string]: string;
  };
  spacing: {
    [key: string]: string;
  };
  breakpoints: {
    [key: string]: string;
  };
  radii: {
    [key: string]: string;
  };
  shadows: {
    [key: string]: string;
  };
}

export function createTheme(config: ThemeConfig): ThemeConfig {
  return {
    colors: config.colors,
    fonts: config.fonts,
    spacing: config.spacing,
    breakpoints: config.breakpoints,
    radii: config.radii,
    shadows: config.shadows,
  };
}
