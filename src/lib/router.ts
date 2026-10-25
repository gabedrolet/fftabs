import { useEffect, useState } from 'preact/hooks';
import { isPart } from './types';
import type { Part } from './types';

/** Every page of the site. Hash-based so it works on GitHub Pages without server config. */
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

export function parseHash(hash: string): Route {
  const seg = hash.replace(/^#\/?/, '').split('/').map(decode);
  const [head = '', a, b, c, d] = seg;
  switch (head) {
    case '':
      return { name: 'home' };
    case 'album':
      return a ? { name: 'album', id: a, part: isPart(b) ? b : undefined } : { name: 'notFound' };
    case 'instrument':
      return isPart(a) ? { name: 'instrument', part: a } : { name: 'notFound' };
    case 'song':
      return a && b
        ? { name: 'song', albumId: a, trackId: b, part: isPart(c) ? c : undefined, version: d ? Number(d) || undefined : undefined }
        : { name: 'notFound' };
    case 'sheet':
      return a ? { name: 'sheet', id: a } : { name: 'notFound' };
    case 'search':
      return { name: 'search', q: seg.slice(1).join('/') };
    case 'legal':
      return { name: 'legal' };
    default:
      return { name: 'notFound' };
  }
}

const e = encodeURIComponent;

/** Build the URL for a route, so links are type-checked. */
export function href(r: Route): string {
  switch (r.name) {
    case 'home':
      return '#/';
    case 'album':
      return `#/album/${e(r.id)}${r.part ? '/' + r.part : ''}`;
    case 'instrument':
      return `#/instrument/${r.part}`;
    case 'song':
      return `#/song/${e(r.albumId)}/${e(r.trackId)}${r.part ? '/' + r.part : ''}${r.version && r.version > 1 ? '/' + r.version : ''}`;
    case 'sheet':
      return `#/sheet/${e(r.id)}`;
    case 'search':
      return `#/search/${e(r.q)}`;
    case 'legal':
      return '#/legal';
    case 'notFound':
      return '#/404';
  }
}

const NAV_EVENT = 'fftabs:navigate';

export function navigate(r: Route, opts: { replace?: boolean } = {}): void {
  const url = href(r);
  if (opts.replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  window.dispatchEvent(new Event(NAV_EVENT));
}

/** Current route; re-renders on hash changes, back/forward and navigate(). */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  useEffect(() => {
    const update = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    window.addEventListener(NAV_EVENT, update);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
      window.removeEventListener(NAV_EVENT, update);
    };
  }, []);
  return route;
}
