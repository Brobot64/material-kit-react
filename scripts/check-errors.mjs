import { chromium } from "playwright";
const chromiumExe = "C:\\Users\\DELL\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath: chromiumExe });
const page = await browser.newPage();
const errors = [];
const consoleMsgs = [];
page.on("console", msg => { if(msg.type() === "error") consoleMsgs.push(msg.text()); });
page.on("pageerror", err => errors.push(err.message));
await page.goto("http://localhost:5174", { waitUntil: "networkidle", timeout: 20000 });
await page.waitForTimeout(2000);
console.log("=== PAGE ERRORS ===");
errors.forEach(e => console.log(e));
console.log("=== CONSOLE ERRORS ===");
consoleMsgs.forEach(e => console.log(e));
// Check body background
const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
console.log("=== BODY BG:", bodyBg);
// Check if tailwind classes work
const testClass = await page.evaluate(() => {
  const el = document.createElement("div");
  el.className = "bg-indigo-500";
  document.body.appendChild(el);
  const style = window.getComputedStyle(el).backgroundColor;
  el.remove();
  return style;
});
console.log("=== TAILWIND TEST (bg-indigo-500):", testClass);
await browser.close();
