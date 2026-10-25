// Copies the archive content next to the built app in dist/ (run by `npm run build`).
import { cpSync, existsSync } from 'node:fs';

const items = [
  'data', 'tabs_guitar', 'tabs_bass', 'tabs_drums', 'lyrics', 'images',
  'favicon.ico', 'redirects.json', '404.html', '.nojekyll', 'CNAME',
];
let n = 0;
for (const item of items) {
  if (!existsSync(item)) continue;
  cpSync(item, `dist/${item}`, { recursive: true });
  n++;
}
console.log(`copy-content: copied ${n} items into dist/`);
