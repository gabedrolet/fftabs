import { useEffect } from 'preact/hooks';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Async } from './components/Status';
import { loadIndex } from './lib/api';
import { CatalogContext } from './lib/catalog';
import { useAsync } from './lib/hooks';
import { useRoute } from './lib/router';
import type { Route } from './lib/router';
import { AlbumPage } from './pages/AlbumPage';
import { HomePage } from './pages/HomePage';
import { InstrumentPage } from './pages/InstrumentPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SearchPage } from './pages/SearchPage';
import { SheetPage } from './pages/SheetPage';
import { SongPage } from './pages/SongPage';

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'album':
      return <AlbumPage id={route.id} part={route.part} />;
    case 'instrument':
      return <InstrumentPage part={route.part} />;
    case 'song':
      return <SongPage albumId={route.albumId} trackId={route.trackId} part={route.part} version={route.version} />;
    case 'sheet':
      return <SheetPage id={route.id} />;
    case 'search':
      return <SearchPage q={route.q} />;
    case 'legal':
      return <LegalPage />;
    case 'notFound':
      return <NotFoundPage />;
  }
}

export function App() {
  const route = useRoute();
  const index = useAsync(loadIndex, []);

  // new page → back to the top (but not while typing a search)
  const key = route.name === 'search' ? 'search' : location.hash;
  useEffect(() => window.scrollTo(0, 0), [key]);

  return (
    <>
      <Header route={route} />
      <main class="wrap" aria-live="polite">
        <Async state={index}>
          {(idx) => (
            <CatalogContext.Provider value={idx}>
              <Page route={route} />
            </CatalogContext.Provider>
          )}
        </Async>
      </main>
      <Footer />
    </>
  );
}
