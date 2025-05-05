export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 56;
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const TRANSITIONS = {
  FAST: '100ms',
  DEFAULT: '200ms',
  SLOW: '300ms',
} as const;

export const Z_INDEXES = {
  HEADER: 40,
  SIDEBAR: 30,
  MODAL: 50,
  TOOLTIP: 60,
  DROPDOWN: 20,
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: 'b',
  TOGGLE_THEME: 't',
  FOCUS_SEARCH: '/',
} as const;
