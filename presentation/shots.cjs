const { chromium } = require("playwright-core");
const fs = require("fs");
(async () => {
  fs.mkdirSync("screenshots", { recursive: true });
  const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, locale: "uz-UZ" });
  const p = await ctx.newPage();
  await p.goto("http://localhost:5173/login");
  await p.fill('input[type=email]', "admin@inventrack.uz");
  await p.fill('input[type=password]', process.env.SEED_PASSWORD);
  await p.click("button");
  await p.waitForURL("http://localhost:5173/");
  await p.waitForSelector(".recharts-pie-sector");
  await p.waitForTimeout(500);
  const shot = async (url, name, ready) => {
    await p.goto("http://localhost:5173" + url);
    await p.waitForSelector(ready);
    await p.waitForTimeout(600);
    await p.screenshot({ path: `screenshots/${name}.png` });
  };
  await p.screenshot({ path: "screenshots/dashboard.png" });
  await shot("/equipment", "list", "table tbody tr");
  await p.setViewportSize({ width: 1280, height: 1150 });
  await shot("/equipment/13", "detail", "ol li");
  await p.setViewportSize({ width: 1280, height: 760 });
  await shot("/equipment/new", "form", "form select");
  await shot("/reports", "report", "table tbody tr");
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
