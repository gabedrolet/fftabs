import { Breadcrumbs } from '../components/Breadcrumbs';
import { TextViewer } from '../components/TextViewer';
import { findAlbum, useCatalog } from '../lib/catalog';
import { useTitle } from '../lib/hooks';
import { NotFoundPage } from './NotFoundPage';

/** Full-album lyrics sheet (lyrics/<album>.txt). */
export function SheetPage({ id }: { id: string }) {
  const album = findAlbum(useCatalog(), id);
  useTitle(album ? `${album.title} · Lyrics` : undefined);
  if (!album?.lyricsSheet) return <NotFoundPage />;
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Albums', to: { name: 'home' } },
          { label: album.title, to: { name: 'album', id } },
          { label: 'Lyrics sheet' },
        ]}
      />
      <h1>{album.title}: lyrics</h1>
      <TextViewer url={album.lyricsSheet} kind="lyrics" title={album.title} />
    </>
  );
}
