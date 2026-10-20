// Real screens of the app for the landing page, from the walkthrough family (synthetic data, no Qloo results):
// Maya's warning screen, Maya talking to Momwell, and Dr Lee's queue. Needs the app running and
// scripts/seed-demo.ts run first. Run: node --env-file=.env.local scripts/landing-screens.ts [base url]
import puppeteer, { type Page } from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3100";
const out = (name: string) => new URL(`../public/screens/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const until = (page: Page, q: string, timeout = 90_000) => page.waitForFunction((s) => !!document.querySelector(s), { polling: 300, timeout }, q);

async function as(email: string) {
  const page = await (await browser.createBrowserContext()).newPage();
  await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", email);
  await page.type("input[name=password]", process.env.MOMWELL_DEMO_PASSWORD!);
  await Promise.all([page.waitForNavigation(), page.click("button.btn")]);
  return page;
}

try {
  const maya = await as("momwell.demo.maya@example.com");
  await maya.goto(`${base}/home`, { waitUntil: "networkidle0" });
  const warning = await maya.$eval("a[href^='/check-in/']", (a) => a.getAttribute("href"));
  await maya.goto(`${base}${warning}`, { waitUntil: "networkidle0" });
  await until(maya, "section[aria-live=assertive]");
  await maya.screenshot({ path: out("warning.png"), clip: { x: 260, y: 0, width: 1020, height: 600 } });

  const lee = await as("momwell.demo.lee@example.com");
  await lee.goto(`${base}/home`, { waitUntil: "networkidle0" });
  await lee.screenshot({ path: out("care-team.png"), clip: { x: 0, y: 0, width: 1280, height: 640 } });

  // Talk answers at once: she says it, confirms it, and the rules decide.
  await maya.goto(`${base}/talk`, { waitUntil: "networkidle0" });
  await maya.type("textarea", "My head has been pounding since this morning and it won't stop. My blood pressure is 148 over 94.");
  await maya.keyboard.press("Enter");
  await maya.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => b.textContent === "Yes, it’s happening"), { polling: 200, timeout: 30_000 });
  await maya.$$eval("button", (bs) => (bs.find((b) => b.textContent === "Yes, it’s happening") as HTMLButtonElement).click());
  await until(maya, "main section[aria-live=assertive]");
  await new Promise((r) => setTimeout(r, 1500));
  await maya.evaluate(() => window.scrollTo(0, 0));
  await maya.screenshot({ path: out("talk.png"), clip: { x: 260, y: 0, width: 1020, height: 820 } });

  console.log("screens made");
} finally {
  await browser.close();
}
