import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });

console.log('Loading page...');
await page.goto('https://roadtoonu.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(6000);

// Screenshot the registration section where lanyard should be
await page.screenshot({ path: '/tmp/desktop-view.png', fullPage: false });
console.log('Saved /tmp/desktop-view.png');

// Check canvas dimensions
const canvasBox = await page.locator('canvas').first().boundingBox();
console.log('Canvas bounding box:', canvasBox);

await browser.close();
