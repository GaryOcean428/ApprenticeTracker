import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KEYBOARD_SHORTCUTS } from '@/config/shortcuts';
import { CORE_SECTIONS } from '@/config/navigation-config';
import { useToast } from '@/components/ui/use-toast';

interface UseKeyboardNavigationProps {
  onToggleMenu: () => void;
  onFocusSearch?: () => void;
}

export function useKeyboardNavigation({ onToggleMenu, onFocusSearch }: UseKeyboardNavigationProps) {
  const router = useRouter();
  const { toast } = useToast();

  const showShortcutToast = useCallback((shortcut: string, action: string) => {
    toast({
      title: 'Keyboard Shortcut',
      description: `${shortcut.toUpperCase()}: ${action}`,
    });
  }, [toast]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = e.key.toLowerCase();
    const { NAVIGATION, SECTIONS } = KEYBOARD_SHORTCUTS;

    // Handle modifier key combinations
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const sectionKeys = Object.values(SECTIONS);
      const sectionIndex = sectionKeys.findIndex(k => k === key);
      
      if (sectionIndex !== -1) {
        e.preventDefault();
        const section = CORE_SECTIONS[sectionIndex];
        if (section) {
          router.push(`/${section.id}`);
          showShortcutToast(`Alt+${key}`, `Navigate to ${section.title}`);
        }
      }
      return;
    }

    // Handle single key shortcuts
    switch (key) {
      case NAVIGATION.TOGGLE_MENU:
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onToggleMenu();
          showShortcutToast(key, 'Toggle Menu');
        }
        break;

      case NAVIGATION.FOCUS_SEARCH:
        if (!e.ctrlKey && !e.metaKey && onFocusSearch) {
          e.preventDefault();
          onFocusSearch();
          showShortcutToast(key, 'Focus Search');
        }
        break;

      case NAVIGATION.GO_HOME:
        if (e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          router.push('/');
          showShortcutToast('Ctrl+H', 'Go Home');
        }
        break;

      case NAVIGATION.QUICK_NAV:
        if (e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          showShortcutToast('Ctrl+G', 'Quick Navigation');
        }
        break;
    }
  }, [router, onToggleMenu, onFocusSearch, showShortcutToast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}
