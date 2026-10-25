import { PARTS, PART_LABEL } from '../lib/types';
import type { Part } from '../lib/types';
import { Link } from './Link';
import { PartIcon } from './PartIcon';

/** Icon buttons linking to a song's guitar / bass / drums / lyrics; missing ones are greyed out. */
export function PartButtons({
  albumId,
  trackId,
  available,
  show = PARTS,
}: {
  albumId: string;
  trackId: string;
  available: readonly Part[];
  show?: readonly Part[];
}) {
  return (
    <>
      {show.map((p) => {
        const on = available.includes(p);
        return (
          <Link
            key={p}
            to={{ name: 'song', albumId, trackId, part: p }}
            class={on ? 'btn' : 'btn off'}
            title={on ? PART_LABEL[p] : `${PART_LABEL[p]} (none yet)`}
            aria-label={PART_LABEL[p]}
            aria-disabled={on ? undefined : true}
            tabIndex={on ? undefined : -1}
          >
            <PartIcon part={p} />
          </Link>
        );
      })}
    </>
  );
}
