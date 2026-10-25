import { PARTS } from './types';
import type { Album, CatalogIndex, FileRef, LoadedAlbum, Part, PartFile, TrackFiles } from './types';

const jsonCache = new Map<string, Promise<unknown>>();

export function getJSON<T>(url: string): Promise<T> {
  let p = jsonCache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`Could not load ${url} (${r.status})`);
      return r.json() as Promise<T>;
    });
    p.catch(() => jsonCache.delete(url));
    jsonCache.set(url, p);
  }
  return p;
}

/** Tab files are a mix of UTF-8 and Windows-1252: try UTF-8 strictly, fall back. */
export async function getText(url: string): Promise<string> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Could not load ${url} (${r.status})`);
  const buf = await r.arrayBuffer();
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    text = new TextDecoder('windows-1252').decode(buf);
  }
  return text.replace(/\r\n?/g, '\n');
}

export const loadIndex = () => getJSON<CatalogIndex>('data/index.json');

/** album_<id>.json plus only the instrument files that exist (counts come from index.json). */
export async function loadAlbum(index: CatalogIndex, id: string): Promise<LoadedAlbum> {
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
}

export function filesOf(ref: FileRef | undefined): string[] {
  if (!ref) return [];
  return Array.isArray(ref) ? ref : [ref];
}

/** Which parts (guitar/bass/drums/lyrics) a track has in a loaded album */
export function partsOfTrack(data: LoadedAlbum, trackId: string): Part[] {
  return PARTS.filter((p) => data.parts[p]?.[trackId] !== undefined);
}
