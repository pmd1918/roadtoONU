import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(3000);

// Scroll to lanyard-wrapper
const scrolled = await page.evaluate(() => {
  const wrapper = document.querySelector('.lanyard-wrapper');
  if (wrapper) {
    wrapper.scrollIntoView({ block: 'center' });
    return true;
  }
  return false;
});
console.log('Scrolled to lanyard:', scrolled);

// Wait for it to become visible and load
await page.waitForTimeout(5000);

// Screenshot
await page.screenshot({ path: '/tmp/lanyard-visible.png' });
console.log('Saved /tmp/lanyard-visible.png');

// Check canvas size again after scrolling
const canvasInfo = await page.evaluate(() => {
  const wrapper = document.querySelector('.lanyard-wrapper');
  const canvas = wrapper?.querySelector('canvas');
  if (!canvas) return 'No canvas in lanyard-wrapper';
  const rect = canvas.getBoundingClientRect();
  return {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    rectWidth: rect.width,
    rectHeight: rect.height,
    visible: rect.height > 0
  };
});
console.log('Canvas after scroll:', canvasInfo);

await browser.close();
