export const KEYBOARD_SHORTCUTS = {
  NAVIGATION: {
    TOGGLE_MENU: 'm',
    FOCUS_SEARCH: '/',
    NEXT_SECTION: 'ArrowDown',
    PREV_SECTION: 'ArrowUp',
    NEXT_ITEM: 'ArrowRight',
    PREV_ITEM: 'ArrowLeft',
    GO_HOME: 'h',
    QUICK_NAV: 'g',
  },
  SECTIONS: {
    APPRENTICE: '1',
    HOST: '2',
    COMPLIANCE: '3',
    FINANCE: '4',
    ANALYTICS: '5',
    ACCESS: '6',
  },
} as const;

export const SHORTCUT_DESCRIPTIONS = {
  [KEYBOARD_SHORTCUTS.NAVIGATION.TOGGLE_MENU]: 'Toggle menu',
  [KEYBOARD_SHORTCUTS.NAVIGATION.FOCUS_SEARCH]: 'Focus search',
  [KEYBOARD_SHORTCUTS.NAVIGATION.GO_HOME]: 'Go to home',
  [KEYBOARD_SHORTCUTS.NAVIGATION.QUICK_NAV]: 'Open quick navigation',
  [KEYBOARD_SHORTCUTS.SECTIONS.APPRENTICE]: 'Go to Apprentice Management',
  [KEYBOARD_SHORTCUTS.SECTIONS.HOST]: 'Go to Host Management',
  [KEYBOARD_SHORTCUTS.SECTIONS.COMPLIANCE]: 'Go to Compliance System',
  [KEYBOARD_SHORTCUTS.SECTIONS.FINANCE]: 'Go to Financial Operations',
  [KEYBOARD_SHORTCUTS.SECTIONS.ANALYTICS]: 'Go to Analytics & Reporting',
  [KEYBOARD_SHORTCUTS.SECTIONS.ACCESS]: 'Go to Access Control',
} as const;
