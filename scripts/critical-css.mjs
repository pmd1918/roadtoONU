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
const MAX_INLINED_CSS_BYTES = 24 * 1024;
const MAX_HTML_GROWTH_BYTES = 30 * 1024;

// Pages to process
const pages = [
  'index.html',
  'sponsorship/index.html'
];

function getInlineCssBytes(html) {
  const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let total = 0;
  let match;
  while ((match = styleTagRegex.exec(html)) !== null) {
    total += match[1].length;
  }
  return total;
}

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

      const inlinedCssBytes = getInlineCssBytes(result);
      const htmlGrowthBytes = result.length - html.length;
      if (inlinedCssBytes > MAX_INLINED_CSS_BYTES || htmlGrowthBytes > MAX_HTML_GROWTH_BYTES) {
        writeFileSync(htmlPath, html);
        console.log(`  ⚠️  Skipped (inline CSS ${Math.round(inlinedCssBytes / 1024)}KB, HTML growth ${Math.round(htmlGrowthBytes / 1024)}KB)\n`);
        continue;
      }

      writeFileSync(htmlPath, result);
      console.log(`  ✅ Done (inline CSS ${Math.round(inlinedCssBytes / 1024)}KB)\n`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${page}:`, error.message);
      // Don't fail build on error - just skip critical CSS
    }
  }

  console.log('✨ Critical CSS inlining complete!');
}

processCriticalCSS().catch(console.error);
