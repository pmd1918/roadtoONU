#!/usr/bin/env node
/**
 * Critical CSS extraction using Playwright (already installed)
 * Extracts above-the-fold CSS from the built site
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'styles');

// Simple static file server
function createStaticServer(dir, port = 3000) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
      // Handle directory paths
      if (!path.extname(filePath) && fs.existsSync(filePath + '/index.html')) {
        filePath = filePath + '/index.html';
      }
      
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + filePath);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });
    
    server.listen(port, () => {
      console.log(`   Static server running on port ${port}`);
      resolve(server);
    });
  });
}

async function extractCriticalCSS() {
  console.log('🚀 Extracting critical CSS with Playwright...\n');
  
  const PORT = 3456;
  let server;
  let browser;
  
  try {
    // Start static server
    server = await createStaticServer(DIST_DIR, PORT);
    
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    // Collect critical CSS from multiple viewports
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },   // Mobile
      { width: 1300, height: 900, name: 'desktop' }  // Desktop
    ];
    
    let allCriticalRules = new Set();
    
    for (const viewport of viewports) {
      console.log(`   Analyzing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate and wait for load
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
      
      // Extract critical CSS using Coverage API
      await page.coverage.startCSSCoverage();
      
      // Scroll slightly to trigger any above-fold lazy content
      await page.evaluate(() => window.scrollTo(0, 100));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      
      const cssCoverage = await page.coverage.stopCSSCoverage();
      
      // Extract used CSS rules
      for (const entry of cssCoverage) {
        const css = entry.text;
        for (const range of entry.ranges) {
          const usedRule = css.substring(range.start, range.end);
          allCriticalRules.add(usedRule);
        }
      }
      
      await page.close();
    }
    
    // Combine all critical CSS
    let criticalCSS = Array.from(allCriticalRules).join('\n\n');
    
    // Add essential font-face declarations manually (coverage doesn't catch these well)
    const fontFaces = `
/* Critical font-face declarations */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter/inter-latin-400-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/inter/inter-latin-500-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter/inter-latin-600-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter/inter-latin-700-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Have Heart';
  src: url('/fonts/HaveHeart-subset.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;
    
    criticalCSS = fontFaces + '\n' + criticalCSS;
    
    // Write critical CSS
    const criticalPath = path.join(OUTPUT_DIR, 'critical.css');
    fs.writeFileSync(criticalPath, criticalCSS);
    
    console.log(`\n✅ Critical CSS extracted!`);
    console.log(`   Output: ${criticalPath}`);
    console.log(`   Size: ${(criticalCSS.length / 1024).toFixed(2)} KB`);
    console.log(`   Rules: ${allCriticalRules.size}`);
    
    return criticalCSS;
    
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }
}

// Run
extractCriticalCSS()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
