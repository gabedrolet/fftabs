import { Cover } from '../components/AlbumCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link } from '../components/Link';
import { PartIcon } from '../components/PartIcon';
import { useCatalog } from '../lib/catalog';
import { groupAlbums } from '../lib/groups';
import { useTitle } from '../lib/hooks';
import { PART_LABEL } from '../lib/types';
import type { AlbumSummary, Part, SearchEntry } from '../lib/types';

interface Section {
  album: AlbumSummary;
  songs: SearchEntry[];
  sheet?: string;
}

const sectionId = (albumId: string) => `album-${albumId}`;

/** Every song that has `part`, grouped by album. Uses only data/index.json. */
export function InstrumentPage({ part }: { part: Part }) {
  const index = useCatalog();
  useTitle(PART_LABEL[part]);

  const byAlbum = new Map<string, SearchEntry[]>();
  for (const s of index.search) {
    if (!s[3].includes(part)) continue;
    byAlbum.set(s[1], [...(byAlbum.get(s[1]) ?? []), s]);
  }
  const sections: Section[] = index.albums
    .map((album) => ({
      album,
      songs: byAlbum.get(album.id) ?? [],
      sheet: part === 'lyrics' ? album.lyricsSheet : undefined,
    }))
    .filter((s) => s.songs.length > 0 || s.sheet);
  const total = sections.reduce((n, s) => n + s.songs.length, 0);
  const groups = groupAlbums(sections.map((s) => s.album)).map((g) => ({
    title: g.title,
    sections: g.albums.map((a) => sections.find((s) => s.album === a)!),
  }));

  const jump = (albumId: string) =>
    document.getElementById(sectionId(albumId))?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <Breadcrumbs items={[{ label: 'Albums', to: { name: 'home' } }, { label: PART_LABEL[part] }]} />
      <h1 class="with-ico">
        <PartIcon part={part} />
        {PART_LABEL[part]}
        {part === 'lyrics' ? '' : ' tabs'}
      </h1>
      <p class="muted">
        {total} {part === 'lyrics' ? 'songs' : 'tabs'} across {sections.length} albums and collections.
      </p>

      <nav class="jump" aria-label="Jump to album">
        {sections.map(({ album }) => (
          <button type="button" key={album.id} onClick={() => jump(album.id)} title={album.title}>
            {album.kind === 'studio' || album.kind === 'live' || album.kind === 'compilation' ? album.year : album.title}
          </button>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.title}>
          <h2 class="group-title">{g.title}</h2>
          {g.sections.map(({ album, songs, sheet }) => (
            <article class="album-section" id={sectionId(album.id)} key={album.id}>
              <header class="album-section-head">
                <Cover album={album} />
                <div class="album-section-title">
                  <Link to={songs.length ? { name: 'album', id: album.id, part } : { name: 'album', id: album.id }}>
                    {album.title}
                  </Link>
                  <span class="muted">
                    {[album.year, songs.length && `${songs.length} ${part === 'lyrics' ? 'songs' : 'tabs'}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
              </header>
              <ul class="song-list">
                {songs.map(([title, albumId, trackId]) => (
                  <li key={trackId}>
                    <Link class="track-link" to={{ name: 'song', albumId, trackId, part }}>
                      {title}
                    </Link>
                  </li>
                ))}
                {sheet && (
                  <li>
                    <Link class="track-link sheet-link" to={{ name: 'sheet', id: album.id }}>
                      Full lyrics sheet
                    </Link>
                  </li>
                )}
              </ul>
            </article>
          ))}
        </section>
      ))}
    </>
  );
}
