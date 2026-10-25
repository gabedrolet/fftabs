import type { ComponentChildren, JSX } from 'preact';
import { href, navigate } from '../lib/router';
import type { Route } from '../lib/router';

type AnchorProps = Omit<JSX.HTMLAttributes<HTMLAnchorElement>, 'href'>;

/** <a> whose target is a typed Route instead of a string. */
export function Link({ to, children, onClick, ...rest }: AnchorProps & { to: Route; children: ComponentChildren }) {
  // plain left clicks switch pages without a reload; ctrl/cmd/middle clicks keep opening a new tab
  const go = (e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
    if (typeof onClick === 'function') onClick(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return (
    <a href={href(to)} onClick={go} {...rest}>
      {children}
    </a>
  );
}

/** Rounded filter button; `disabled` keeps it visible but not clickable. */
export function Pill({
  to,
  active = false,
  disabled = false,
  children,
}: {
  to: Route;
  active?: boolean;
  disabled?: boolean;
  children: ComponentChildren;
}) {
  const cls = ['pill', active && 'active', disabled && 'disabled'].filter(Boolean).join(' ');
  return (
    <Link to={to} class={cls} aria-current={active ? 'page' : undefined} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined}>
      {children}
    </Link>
  );
}
