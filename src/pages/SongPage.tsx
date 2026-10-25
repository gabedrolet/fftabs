import { useEffect } from 'preact/hooks';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link, Pill } from '../components/Link';
import { PartIcon } from '../components/PartIcon';
import { Async } from '../components/Status';
import { TextViewer } from '../components/TextViewer';
import { filesOf, loadAlbum, partsOfTrack } from '../lib/api';
import { useCatalog } from '../lib/catalog';
import { useAsync, useTitle } from '../lib/hooks';
import { navigate } from '../lib/router';
import type { Route } from '../lib/router';
import { PARTS, PART_LABEL } from '../lib/types';
import type { LoadedAlbum, Part } from '../lib/types';
import { NotFoundPage } from './NotFoundPage';

interface Props {
  albumId: string;
  trackId: string;
  part?: Part;
  version?: number;
}

export function SongPage(props: Props) {
  const index = useCatalog();
  const state = useAsync(() => loadAlbum(index, props.albumId), [index, props.albumId]);
  return <Async state={state}>{(data) => <SongView data={data} {...props} />}</Async>;
}

function SongView({ data, trackId, part: wanted, version }: Props & { data: LoadedAlbum }) {
  const { album } = data;
  const track = album.tracks.find((t) => t.id === trackId);
  const have = track ? partsOfTrack(data, track.id) : [];
  const part = wanted && have.includes(wanted) ? wanted : have[0];
  const files = part && track ? filesOf(data.parts[part]?.[track.id]) : [];
  const vi = Math.min(Math.max(version ?? 1, 1), files.length || 1) - 1;
  const file = files[vi];

  // prev / next track that has the same part
  const seq = part ? album.tracks.filter((t) => data.parts[part]?.[t.id] !== undefined) : [];
  const pos = track ? seq.indexOf(track) : -1;
  const prev = pos > 0 ? seq[pos - 1] : undefined;
  const next = pos >= 0 ? seq[pos + 1] : undefined;
  const songRoute = (id: string): Route => ({ name: 'song', albumId: album.id, trackId: id, part });

  useTitle(track && part ? `${track.title} · ${PART_LABEL[part]}` : undefined);

  // ← / → keys move to the previous / next song
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft' && prev) navigate(songRoute(prev.id));
      if (e.key === 'ArrowRight' && next) navigate(songRoute(next.id));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!track || !part || !file) return <NotFoundPage />;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Albums', to: { name: 'home' } },
          { label: album.title, to: { name: 'album', id: album.id } },
          { label: PART_LABEL[part], to: { name: 'album', id: album.id, part } },
        ]}
      />
      <h1>
        {track.title}
        {track.note && <span class="note"> ({track.note})</span>}
      </h1>

      <div class="filters">
        {PARTS.map((p) => (
          <Pill key={p} to={{ name: 'song', albumId: album.id, trackId: track.id, part: p }} active={p === part} disabled={!have.includes(p)}>
            <PartIcon part={p} />
            {PART_LABEL[p]}
          </Pill>
        ))}
      </div>

      {files.length > 1 && (
        <div class="filters">
          {files.map((f, i) => (
            <Pill key={f} to={{ name: 'song', albumId: album.id, trackId: track.id, part, version: i + 1 }} active={i === vi}>
              Version {i + 1} <span class="muted">{f.split('.').pop()?.toUpperCase()}</span>
            </Pill>
          ))}
        </div>
      )}

      <TextViewer key={file} url={file} kind={part === 'lyrics' ? 'lyrics' : 'tab'} title={track.title} />

      <nav class="pager" aria-label="Song navigation">
        <span class="pager-prev">{prev && <Link to={songRoute(prev.id)}>← {prev.title}</Link>}</span>
        <Link class="pager-back" to={{ name: 'album', id: album.id, part }}>
          Back to {album.title}
        </Link>
        <span class="pager-next">{next && <Link to={songRoute(next.id)}>{next.title} →</Link>}</span>
      </nav>
    </>
  );
}
