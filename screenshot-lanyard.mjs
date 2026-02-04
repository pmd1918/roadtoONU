import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

// Scroll to the registration/lanyard section
await page.evaluate(() => {
  const section = document.querySelector('.registration-section') || document.querySelector('canvas')?.closest('section');
  if (section) section.scrollIntoView();
});
await page.waitForTimeout(5000);

await page.screenshot({ path: '/tmp/lanyard-section.png' });
console.log('Saved /tmp/lanyard-section.png');

// Check what's in the canvas parent
const lanyardWrapper = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return 'No canvas';
  const wrapper = canvas.closest('.lanyard-wrapper') || canvas.parentElement;
  return {
    className: wrapper?.className,
    style: wrapper?.getAttribute('style'),
    parentStyle: wrapper?.parentElement?.getAttribute('style')
  };
});
console.log('Lanyard wrapper:', lanyardWrapper);

await browser.close();
