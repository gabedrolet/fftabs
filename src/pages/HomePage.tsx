import { AlbumCard } from '../components/AlbumCard';
import { useCatalog } from '../lib/catalog';
import { useTitle } from '../lib/hooks';
import { groupAlbums } from '../lib/groups';

export function HomePage() {
  const index = useCatalog();
  useTitle(undefined);
  const total = (key: 'guitar' | 'bass' | 'drums' | 'lyrics') =>
    index.albums.reduce((n, a) => n + a.counts[key], 0);

  return (
    <>
      <h1>Foo Fighters tabs archive</h1>
      <p class="muted">
        {total('guitar')} guitar, {total('bass')} bass and {total('drums')} drums tabs, plus lyrics for{' '}
        {total('lyrics')} songs. Browse by album, or pick an instrument above.
      </p>
      {groupAlbums(index.albums).map((g) => {
        const albums = g.albums;
        return (
          <section key={g.title}>
            <h2>{g.title}</h2>
            <div class="grid">
              {albums.map((a) => (
                <AlbumCard key={a.id} album={a} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
