import type { JSX } from 'preact';
import type { Part } from '../lib/types';

/** 24×24 stroked icons; they use currentColor so they follow the theme. */
const PATHS: Record<Part, JSX.Element> = {
  // electric guitar: double cutaway, three pickups
  guitar: (
    <g transform="rotate(42 12 12)">
      <path d="M12 12.4V2.6" />
      <path d="M11 1h2.2l-.2 2.6h-1.8z" />
      <path d="M10.6 12.2c-.8-1.6-2.8-2.2-3.4-.9-.6 1.3.9 2.6.6 4.1-.4 1.8-2 3-1.2 5.1.7 1.8 3 2.6 5.4 2.6s4.7-.8 5.4-2.6c.8-2.1-.8-3.3-1.2-5.1-.3-1.5 1.4-2.9.8-4.4-.6-1.4-2.8-.8-3.6.8z" />
      <path d="M10.3 15.6h3.4M10.3 18h3.4" />
      <path d="M10.6 20.4h2.8" />
    </g>
  ),
  // electric bass: long neck, four tuners on one side
  bass: (
    <g transform="rotate(42 12 12)">
      <path d="M12 13V-.6" />
      <path d="M12 -.6h1.6M12 1.3h1.6M12 3.2h1.6M12 5.1h1.6" />
      <path d="M10.8 13.2c-.5-1.9-2.2-3.1-3.1-2.2-.8.8.5 2.5.3 4.2-.2 1.7-1.7 2.8-1.2 4.9.5 1.8 2.7 2.7 5.1 2.7s4.6-.9 5.1-2.7c.5-2.1-1-3.2-1.2-4.9-.1-1.3.7-2.3.2-2.9-.6-.7-2.6.1-3.1.9" />
      <path d="M10.3 16.6h2M11.7 17.8h2" />
    </g>
  ),
  drums: (
    <>
      <ellipse cx="12" cy="11" rx="8.5" ry="3" />
      <path d="M3.5 11v6c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-6" />
      <path d="M7 13.8v5.4M12 14v6M17 13.8v5.4" />
      <path d="M6 2.5l5 7M18 2.5l-5 7" />
    </>
  ),
  lyrics: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21M8.5 21h7" />
    </>
  ),
};

export function PartIcon({ part }: { part: Part }) {
  return (
    <svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {PATHS[part]}
    </svg>
  );
}
