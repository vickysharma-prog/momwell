// Her baby's check-in in a real browser: three weeks after birth, no wet diaper in 8 hours and 100.6°F means call the
// baby's doctor now; her partner is alerted about the baby and can open what she reported.
// Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../lib/people/test-people.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person, partner: Person;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  [mom, partner] = await Promise.all([person("mother", "Maya"), person("circle", "Sam")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  const { error } = await admin.from("mothers").insert({ id: mom.id, birth_date: new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10) });
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

test("she checks on her baby; the baby rules decide; her partner is told about the baby", async () => {
  const her = await signIn(mom);
  await shows(her, "Check on your baby");
  await her.goto(`${base}/baby`, { timeout: 60_000 });
  await shows(her, "3 weeks old");
  assert.ok(await her.$("input[value=baby_newborn_sick]"), "the newborn sign shows in the first month");
  await her.$eval("input[value=baby_dry]", (i) => (i as HTMLInputElement).click());
  await her.type("input[name=temp]", "100.6");
  await Promise.all([her.waitForNavigation({ timeout: 60_000 }), her.$eval("main form button.btn", (b) => (b as HTMLButtonElement).click())]);
  await shows(her, "Call your baby’s doctor now");
  await shows(her, "under 3 months with a temperature of 100.6°F");
  await her.$eval("main details", (d) => ((d as HTMLDetailsElement).open = true));
  await shows(her, "About her baby");

  const him = await signIn(partner);
  await shows(him, "Maya was told to call the baby’s doctor");
  await him.click("main a[href^='/check-in/']");
  await shows(him, "no wet diaper in 8 hours");
});
