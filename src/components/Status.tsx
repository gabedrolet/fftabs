import type { ComponentChildren, VNode } from 'preact';
import type { AsyncState } from '../lib/hooks';
import { Link } from './Link';

export function Loading() {
  return <p class="muted">Loading…</p>;
}

export function ErrorMessage({ error }: { error: Error }) {
  return (
    <>
      <h1>Something went wrong</h1>
      <p class="error">{error.message}</p>
      <p>
        <Link to={{ name: 'home' }}>Back to albums</Link>
      </p>
    </>
  );
}

/** Renders loading / error states, and `children(value)` once loaded. */
export function Async<T>({ state, children }: { state: AsyncState<T>; children: (value: T) => VNode | ComponentChildren }) {
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorMessage error={state.error} />;
  return <>{children(state.value)}</>;
}
