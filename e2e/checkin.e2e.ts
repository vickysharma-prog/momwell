// The daily check-in in a real browser: a warning sign gets the red screen, her partner gets an alert without the
// detail, her doctor sees it and marks it seen, and she sees that. Thoughts of harm bring up the crisis lines.
// Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { invite, person, removeAll, type Person } from "../lib/people/test-people.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person, partner: Person, doctor: Person;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  [mom, partner, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
});
after(async () => {
  await browser?.close();
  await removeAll();
});

async function signIn(who: Person): Promise<Page> {
  const page = await (await browser.createBrowserContext()).newPage();
  await page.bringToFront();
  await page.setViewport({ width: 390, height: 844 });
  // Motion off, as for people who ask their phone for less: clicks never land mid-animation.
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", who.email);
  await page.type("input[name=password]", who.password);
  await Promise.all([page.waitForNavigation(), page.click("button.btn")]);
  return page;
}
// Polls on a timer: a page that isn't painting (headless, behind another tab) never runs animation-frame polling.
const until = (page: Page, selector: string) => page.waitForFunction((q) => !!document.querySelector(q), { polling: 200, timeout: 60_000 }, selector);
const text = (page: Page) => page.$eval("main", (m) => (m as HTMLElement).innerText);
// The result arrives by a client-side redirect after the server action, so wait for the result itself.
async function done(page: Page) {
  await page.click("form:has(input[name=signs]) button.btn");
  await until(page, "section[aria-live=assertive]");
}

let m: Page;

test("a headache and high blood pressure bring up the red screen", async () => {
  m = await signIn(mom);
  // Links move by client-side navigation: wait for the next screen itself.
  await m.click("main a[href='/check-in']");
  await until(m, "input[name=signs]");
  // No dates yet: every sign shows, including both bleeding signs.
  assert.equal(await m.$$eval("input[name=signs]", (x) => x.length), 15);
  await m.click("input[value=headache]");
  await m.type("input[name=systolic]", "150");
  await m.type("input[name=diastolic]", "95");
  await done(m);
  const shown = await text(m);
  assert.match(shown, /Get medical care now/);
  assert.match(shown, /headache that won't go away/i);
  assert.match(shown, /150\/95/);
  assert.ok(await m.$("a[href='tel:911']"));
  assert.doesNotMatch(shown, /988/);
});

test("her partner is told to check on her, without the detail", async () => {
  const p = await signIn(partner);
  const shown = await text(p);
  assert.match(shown, /Maya needs you to check on her now/);
  assert.doesNotMatch(shown, /headache|150\/95|What she reported/i);
});

test("her doctor sees what she reported and marks it seen; she sees that", async () => {
  const d = await signIn(doctor);
  assert.match(await text(d), /Maya needs you to check on her now/);
  await d.click("main a[href^='/check-in/']");
  await until(d, "section[aria-live=assertive]");
  assert.match(await text(d), /150\/95/);
  await d.goBack();
  await Promise.all([d.waitForResponse((r) => r.request().method() === "POST"), d.click("section[aria-label=Alerts] form button")]);
  await m.goto(`${base}/home`);
  assert.match(await text(m), /Seen by Dr Lee/);
});

test("thoughts of harm bring up 988 and the maternal hotline", async () => {
  await m.goto(`${base}/check-in`);
  await m.click("input[value=harm_thoughts]");
  await done(m);
  assert.ok(await m.$("a[href='tel:988']"));
  assert.ok(await m.$("a[href='tel:1-833-852-6262']"));
});

test("with a birth date, only the signs for after birth show", async () => {
  await m.goto(`${base}/check-in`);
  const born = new Date(Date.now() - 10 * 86_400_000).toISOString().slice(0, 10);
  await m.$eval("input[name=birth_date]", (el, v) => ((el as HTMLInputElement).value = v), born);
  await Promise.all([m.waitForResponse((r) => r.request().method() === "POST"), m.click("form:has(input[name=birth_date]) button")]);
  await m.reload();
  assert.match(await text(m), /10 days since your baby was born/);
  const ids = await m.$$eval("input[name=signs]", (x) => x.map((i) => (i as HTMLInputElement).value));
  assert.ok(ids.includes("bleeding_after") && !ids.includes("baby_movement"));
});

test("nothing to report is a thank-you, not an alarm", async () => {
  await m.goto(`${base}/check-in`);
  await done(m);
  assert.match(await text(m), /Thank you for checking in/);
  assert.equal(await m.$("a[href='tel:911']"), null);
});

test("a note with nothing tapped is not called a clear day, and points back to the list", async () => {
  await m.goto(`${base}/check-in`);
  await m.type("textarea[name=note]", "chest pain since this morning");
  await done(m);
  const shown = await text(m);
  assert.doesNotMatch(shown, /Nothing you told us/);
  assert.match(shown, /not what you wrote/);
  assert.match(shown, /You wrote\s+chest pain since this morning/);
  assert.ok(await m.$("a[href='/check-in']"));
});
