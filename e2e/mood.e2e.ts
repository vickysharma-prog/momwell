// The mood check in a real browser: two calm answers end it; a positive PHQ-2 opens all nine, and a score of 10 or
// more says talk to her doctor; any thought of harm goes to the crisis screen and alerts her care team.
// Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../lib/people/test-people.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person, doctor: Person;
let page: Page;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  [mom, doctor] = await Promise.all([person("mother", "Maya"), person("care_team", "Dr Lee")]);
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  page = await (await browser.createBrowserContext()).newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", mom.email);
  await page.type("input[name=password]", mom.password);
  await Promise.all([page.waitForNavigation({ timeout: 60_000 }), page.click("button.btn")]);
});
after(async () => {
  await browser?.close();
  await removeAll();
});

const shows = (text: string) => page.waitForFunction((t) => document.querySelector("main")?.innerText.includes(t), { polling: 200, timeout: 60_000 }, text);
const answer = async (values: number[]) => {
  for (const [i, v] of values.entries()) await page.$eval(`input[name=q${i}][value="${v}"]`, (el) => (el as HTMLInputElement).click());
};
const start = async () => {
  await page.goto(`${base}/mood`, { timeout: 60_000 });
  await shows("Over the last two weeks");
};

test("two calm answers: nothing to act on", async () => {
  await start();
  await answer([1, 1]);
  await page.click("main form button.btn");
  await shows("Nothing here to act on today");
});

test("a positive PHQ-2 opens all nine; 11 says talk to her doctor and lists her for a call", async () => {
  await start();
  await answer([2, 1]);
  await page.click("main form button.btn"); // A few more questions
  await shows("Thoughts that you would be better off dead");
  await shows("we treat it as an urgent warning sign");
  await answer([2, 2, 1, 2, 1, 1, 1, 1, 0]);
  await page.click("main form button.btn");
  await shows("talking with your doctor or midwife this week");
  const { data } = await admin.from("moods").select("kind, score, level").eq("mother_id", mom.id).order("created_at", { ascending: false }).limit(1).single();
  assert.deepEqual(data, { kind: "phq9", score: 11, level: "call_doctor" });
});

test("any thought of harm: the crisis screen, and an urgent alert to her care team without her answers", async () => {
  await start();
  await answer([2, 2]);
  await page.click("main form button.btn");
  await shows("Thoughts that you would be better off dead");
  await answer([2, 2, 0, 0, 0, 0, 0, 0, 1]);
  await Promise.all([page.waitForNavigation({ timeout: 60_000 }), page.click("main form button.btn")]);
  assert.match(page.url(), /\/check-in\/[0-9a-f-]{36}$/);
  await shows("988");
  const { data: alerts } = await admin.from("alerts").select("level, checkin:checkins(source, signs, note)").eq("mother_id", mom.id);
  assert.deepEqual(alerts, [{ level: "urgent", checkin: { source: "mood", signs: ["harm_thoughts"], note: "" } }]);
});
