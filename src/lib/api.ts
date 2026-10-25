import { asset } from './paths';
import { load } from './store';
import { PARTS } from './types';
import type { Album, CatalogIndex, FileRef, LoadedAlbum, Part, PartFile, TrackFiles } from './types';

/**
 * How raw files are read. The browser uses fetch(); the build-time prerender
 * (src/prerender.ts) swaps in readers that use the files on disk.
 */
export interface Readers {
  json: (path: string) => Promise<unknown>;
  bytes: (path: string) => Promise<ArrayBuffer>;
}

let readers: Readers = {
  json: async (path) => {
    const r = await fetch(asset(path));
    if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
    return r.json();
  },
  bytes: async (path) => {
    const r = await fetch(asset(path));
    if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
    return r.arrayBuffer();
  },
};

export function setReaders(r: Readers): void {
  readers = r;
}

export function getJSON<T>(path: string): Promise<T> {
  return load(`json:${path}`, () => readers.json(path) as Promise<T>);
}

/** Tab files are a mix of UTF-8 and Windows-1252: try UTF-8 strictly, fall back. */
export function getText(path: string): Promise<string> {
  return load(`text:${path}`, async () => {
    const buf = await readers.bytes(path);
    let text: string;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      text = new TextDecoder('windows-1252').decode(buf);
    }
    return text.replace(/\r\n?/g, '\n');
  });
}

export const indexKey = 'json:data/index.json';
export const loadIndex = () => getJSON<CatalogIndex>('data/index.json');

export const albumKey = (id: string) => `album:${id}`;

/** album_<id>.json plus only the instrument files that exist (counts come from index.json). */
export function loadAlbum(index: CatalogIndex, id: string): Promise<LoadedAlbum> {
  return load(albumKey(id), async () => {
    const summary = index.albums.find((a) => a.id === id);
    if (!summary) throw new Error(`Unknown album "${id}"`);
    const parts: Partial<Record<Part, TrackFiles>> = {};
    const [album] = await Promise.all([
      getJSON<Album>(`data/albums/album_${id}.json`),
      ...PARTS.filter((p) => summary.counts[p] > 0).map(async (p) => {
        const f = await getJSON<PartFile>(`data/${p}/${p}_${id}.json`);
        parts[p] = f.tabs ?? f.lyrics ?? {};
      }),
    ]);
    return { summary, album, parts };
  });
}

export function filesOf(ref: FileRef | undefined): string[] {
  if (!ref) return [];
  return Array.isArray(ref) ? ref : [ref];
}

/** Which parts (guitar/bass/drums/lyrics) a track has in a loaded album */
export function partsOfTrack(data: LoadedAlbum, trackId: string): Part[] {
  return PARTS.filter((p) => data.parts[p]?.[trackId] !== undefined);
}

/** The file a song page shows: the part asked for (or the first available) and its version. */
export function songFile(data: LoadedAlbum, trackId: string, wanted?: Part, version?: number) {
  const track = data.album.tracks.find((t) => t.id === trackId);
  const have = track ? partsOfTrack(data, track.id) : [];
  const part = wanted && have.includes(wanted) ? wanted : have[0];
  const files = part && track ? filesOf(data.parts[part]?.[track.id]) : [];
  const vi = Math.min(Math.max(version ?? 1, 1), files.length || 1) - 1;
  return { track, have, part, files, vi, file: files[vi] };
}
