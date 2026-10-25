import { useEffect, useState } from 'preact/hooks';
import { BASE } from './paths';
import { isPart } from './types';
import type { Part } from './types';

/**
 * Every page of the site, with real addresses such as /album/1997/ or
 * /song/1997/everlong/guitar/. Each one is prerendered to its own index.html
 * at build time (see src/prerender.ts and data/routes.json).
 */
export type Route =
  | { name: 'home' }
  | { name: 'album'; id: string; part?: Part }
  | { name: 'instrument'; part: Part }
  | { name: 'song'; albumId: string; trackId: string; part?: Part; version?: number }
  | { name: 'sheet'; id: string }
  | { name: 'search'; q: string }
  | { name: 'legal' }
  | { name: 'notFound' };

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Route for a path inside the site ("/album/1997/", with or without BASE) plus its query string. */
export function parsePath(path: string, search = ''): Route {
  let p = path.startsWith(BASE) ? path.slice(BASE.length) : path.replace(/^\/+/, '');
  p = p.replace(/index\.html$/, '');
  const seg = p.split('/').filter(Boolean).map(decode);
  const [head = '', a, b, c, d] = seg;
  switch (head) {
    case '':
      return { name: 'home' };
    case 'album':
      return a && seg.length <= 3 ? { name: 'album', id: a, part: isPart(b) ? b : undefined } : { name: 'notFound' };
    case 'instrument':
      return isPart(a) ? { name: 'instrument', part: a } : { name: 'notFound' };
    case 'song':
      return a && b
        ? { name: 'song', albumId: a, trackId: b, part: isPart(c) ? c : undefined, version: d ? Number(d) || undefined : undefined }
        : { name: 'notFound' };
    case 'sheet':
      return a ? { name: 'sheet', id: a } : { name: 'notFound' };
    case 'search':
      return { name: 'search', q: new URLSearchParams(search).get('q') ?? '' };
    case 'legal':
      return { name: 'legal' };
    default:
      return { name: 'notFound' };
  }
}

/** Old "#/album/1997" addresses (before real page addresses) → the same page today. */
export function parseLegacyHash(hash: string): Route | null {
  if (!hash.startsWith('#/')) return null;
  const seg = hash.slice(2).split('/');
  if (seg[0] === 'search') return { name: 'search', q: decode(seg.slice(1).join('/')) };
  return parsePath('/' + seg.join('/'));
}

const e = encodeURIComponent;

/** Build the address of a route, so links are type-checked. Always ends with "/" (one folder per page). */
export function href(r: Route): string {
  switch (r.name) {
    case 'home':
      return BASE;
    case 'album':
      return `${BASE}album/${e(r.id)}/${r.part ? r.part + '/' : ''}`;
    case 'instrument':
      return `${BASE}instrument/${r.part}/`;
    case 'song':
      return `${BASE}song/${e(r.albumId)}/${e(r.trackId)}/${r.part ? r.part + '/' : ''}${r.version && r.version > 1 ? r.version + '/' : ''}`;
    case 'sheet':
      return `${BASE}sheet/${e(r.id)}/`;
    case 'search':
      return `${BASE}search/${r.q ? '?q=' + e(r.q) : ''}`;
    case 'legal':
      return `${BASE}legal/`;
    case 'notFound':
      return BASE;
  }
}

const NAV_EVENT = 'fftabs:navigate';

export function navigate(r: Route, opts: { replace?: boolean } = {}): void {
  const url = href(r);
  if (opts.replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function currentRoute(): Route {
  return parsePath(location.pathname, location.search);
}

/** Current route; re-renders on navigate() and back/forward. `initial` is used when prerendering. */
export function useRoute(initial?: Route): Route {
  const [route, setRoute] = useState<Route>(() => initial ?? currentRoute());
  useEffect(() => {
    const update = () => setRoute(currentRoute());
    window.addEventListener('popstate', update);
    window.addEventListener(NAV_EVENT, update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAV_EVENT, update);
    };
  }, []);
  return route;
}
