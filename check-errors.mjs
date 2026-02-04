import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Collect console messages
const logs = [];
page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', err => logs.push({ type: 'error', text: err.message }));

await page.setViewportSize({ width: 1200, height: 900 });
console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(5000);

console.log('\n=== Console Logs ===');
logs.filter(l => l.type === 'error' || l.type === 'warning').forEach(l => {
  console.log(`[${l.type}] ${l.text}`);
});

// Check if canvas exists
const canvas = await page.$('canvas');
console.log('\nCanvas element:', canvas ? 'FOUND' : 'NOT FOUND');

// Check if lanyard image exists (mobile fallback)
const img = await page.$('img[src*="lanyard"]');
console.log('Lanyard image:', img ? 'FOUND' : 'NOT FOUND');

await browser.close();
