import { useEffect, useState } from 'preact/hooks';
import type { AsyncState } from './hooks';

/**
 * Tiny resource cache shared by the browser and the build-time prerender.
 * A resource that is already loaded renders synchronously, which is what lets
 * the prerendered HTML contain the real page and the browser take over without
 * flashing "Loading…".
 */
const resolved = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

export function peek<T>(key: string): T | undefined {
  return resolved.get(key) as T | undefined;
}

export function load<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (resolved.has(key)) return Promise.resolve(resolved.get(key) as T);
  let p = pending.get(key) as Promise<T> | undefined;
  if (!p) {
    p = fetcher().then(
      (value) => {
        resolved.set(key, value);
        pending.delete(key);
        return value;
      },
      (err: unknown) => {
        pending.delete(key);
        throw err;
      },
    );
    pending.set(key, p);
  }
  return p;
}

/** Like useAsync, but starts as "ok" when the resource is already in the cache. */
export function useResource<T>(key: string, fetcher: () => Promise<T>): AsyncState<T> {
  const initial = (): AsyncState<T> => {
    const v = peek<T>(key);
    return v !== undefined ? { status: 'ok', value: v } : { status: 'loading' };
  };
  const [state, setState] = useState<AsyncState<T>>(initial);
  useEffect(() => {
    let alive = true;
    const now = initial();
    setState(now);
    if (now.status === 'loading') {
      load(key, fetcher).then(
        (value) => alive && setState({ status: 'ok', value }),
        (err: unknown) => alive && setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) }),
      );
    }
    return () => {
      alive = false;
    };
    // the key fully identifies the resource
  }, [key]);
  return state;
}
