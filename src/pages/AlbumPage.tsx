import { Fragment } from 'preact';
import { Cover } from '../components/AlbumCard';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link, Pill } from '../components/Link';
import { PartIcon } from '../components/PartIcon';
import { Async } from '../components/Status';
import { TrackTable } from '../components/TrackTable';
import { albumKey, loadAlbum } from '../lib/api';
import { useCatalog } from '../lib/catalog';
import { useTitle } from '../lib/hooks';
import { useResource } from '../lib/store';
import { PARTS, PART_LABEL } from '../lib/types';
import type { LoadedAlbum, Part } from '../lib/types';

export function AlbumPage({ id, part }: { id: string; part?: Part }) {
  const index = useCatalog();
  const state = useResource(albumKey(id), () => loadAlbum(index, id));
  return <Async state={state}>{(data) => <AlbumView data={data} part={part} />}</Async>;
}

function AlbumView({ data, part }: { data: LoadedAlbum; part?: Part }) {
  const { album, summary } = data;
  useTitle(album.title + (part ? ` · ${PART_LABEL[part]}` : ''));

  const facts = [
    album.year,
    album.released && `Released ${album.released}`,
    album.label,
    album.billboard && `US Billboard peak ${album.billboard}`,
  ].filter(Boolean);
  const visible = album.tracks.filter((t) => !part || data.parts[part]?.[t.id] !== undefined);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Albums', to: { name: 'home' } }, { label: album.title }]} />
      <div class="album-head">
        <Cover album={album} />
        <div class="meta">
          <h1>{album.title}</h1>
          <div class="facts">
            {facts.map((f) => (
              <span key={String(f)}>{f}</span>
            ))}
          </div>
          {album.description && (
            <p class="description">
              {album.description.split(/\n\s*/).map((line, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </p>
          )}
          {album.lyricsSheet && (
            <p>
              <Link to={{ name: 'sheet', id: album.id }}>Full album lyrics sheet</Link>
            </p>
          )}
        </div>
      </div>

      <div class="filters">
        <Pill to={{ name: 'album', id: album.id }} active={!part}>
          All
        </Pill>
        {PARTS.map((p) => (
          <Pill key={p} to={{ name: 'album', id: album.id, part: p }} active={part === p} disabled={!summary.counts[p]}>
            <PartIcon part={p} />
            {PART_LABEL[p]} <span class="muted">{summary.counts[p]}</span>
          </Pill>
        ))}
      </div>

      {visible.length ? (
        <TrackTable data={data} part={part} />
      ) : (
        <p class="muted">
          {album.tracks.length
            ? `No ${part ? PART_LABEL[part].toLowerCase() : 'tabs'} for this album yet.`
            : 'No individual songs listed. See the full lyrics sheet.'}
        </p>
      )}
    </>
  );
}
