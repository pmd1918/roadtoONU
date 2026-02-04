import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Collect ALL console messages
const logs = [];
page.on('console', msg => {
  logs.push({ type: msg.type(), text: msg.text() });
});
page.on('pageerror', err => {
  logs.push({ type: 'PAGE_ERROR', text: err.message, stack: err.stack });
});

await page.setViewportSize({ width: 1400, height: 900 });

console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);

// Scroll to trigger lanyard load
await page.evaluate(() => {
  const wrapper = document.querySelector('.lanyard-wrapper');
  if (wrapper) wrapper.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(8000);

console.log('\n=== ALL Console Messages ===');
logs.forEach(l => {
  if (l.type === 'PAGE_ERROR' || l.type === 'error') {
    console.log(`[${l.type}] ${l.text}`);
    if (l.stack) console.log(l.stack);
  }
});

// Check lanyard content
const content = await page.evaluate(() => {
  const wrapper = document.querySelector('.lanyard-wrapper');
  const island = wrapper?.querySelector('astro-island');
  return {
    wrapperHTML: wrapper?.innerHTML?.substring(0, 300) || 'no wrapper',
    islandChildren: island?.childElementCount || 0,
    hasImg: !!wrapper?.querySelector('img[src*="lanyard"]')
  };
});
console.log('\nLanyard content:', content);

await browser.close();
