import { chromium } from "playwright";
import { mkdirSync } from "fs";
const chromiumExe = "C:\\Users\\DELL\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath: chromiumExe });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();
await page.goto("http://localhost:5174", { waitUntil: "networkidle", timeout: 25000 });
await page.waitForTimeout(1500);

// Scroll through to trigger observers
const h = await page.evaluate(() => document.body.scrollHeight);
for(let y = 0; y < h; y += 600) {
  await page.evaluate(pos => window.scrollTo(0, pos), y);
  await page.waitForTimeout(100);
}

const pageH = await page.evaluate(() => document.body.scrollHeight);
console.log("Page height:", pageH, "px");

// Check for duplicate hero elements
const heroCount = await page.evaluate(() =>
  document.querySelectorAll("section").length
);
console.log("Section count:", heroCount);

// Capture just the footer/bottom portion
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: "screenshots/10-footer-bottom.png", clip: { x: 0, y: 0, width: 1440, height: 900 }});
console.log("Captured footer");

await ctx.close();
await browser.close();
