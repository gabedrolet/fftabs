import { albumKey, indexKey, songFile } from './api';
import { findAlbum } from './catalog';
import type { Route } from './router';
import { peek } from './store';
import { PART_LABEL } from './types';
import type { CatalogIndex, LoadedAlbum } from './types';

export interface PageMeta {
  title: string;
  description: string;
}

const SITE = 'fftabs';
const BAND = 'Foo Fighters';

/** Title and description of a page, for search results and link previews (needs its data preloaded). */
export function describe(route: Route): PageMeta {
  const index = peek<CatalogIndex>(indexKey);
  const album = (id: string) => (index ? findAlbum(index, id) : undefined);

  switch (route.name) {
    case 'home':
      return {
        title: `${SITE}: ${BAND} tabs archive`,
        description: `Guitar, bass and drums tabs and lyrics for every ${BAND} album, B-sides, covers and side projects.`,
      };
    case 'instrument': {
      const what = route.part === 'lyrics' ? 'lyrics' : `${PART_LABEL[route.part].toLowerCase()} tabs`;
      return {
        title: `${BAND} ${what} · ${SITE}`,
        description: `Every ${BAND} song with ${what} in the archive, grouped by album.`,
      };
    }
    case 'album': {
      const a = album(route.id);
      if (!a) break;
      const what = route.part
        ? route.part === 'lyrics'
          ? 'lyrics'
          : `${PART_LABEL[route.part].toLowerCase()} tabs`
        : 'tabs and lyrics';
      return {
        title: `${a.title}${a.year ? ` (${a.year})` : ''} ${what} · ${BAND} · ${SITE}`,
        description: `${BAND} ${a.title}: ${a.counts.guitar} guitar, ${a.counts.bass} bass and ${a.counts.drums} drums tabs, lyrics for ${a.counts.lyrics} songs.`,
      };
    }
    case 'song': {
      const data = peek<LoadedAlbum>(albumKey(route.albumId));
      if (!data) break;
      const { track, part } = songFile(data, route.trackId, route.part, route.version);
      if (!track || !part) break;
      const what = part === 'lyrics' ? 'lyrics' : `${PART_LABEL[part].toLowerCase()} tab`;
      return {
        title: `${track.title} ${what} · ${BAND} · ${SITE}`,
        description: `${track.title} by ${BAND}${track.note ? ` (${track.note})` : ''}, from ${data.album.title}: ${what}.`,
      };
    }
    case 'sheet': {
      const a = album(route.id);
      if (!a) break;
      return { title: `${a.title} lyrics · ${BAND} · ${SITE}`, description: `Lyrics for every song on ${BAND} ${a.title}.` };
    }
    case 'search':
      return { title: `Search · ${SITE}`, description: `Search the ${BAND} tabs archive.` };
    case 'legal':
      return { title: `Legal · ${SITE}`, description: `About this unofficial ${BAND} fan archive.` };
    default:
      break;
  }
  return { title: `Not found · ${SITE}`, description: `That page isn't in the ${BAND} tabs archive.` };
}
