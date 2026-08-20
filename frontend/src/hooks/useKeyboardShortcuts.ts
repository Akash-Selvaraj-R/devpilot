import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onCommandPalette?: () => void;
  onRunAction?: () => void;
  onRunTests?: () => void;
  onClose?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'k':
          e.preventDefault();
          shortcuts.onCommandPalette?.();
          break;
        case 'Enter':
          e.preventDefault();
          shortcuts.onRunAction?.();
          break;
        case 'T':
          if (e.shiftKey) {
            e.preventDefault();
            shortcuts.onRunTests?.();
          }
          break;
      }
    }

    if (e.key === 'Escape') {
      shortcuts.onClose?.();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
