import { useState } from 'preact/hooks';

/** 'auto' follows the system setting; 'light' / 'dark' are the visitor's own choice. */
export type Theme = 'auto' | 'light' | 'dark';

const KEY = 'fftabs.theme';
const ORDER: Theme[] = ['auto', 'light', 'dark'];

export function readTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** Sets <html data-theme> (styles.css reads it) and remembers the choice. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (theme === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this page view only */
  }
}

/** Current theme and a function that cycles Auto → Light → Dark. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!;
    applyTheme(next);
    setTheme(next);
  };
  return [theme, cycle];
}
