import { useEffect, useRef, useState } from 'preact/hooks';
import { asset } from '../lib/paths';
import { navigate } from '../lib/router';
import type { Route } from '../lib/router';
import { PARTS, PART_LABEL } from '../lib/types';
import type { Part } from '../lib/types';
import { Link } from './Link';
import { PartIcon } from './PartIcon';
import { ThemeToggle } from './ThemeToggle';

/** Which top-menu entry is highlighted for a route */
function activeNav(r: Route): 'home' | Part | null {
  switch (r.name) {
    case 'home':
      return 'home';
    case 'instrument':
      return r.part;
    case 'album':
      return r.part ?? 'home';
    case 'song':
      return r.part ?? null;
    default:
      return null;
  }
}

export function Header({ route }: { route: Route }) {
  const active = activeNav(route);
  return (
    <header class="site-header">
      <div class="wrap header-row">
        <Link to={{ name: 'home' }} class="brand" aria-label="fftabs home">
          <img src={asset('images/logo_fftabs_white.png')} alt="" width={63} height={44} />
        </Link>
        <nav class="main-nav" aria-label="Instruments">
          <Link to={{ name: 'home' }} class={active === 'home' ? 'active' : undefined}>
            Albums
          </Link>
          {PARTS.map((p) => (
            <Link key={p} to={{ name: 'instrument', part: p }} class={active === p ? 'active' : undefined}>
              <PartIcon part={p} />
              {PART_LABEL[p]}
            </Link>
          ))}
        </nav>
        <SearchBox route={route} />
        <ThemeToggle />
      </div>
    </header>
  );
}

function SearchBox({ route }: { route: Route }) {
  const onSearch = route.name === 'search';
  const routeQuery = onSearch ? route.q : '';
  const [value, setValue] = useState(routeQuery);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number>();

  // keep the box in sync when the route changes from elsewhere (links, back button);
  // while typing on the search page, the box is the source of truth
  useEffect(() => {
    if (!onSearch || document.activeElement !== input.current) setValue(routeQuery);
  }, [routeQuery, onSearch]);

  // "/" focuses the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const onInput = (e: Event) => {
    const q = (e.currentTarget as HTMLInputElement).value;
    setValue(q);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      navigate({ name: 'search', q: q.trim() }, { replace: onSearch });
    }, 150);
  };

  return (
    <form class="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <input
        ref={input}
        type="search"
        placeholder="Search songs…"
        autocomplete="off"
        aria-label="Search songs"
        value={value}
        onInput={onInput}
      />
    </form>
  );
}
