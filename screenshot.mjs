/**
 * screenshot.mjs — Puppeteer screenshot tool
 * Usage: node screenshot.mjs <url> [label]
 * Saves to: ./temporary screenshots/screenshot-N[-label].png
 */
import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotsDir = join(__dirname, 'temporary screenshots');
await mkdir(screenshotsDir, { recursive: true });

// Auto-increment filename
const files = await readdir(screenshotsDir).catch(() => []);
const nums = files
  .map(f => parseInt(f.match(/screenshot-(\d+)/)?.[1]))
  .filter(Boolean);
const next = nums.length ? Math.max(...nums) + 1 : 1;
const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;
const outputPath = join(screenshotsDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: outputPath, fullPage: false });
await browser.close();

console.log(`Screenshot saved: ${outputPath}`);
