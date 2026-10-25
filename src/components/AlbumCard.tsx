import { PARTS, PART_LABEL } from '../lib/types';
import type { AlbumSummary } from '../lib/types';
import { Link } from './Link';
import { PartIcon } from './PartIcon';

export function Cover({ album }: { album: { title: string; cover?: string } }) {
  return album.cover ? (
    <img class="cover" src={album.cover} alt="" loading="lazy" />
  ) : (
    <div class="cover placeholder">{album.title}</div>
  );
}

export function AlbumCard({ album }: { album: AlbumSummary }) {
  const sub = [album.year, album.kind === 'live' || album.kind === 'compilation' ? album.kind : null]
    .filter(Boolean)
    .join(' · ');
  return (
    <Link to={{ name: 'album', id: album.id }} class="card">
      <Cover album={album} />
      <div class="card-body">
        <div class="card-title">{album.title}</div>
        {sub && <div class="card-year">{sub}</div>}
        <div class="chips">
          {PARTS.filter((p) => album.counts[p] > 0).map((p) => (
            <span key={p} class="chip" title={`${album.counts[p]} ${PART_LABEL[p].toLowerCase()}`}>
              <PartIcon part={p} />
              {album.counts[p]}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
