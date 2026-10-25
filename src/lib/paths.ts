/** Site root ('/' on fftabs.com). Set by `base` in vite.config.ts. */
export const BASE: string = import.meta.env.BASE_URL;

/** Absolute URL for a content file such as "tabs_guitar/1997/Everlong.txt" or "images/cover_1997.jpg". */
export function asset(path: string): string {
  return BASE + path.replace(/^\/+/, '');
}
