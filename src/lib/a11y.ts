import type { KeyboardEvent } from 'react';

/**
 * Props to spread onto an <a> used for internal navigation (onClick, no href).
 * Without this, the link is unreachable by Tab and Enter/Space do nothing —
 * fails keyboard nav for screen-reader and keyboard-only users.
 */
export function clickableLink(onActivate: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
