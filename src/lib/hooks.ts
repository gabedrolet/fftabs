import { useEffect, useState } from 'preact/hooks';
import type { Inputs } from 'preact/hooks';

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

export function useTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · fftabs` : 'fftabs: Foo Fighters tabs archive';
  }, [title]);
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
