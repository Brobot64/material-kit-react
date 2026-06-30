/**
 * Playwright screenshot tool for ShopMaster landing page.
 * Usage: node scripts/screenshot.mjs [--url http://localhost:5174]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.argv[2] || 'http://localhost:5174';
const OUT_DIR = join(__dirname, '..', 'screenshots');
mkdirSync(OUT_DIR, { recursive: true });

const SECTIONS = [
  { name: '01-hero',         selector: null,             scrollY: 0 },
  { name: '02-stats',        selector: '#stats',         scrollY: null },
  { name: '03-features',     selector: '#features',      scrollY: null },
  { name: '04-how-it-works', selector: '#how-it-works',  scrollY: null },
  { name: '05-pricing',      selector: '#pricing',       scrollY: null },
  { name: '06-testimonials', selector: '#testimonials',  scrollY: null },
  { name: '07-faq',          selector: '#faq',           scrollY: null },
  { name: '08-contact',      selector: '#contact',       scrollY: null },
];

async function screenshot() {
  const chromiumExe = 'C:\\Users\\DELL\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath: chromiumExe });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();

  console.log(`\nNavigating to ${BASE_URL} …`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });

  // Give CSS animations a moment to settle
  await page.waitForTimeout(1500);

  // Scroll through the entire page to trigger all IntersectionObservers,
  // then scroll back to top for the full-page screenshot
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 600;
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);

  // Full-page shot first
  const fullPath = join(OUT_DIR, '00-full-page.png');
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log(`✓  Full page  →  screenshots/00-full-page.png`);

  for (const s of SECTIONS) {
    let path = join(OUT_DIR, `${s.name}.png`);
    try {
      if (s.selector) {
        // Try to find the element and scroll to it
        const el = await page.$(s.selector);
        if (el) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await el.screenshot({ path });
        } else {
          // Anchor not found — scroll proportionally
          const totalH = await page.evaluate(() => document.body.scrollHeight);
          const idx = SECTIONS.indexOf(s);
          await page.evaluate((y) => window.scrollTo(0, y), Math.round((idx / SECTIONS.length) * totalH));
          await page.waitForTimeout(600);
          await page.screenshot({ path });
        }
      } else {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(400);
        await page.screenshot({ path });
      }
      console.log(`✓  ${s.name}  →  screenshots/${s.name}.png`);
    } catch (e) {
      console.error(`✗  ${s.name}: ${e.message}`);
    }
  }

  // Mobile viewport
  await ctx.close();
  const mobileBrowser = await chromium.launch({ headless: true, executablePath: chromiumExe });
  const mobileCtx = await mobileBrowser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({
    path: join(OUT_DIR, '09-mobile-hero.png'),
    fullPage: false,
  });
  console.log('✓  Mobile hero  →  screenshots/09-mobile-hero.png');

  await mobileCtx.close();
  await mobileBrowser.close();
  await browser.close();

  console.log(`\n✅  Done! All screenshots saved to:  ${OUT_DIR}\n`);
}

screenshot().catch((err) => { console.error(err); process.exit(1); });
