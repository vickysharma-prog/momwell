// Made for you in a real browser: a mom who loves Gilmore Girls, in Austin and vegetarian, gets gentle shows (never
// Everwood), places to eat with the FDA's advice, and a playlist; all marked as from Qloo.
// Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser } from "puppeteer-core";
import { search } from "../lib/qloo/api.ts";
import { admin, person, removeAll, type Person } from "../lib/people/test-people.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  mom = await person("mother", "Maya");
  const [gg] = await search("Gilmore Girls", 1, "urn:entity:tv_show");
  const [adele] = await search("Adele", 1, "urn:entity:artist");
  const { error } = await admin.from("tastes").insert({
    mother_id: mom.id,
    city: "Austin, TX",
    diets: ["vegetarian"],
    liked: [
      { id: gg.entity_id, name: gg.name, kind: "tv_show" },
      { id: adele.entity_id, name: adele.name, kind: "artist" },
    ],
  });
  if (error) throw error;
});
after(async () => {
  await browser?.close();
  await removeAll();
});

test("her shelves come from Qloo, gentle and safe", async () => {
  const page = await (await browser.createBrowserContext()).newPage();
  await page.bringToFront();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", mom.email);
  await page.type("input[name=password]", mom.password);
  await Promise.all([page.waitForNavigation(), page.click("button.btn")]);
  await page.goto(`${base}/for-you`, { waitUntil: "networkidle0", timeout: 90_000 });
  await page.waitForFunction(() => document.body.innerText.includes("Your birth playlist") && !document.querySelector("[aria-busy=true]"), { polling: 300, timeout: 90_000 });

  const shown = await page.$eval("main", (m) => (m as HTMLElement).innerText);
  assert.match(shown, /Safe Watch/);
  assert.doesNotMatch(shown, /Everwood/);
  assert.match(shown, /Food near Austin/);
  assert.match(shown, /FDA: People at risk/);
  assert.ok((shown.match(/From Qloo/gi) ?? []).length >= 3);
  assert.ok((await page.$$("main article")).length >= 12, "shelves are filled");
});
