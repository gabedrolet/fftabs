import type { AlbumKind, AlbumSummary } from './types';

/** How albums are grouped on the home page and instrument pages. */
export const ALBUM_GROUPS: { title: string; kinds: AlbumKind[] }[] = [
  { title: 'Albums', kinds: ['studio', 'live', 'compilation'] },
  { title: 'B-sides, covers & more', kinds: ['collection'] },
  { title: 'Side projects', kinds: ['side-project'] },
];

export function groupAlbums<T extends AlbumSummary>(albums: T[]): { title: string; albums: T[] }[] {
  return ALBUM_GROUPS.map((g) => ({ title: g.title, albums: albums.filter((a) => g.kinds.includes(a.kind)) })).filter(
    (g) => g.albums.length > 0,
  );
}
