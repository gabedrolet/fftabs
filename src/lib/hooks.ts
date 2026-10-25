import { useEffect, useState } from 'preact/hooks';
import type { Inputs } from 'preact/hooks';
import { describe } from './meta';
import { currentRoute } from './router';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ok'; value: T }
  | { status: 'error'; error: Error };

/** Run a promise-returning function whenever `deps` change; ignores stale results. */
export function useAsync<T>(fn: () => Promise<T>, deps: Inputs): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    fn().then(
      (value) => alive && setState({ status: 'ok', value }),
      (err: unknown) => alive && setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) }),
    );
    return () => {
      alive = false;
    };
  }, deps);
  return state;
}

/**
 * Sets the browser tab title for the current page, the same title the prerender puts in
 * the HTML (see lib/meta.ts). `key` is any value that changes when the page changes.
 */
export function useTitle(key: string | undefined): void {
  useEffect(() => {
    document.title = describe(currentRoute()).title;
  }, [key, typeof location === 'undefined' ? '' : location.pathname + location.search]);
}

/** A number remembered in localStorage (falls back to memory if storage is blocked). */
export function useStoredNumber(key: string, fallback: number): [number, (n: number) => void] {
  const [value, setValue] = useState<number>(() => {
    try {
      const n = Number(localStorage.getItem(key));
      return Number.isFinite(n) && n > 0 ? n : fallback;
    } catch {
      return fallback;
    }
  });
  const set = (n: number) => {
    setValue(n);
    try {
      localStorage.setItem(key, String(n));
    } catch {
      /* storage unavailable */
    }
  };
  return [value, set];
}
