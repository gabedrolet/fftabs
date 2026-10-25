import { useTheme } from '../lib/theme';
import type { Theme } from '../lib/theme';
import type { JSX } from 'preact';

const LABEL: Record<Theme, string> = {
  auto: 'Theme: automatic (follows your system)',
  light: 'Theme: light',
  dark: 'Theme: dark',
};
const NEXT: Record<Theme, string> = { auto: 'light', light: 'dark', dark: 'automatic' };

const ICONS: Record<Theme, JSX.Element> = {
  // half-filled circle = automatic
  auto: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
};

/** Header button: cycles Auto → Light → Dark and remembers the choice. */
export function ThemeToggle() {
  const [theme, cycle] = useTheme();
  return (
    <button
      type="button"
      class="theme-toggle"
      onClick={cycle}
      title={`${LABEL[theme]}. Click for ${NEXT[theme]}.`}
      aria-label={`${LABEL[theme]}. Switch to ${NEXT[theme]}.`}
    >
      <svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {ICONS[theme]}
      </svg>
    </button>
  );
}
