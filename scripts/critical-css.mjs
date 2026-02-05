/**
 * Post-build script to inline critical CSS using Critters
 * No puppeteer/browser required - works on any server
 */

import Critters from 'critters';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Pages to process
const pages = [
  'index.html',
  'sponsorship/index.html'
];

async function processCriticalCSS() {
  console.log('🎨 Inlining critical CSS with Critters...\n');

  const critters = new Critters({
    // Path to look for CSS files
    path: distDir,
    // Public path prefix for CSS files
    publicPath: '/',
    // Inline critical CSS
    inlineThreshold: 0,
    // Keep original stylesheets (don't remove them)
    pruneSource: false,
    // Preload remaining CSS
    preload: 'media',
    // Don't merge inlined styles
    mergeStylesheets: false,
    // Reduce unused CSS
    reduceInlineStyles: true,
    // Add noscript fallback
    noscriptFallback: true,
    // Log level
    logLevel: 'info'
  });

  for (const page of pages) {
    const htmlPath = join(distDir, page);
    
    try {
      console.log(`Processing: ${page}`);
      
      const html = readFileSync(htmlPath, 'utf8');
      const result = await critters.process(html);
      
      writeFileSync(htmlPath, result);
      console.log(`  ✅ Done\n`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${page}:`, error.message);
      // Don't fail build on error - just skip critical CSS
    }
  }

  console.log('✨ Critical CSS inlining complete!');
}

processCriticalCSS().catch(console.error);
