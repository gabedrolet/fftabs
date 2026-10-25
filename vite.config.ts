import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// Content (tabs_*, lyrics, data, images…) stays at the repo root. The dev server
// serves it as-is; `npm run build` copies it into dist/ (tools/copy-content.mjs).
export default defineConfig({
  base: './', // relative URLs: works at gabedrolet.github.io/fftabs/ and at fftabs.com/
  publicDir: false,
  plugins: [preact()],
  // fixed ports so .vscode/launch.json always opens the right address
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
