import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://roadtoonu.com',
  output: "static",
  compilerOptions: {
    cssCodeSplit: "per-page"
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true,
      minify: 'esbuild',
      cssCodeSplit: true,
      reportCompressedSize: false, // Disable for faster builds
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          manualChunks: (id) => {
            // Create vendor chunk for dependencies
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            // Split travel calculator into its own chunk
            if (id.includes('TravelCalculator')) {
              return 'travel';
            }
          }
        }
      }
    }
  }
});
