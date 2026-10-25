import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { AlbumSummary, CatalogIndex } from './types';

export const CatalogContext = createContext<CatalogIndex | null>(null);

/** data/index.json, loaded once by <App>. */
export function useCatalog(): CatalogIndex {
  const index = useContext(CatalogContext);
  if (!index) throw new Error('useCatalog() used outside <CatalogContext.Provider>');
  return index;
}

export function findAlbum(index: CatalogIndex, id: string): AlbumSummary | undefined {
  return index.albums.find((a) => a.id === id);
}

/** Lowercase, no accents, "&" → "and", punctuation removed: for search matching. */
export function fold(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
