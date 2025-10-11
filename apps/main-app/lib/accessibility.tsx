import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
/* eslint-disable react-refresh/only-export-components */

/**
 * Accessibility utilities for Azora OS
 * Implements WCAG 2.1 AA compliance features
 */

// Skip link component for keyboard navigation
export const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
  >
    Skip to main content
  </a>
);

// Hook for managing focus
export const useFocusManagement = () => {
  const focusRef = useRef<HTMLElement>(null);

  const setFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  const setInitialFocus = () => {
    // Set focus to first focusable element or skip link target
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      const firstFocusable = mainContent.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        mainContent.focus();
      }
    }
  };

  return { focusRef, setFocus, setInitialFocus };
};

// Hook for managing ARIA live regions
export const useAriaLive = (priority: 'polite' | 'assertive' = 'polite') => {
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  };

  return {
    liveRef,
    announce,
    LiveRegion: () => (
      <div
        ref={liveRef}
        aria-live={priority}
        aria-atomic="true"
        className="sr-only"
      />
    ),
  };
};

// Hook for managing keyboard navigation
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        onEnter?.();
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Utility for generating unique IDs
let idCounter = 0;
export const generateId = (prefix = 'azora') => `${prefix}-${++idCounter}`;

// Hook for managing ARIA attributes
export const useAriaAttributes = (labelledBy?: string, describedBy?: string) => {
  const id = useMemo(() => generateId(), []);

  return {
    id,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  };
};

// Focus trap utility for modals and dialogs
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  const getFocusableElements = () => {
    if (!containerRef.current) return [];
  return containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  };

  const handleTabKey = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleTabKey);
      // Focus first element when trap becomes active
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [handleTabKey, isActive]);

  return containerRef;
};

// Screen reader utility functions
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const parseColor = (color: string) => {
    const normalized = color.replace('#', '');
    const bigint = Number.parseInt(normalized.padEnd(6, '0'), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b].map(channel => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
  };

  const getLuminance = (color: string) => {
    const [r, g, b] = parseColor(color);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// High contrast mode detection
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-contrast: high)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};