import { getText, loadAlbum, loadIndex, songFile } from './api';
import { findAlbum } from './catalog';
import type { Route } from './router';

/**
 * Loads everything a page needs before it is drawn. Used by the prerender (so the
 * generated HTML contains the real content) and by the browser on first load (so
 * the page takes over the prerendered HTML without flashing "Loading…").
 */
export async function preloadRoute(route: Route): Promise<void> {
  const index = await loadIndex();
  switch (route.name) {
    case 'album':
      if (findAlbum(index, route.id)) await loadAlbum(index, route.id);
      break;
    case 'song': {
      if (!findAlbum(index, route.albumId)) break;
      const data = await loadAlbum(index, route.albumId);
      const { file } = songFile(data, route.trackId, route.part, route.version);
      if (file && !/\.pdf$/i.test(file)) await getText(file);
      break;
    }
    case 'sheet': {
      const sheet = findAlbum(index, route.id)?.lyricsSheet;
      if (sheet) await getText(sheet);
      break;
    }
    default:
      break;
  }
}
