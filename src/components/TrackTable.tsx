import { Fragment } from 'preact';
import { partsOfTrack } from '../lib/api';
import { findAlbum, useCatalog } from '../lib/catalog';
import { PARTS, PART_LABEL } from '../lib/types';
import type { LoadedAlbum, Part, Track } from '../lib/types';
import { Link } from './Link';
import { PartButtons } from './PartButtons';

const pad2 = (n?: number) => (n ? String(n).padStart(2, '0') : '');

/** Track list of one album; with `part`, only tracks that have it. */
export function TrackTable({ data, part }: { data: LoadedAlbum; part?: Part }) {
  const index = useCatalog();
  const { album } = data;
  const multiDisc = album.tracks.some((t) => t.disc);
  const tracks = album.tracks.filter((t) => !part || data.parts[part]?.[t.id] !== undefined);

  let lastGroup: string | null = null;
  const groupOf = (t: Track) => (t.disc ? `Disc ${t.disc}` : 'Bonus tracks');

  return (
    <table class="tracks">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Song</th>
          <th class="links">{part ? PART_LABEL[part] : 'Tabs & lyrics'}</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((t) => {
          const have = partsOfTrack(data, t.id);
          const first = part ?? have[0];
          const from = t.from ? findAlbum(index, t.from) : undefined;
          let header = null;
          if (multiDisc && groupOf(t) !== lastGroup) {
            lastGroup = groupOf(t);
            header = (
              <tr class="disc">
                <td colSpan={3}>{lastGroup}</td>
              </tr>
            );
          }
          return (
            <Fragment key={t.id}>
              {header}
              <tr>
                <td class="num">{pad2(t.n)}</td>
                <td>
                  {first ? (
                    <Link to={{ name: 'song', albumId: album.id, trackId: t.id, part: first }}>{t.title}</Link>
                  ) : (
                    t.title
                  )}
                  {t.bonus && !multiDisc && <span class="badge">bonus</span>}
                  {t.note && <span class="note"> ({t.note})</span>}
                  {from && (
                    <span class="note">
                      {' '}from <Link to={{ name: 'album', id: from.id }}>{from.title}</Link>
                    </span>
                  )}
                </td>
                <td class="links">
                  <PartButtons albumId={album.id} trackId={t.id} available={have} show={part ? [part] : PARTS} />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
