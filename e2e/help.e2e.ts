// Asking for help in a real browser: Maya asks for tonight's feeds, Sam sees it on his Today and takes it, and Maya
// sees that Sam is on it.
// Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { invite, person, removeAll, type Person } from "../lib/people/test-people.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person, partner: Person;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  [mom, partner] = await Promise.all([person("mother", "Maya"), person("circle", "Sam")]);
  const { error } = await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  if (error) throw error;
});
after(async () => {
  await browser?.close();
  await removeAll();
});

async function signIn(who: Person): Promise<Page> {
  const page = await (await browser.createBrowserContext()).newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", who.email);
  await page.type("input[name=password]", who.password);
  await Promise.all([page.waitForNavigation({ timeout: 60_000 }), page.click("button.btn")]);
  return page;
}
const shows = (page: Page, text: string) => page.waitForFunction((t) => document.querySelector("main")?.innerText.includes(t), { polling: 200, timeout: 60_000 }, text);

test("she asks, he takes it, she sees he's on it", async () => {
  const her = await signIn(mom);
  await her.goto(`${base}/help`, { timeout: 60_000 });
  await her.$eval("input[value=night_feeds]", (i) => (i as HTMLInputElement).click());
  await her.type("input[name=note]", "From 1am, please");
  await her.click("form button.btn");
  await shows(her, "Sent to your people.");

  const him = await signIn(partner);
  await him.goto(`${base}/home`, { timeout: 60_000 });
  await shows(him, "She asked for");
  await him.goto(`${base}/help`, { timeout: 60_000 });
  await shows(him, "From 1am, please");
  await him.click("main article form button.btn");
  await shows(him, "You’re on it");

  await her.goto(`${base}/home`, { timeout: 60_000 });
  await shows(her, "Sam is on it");
  assert.match(await her.$eval("main", (m) => (m as HTMLElement).innerText), /Help today/);
});
