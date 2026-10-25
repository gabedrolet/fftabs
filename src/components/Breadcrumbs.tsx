import { Fragment } from 'preact';
import { Link } from './Link';
import type { Route } from '../lib/router';

export interface Crumb {
  label: string;
  to?: Route;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav class="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && ' / '}
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
