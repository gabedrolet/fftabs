import { render } from 'preact';
import { App } from './App';
import { preloadRoute } from './lib/preload';
import { currentRoute, href, parseLegacyHash } from './lib/router';
import './styles.css';

async function boot() {
  // old "#/album/1997" links → "/album/1997/"
  const legacy = parseLegacyHash(location.hash);
  if (legacy) history.replaceState(null, '', href(legacy));

  // load this page's data first, so the app replaces the prerendered HTML with identical content
  try {
    await preloadRoute(currentRoute());
  } catch {
    /* the page shows its own error message */
  }
  const root = document.getElementById('root')!;
  root.textContent = '';
  render(<App />, root);
}

boot();
