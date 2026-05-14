import { chromium } from "playwright";
const chromiumExe = "C:\\Users\\DELL\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath: chromiumExe });
const page = await browser.newPage();
page.on("pageerror", err => console.error("JS ERROR:", err.message));
await page.goto("http://localhost:5174", { waitUntil: "networkidle", timeout: 25000 });
await page.waitForTimeout(2500);

// Test Tailwind is working
const tw = await page.evaluate(() => {
  const el = document.createElement("div");
  el.className = "bg-indigo-500";
  document.body.appendChild(el);
  const s = window.getComputedStyle(el).backgroundColor;
  el.remove();
  return s;
});
console.log("Tailwind bg-indigo-500:", tw);

const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
console.log("Body background:", bodyBg);

// Check landing page container bg
const heroEl = await page.$(".bg-\\[\\#050d20\\]");
console.log("Hero dark bg element found:", !!heroEl);

await browser.close();
