import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(6000);

// Check all canvas elements
const canvases = await page.evaluate(() => {
  const allCanvas = document.querySelectorAll('canvas');
  return Array.from(allCanvas).map((c, i) => ({
    index: i,
    width: c.width,
    height: c.height,
    parentClass: c.parentElement?.className || 'none',
    grandparentClass: c.parentElement?.parentElement?.className || 'none'
  }));
});
console.log('All canvas elements:', JSON.stringify(canvases, null, 2));

// Check the lanyard wrapper specifically
const lanyardInfo = await page.evaluate(() => {
  const wrapper = document.querySelector('.lanyard-wrapper');
  if (!wrapper) return 'lanyard-wrapper NOT FOUND';
  const astroIsland = wrapper.querySelector('astro-island');
  const innerDiv = wrapper.querySelector('.relative');
  const canvas = wrapper.querySelector('canvas');
  return {
    hasAstroIsland: !!astroIsland,
    hasInnerDiv: !!innerDiv,
    hasCanvas: !!canvas,
    innerHTML: wrapper.innerHTML.substring(0, 500)
  };
});
console.log('\nLanyard wrapper info:', JSON.stringify(lanyardInfo, null, 2));

await browser.close();
