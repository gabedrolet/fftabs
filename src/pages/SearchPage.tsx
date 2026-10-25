import { Link } from '../components/Link';
import { PartButtons } from '../components/PartButtons';
import { findAlbum, fold, useCatalog } from '../lib/catalog';
import { useTitle } from '../lib/hooks';

export function SearchPage({ q }: { q: string }) {
  const index = useCatalog();
  useTitle('Search');
  const f = fold(q);
  if (!f) {
    return (
      <>
        <h1>Search</h1>
        <p class="muted">Type a song or album name in the search box.</p>
      </>
    );
  }
  const albums = index.albums.filter((a) => fold(a.title).includes(f));
  const songs = index.search.filter((s) => fold(s[0]).includes(f));

  return (
    <>
      <h1>Search</h1>
      {albums.length > 0 && (
        <>
          <h2>Albums</h2>
          <ul class="song-list">
            {albums.map((a) => (
              <li key={a.id}>
                <Link to={{ name: 'album', id: a.id }}>{a.title}</Link>
                {a.year && <span class="muted"> {a.year}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      <h2>
        Songs <span class="muted">{songs.length}</span>
      </h2>
      {songs.length === 0 ? (
        <p class="muted">No songs match “{q}”.</p>
      ) : (
        <table class="tracks">
          <tbody>
            {songs.map(([title, albumId, trackId, parts]) => (
              <tr key={albumId + '/' + trackId}>
                <td>
                  <Link to={{ name: 'song', albumId, trackId, part: parts[0] }}>{title}</Link>{' '}
                  <span class="note">{findAlbum(index, albumId)?.title}</span>
                </td>
                <td class="links">
                  <PartButtons albumId={albumId} trackId={trackId} available={parts} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
