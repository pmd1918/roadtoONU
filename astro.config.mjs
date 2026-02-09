import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://roadtoonu.com',
  output: "static",
  integrations: [sitemap()],
  compilerOptions: {
    cssCodeSplit: "per-page"
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  build: {
    inlineStylesheets: 'always'
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      minify: 'esbuild',
      reportCompressedSize: false
    }
  }
});
