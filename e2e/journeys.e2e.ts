// The journeys the other browser tests don't walk: she widens what her partner sees; a reading that can't be right;
// asks taken, finished and taken back, with places from Qloo for a dinner ask; her mood check in her doctor's queue;
// telling Momwell in her own words; the landing page; and a judge's whole demo, as Maya, Sam and Dr Lee, before and
// after the birth. Run with the app up: npm run e2e
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { admin, invite, person, removeAll, type Person } from "../lib/people/test-people.ts";
import { search } from "../lib/qloo/api.ts";
import { scoreMood } from "../lib/safety/mood.ts";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
let browser: Browser;
let mom: Person, partner: Person, doctor: Person;
let her: Page, him: Page, doc: Page;

before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  [mom, partner, doctor] = await Promise.all([person("mother", "Maya"), person("circle", "Sam"), person("care_team", "Dr Lee")]);
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, sees: defaultSees({ kind: "circle", partner: true }) }) });
  await doctor.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "care_team", sees: defaultSees({ kind: "care_team" }) }) });
  const [gg] = await search("Gilmore Girls", 1, "urn:entity:tv_show");
  const due = new Date(Date.now() + 10 * 7 * 86_400_000).toISOString().slice(0, 10);
  for (const r of [
    await admin.from("mothers").insert({ id: mom.id, due_date: due }),
    await admin.from("profiles").update({ phone: "5125550117" }).eq("id", partner.id),
    await admin.from("profiles").update({ phone: "5125550190" }).eq("id", doctor.id),
    await admin.from("tastes").insert({ mother_id: mom.id, city: "Austin, TX", diets: ["vegetarian"], liked: [{ id: gg.entity_id, name: gg.name, kind: "tv_show" }] }),
  ])
    if (r.error) throw r.error;
  [her, him, doc] = await Promise.all([signIn(mom), signIn(partner), signIn(doctor)]);
});
after(async () => {
  await browser?.close();
  await removeAll();
});

async function open(): Promise<Page> {
  const page = await (await browser.createBrowserContext()).newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  return page;
}
async function signIn(who: Person): Promise<Page> {
  const page = await open();
  await page.goto(`${base}/login`, { timeout: 90_000 });
  await page.type("input[name=email]", who.email);
  await page.type("input[name=password]", who.password);
  await Promise.all([page.waitForNavigation({ timeout: 90_000 }), page.click("button.btn")]);
  return page;
}
const shows = (page: Page, text: string | RegExp, timeout = 60_000) =>
  page.waitForFunction((t, flags) => (flags !== null ? new RegExp(t, flags).test(document.body.innerText) : document.body.innerText.includes(t)), { polling: 250, timeout }, text instanceof RegExp ? text.source : text, text instanceof RegExp ? text.flags : null);
const go = (page: Page, path: string) => page.goto(`${base}${path}`, { timeout: 90_000 });
const click = (page: Page, selector: string) => page.$eval(selector, (el) => (el as HTMLElement).click());
async function checkIn(page: Page, fill: () => Promise<void>) {
  await go(page, "/check-in");
  await page.waitForSelector("input[name=signs]", { timeout: 60_000 });
  await fill();
  await click(page, "form:has(input[name=signs]) button.btn");
  await page.waitForSelector("section[aria-live=assertive]", { timeout: 60_000 });
}

test("each person's Today opens with Momwell's guide for them", async () => {
  await shows(her, /, Maya. I’m Momwell. How are you feeling today?/);
  await shows(him, "If she ever needs you, you'll see it here first");
  await shows(doc, "Whoever needs a look first is at the top");
});

test("a reading that can't be right is asked again, never called fine", async () => {
  await checkIn(her, () => her.type("input[name=temp]", "37.5"));
  await shows(her, "Let’s check that again");
  assert.equal((await admin.from("alerts").select("id").eq("mother_id", mom.id)).data?.length, 0);
});

test("she shares her check-ins with her partner; after her next warning sign he can read what she reported", async () => {
  await go(her, "/people");
  await her.waitForSelector("form:has(input[name=checkins]) input[name=checkins]", { timeout: 60_000 });
  await click(her, "form:has(input[name=checkins]) input[name=checkins]");
  await Promise.all([her.waitForResponse((r) => r.request().method() === "POST", { timeout: 60_000 }), click(her, "form:has(input[name=checkins]) button")]);
  const { data } = await admin.from("links").select("sees").eq("person_id", partner.id).single();
  assert.ok(data!.sees.includes("checkins"));

  await checkIn(her, () => click(her, "input[value=headache]"));
  await shows(her, "Call your doctor now.");
  // Her doctor is the first button and her partner is one tap away; 911 stays on the screen.
  assert.equal(await her.$eval("section[aria-live=assertive] a.btn", (a) => [a.textContent, a.getAttribute("href")].join(" ")), "Call Dr Lee tel:5125550190");
  assert.ok(await her.$("section[aria-live=assertive] a[href='tel:5125550117']"));
  assert.ok(await her.$("section[aria-live=assertive] a[href='tel:911']"));
  await go(him, "/home");
  await shows(him, "Maya needs you to check on her now");
  await click(him, "main a[href^='/check-in/']");
  await shows(him, /headache/i);
});

test("asks: he takes groceries and finishes; she takes back one nobody needs; a dinner ask comes with places from Qloo", async () => {
  for (const [kind, note] of [["groceries", "Milk and bread"], ["meal", "Something warm"], ["ride", "Not needed after all"]]) {
    await go(her, "/help");
    await her.waitForSelector(`input[value=${kind}]`, { timeout: 60_000 });
    await click(her, `input[value=${kind}]`);
    await her.type("input[name=note]", note);
    await click(her, "main form button.btn");
    await shows(her, "Sent to your people.");
  }
  await go(her, "/help");
  await shows(her, "Not needed after all");
  const ride = await her.$$eval("main article", (as) => as.findIndex((a) => (a as HTMLElement).innerText.includes("Not needed after all")));
  await her.$$eval("main article", (as, i) => (as[i].querySelector("form:last-of-type button") as HTMLButtonElement).click(), ride);
  await her.waitForFunction(() => !document.body.innerText.includes("Not needed after all"), { timeout: 60_000, polling: 250 });

  await go(him, "/help");
  // The label is in capitals (CSS), and innerText reads it as shown.
  await shows(him, /Places she’d love · from Qloo/i, 90_000);
  const groceries = await him.$$eval("main article", (as) => as.findIndex((a) => (a as HTMLElement).innerText.includes("Milk and bread")));
  await him.$$eval("main article", (as, i) => (as[i].querySelector("button.btn") as HTMLButtonElement).click(), groceries);
  await shows(him, "You’re on it");
  await him.$$eval("main article", (as) => {
    const a = as.find((x) => (x as HTMLElement).innerText.includes("Milk and bread"))!;
    [...a.querySelectorAll("button")].find((b) => b.textContent === "Done")!.click();
  });
  await go(her, "/help");
  await shows(her, /Done lately: .* by Sam/);
});

test("her doctor sees a positive mood check in the queue and on her page", async () => {
  await go(doc, "/home");
  await shows(doc, "Maya");
  // Her warning sign comes first; once it's seen, the mood check is the reason to call.
  await admin.from("alerts").update({ seen_at: new Date().toISOString(), seen_by: doctor.id }).eq("mother_id", mom.id);
  const answers = [2, 2, 1, 2, 1, 1, 1, 1, 0];
  const r = scoreMood(answers);
  await admin.from("moods").insert({ mother_id: mom.id, kind: r.kind, answers, score: r.score, level: r.level, engine_version: r.version });
  await go(doc, "/home");
  await shows(doc, "Mood check suggests a talk");
  await go(doc, `/patients/${mom.id}`);
  await shows(doc, "PHQ-9: 11 of 27, moderate");
});

test("she tells Momwell in her own words, and the rules answer", async () => {
  await go(her, "/talk");
  await her.waitForSelector("textarea", { timeout: 60_000 });
  await her.type("textarea", "I've had a pounding headache all day and my blood pressure was 150/96");
  await click(her, "button[aria-label=Send]");
  await shows(her, /Call your doctor now|Call 911 now/, 120_000);
});

test("the landing page leads to the demo", async () => {
  const page = await open();
  await go(page, "/");
  await shows(page, "From first heartbeat to first birthday, Momwell keeps watch.");
  assert.ok(await page.$("a[href='/demo']"));
  await page.close();
});

test("a judge's demo: Maya, then Sam, then Dr Lee, then six weeks after the birth", async () => {
  const page = await open();
  await go(page, "/demo");
  await click(page, "form button.btn");
  await page.waitForSelector("[aria-label='Where Maya is'] button", { timeout: 90_000 });
  await shows(page, "Hi, Maya");
  const as = async (who: number, text: string) => {
    await page.$$eval("[aria-label='Switch person'] button", (bs, i) => (bs[i] as HTMLButtonElement).click(), who);
    await shows(page, text, 90_000);
  };
  await as(1, "Hi, Sam");
  await shows(page, "Maya needs you to check on her now");
  await as(2, "Sorted by who needs you first");
  await shows(page, "Maya");
  await as(0, "Hi, Maya");
  await page.$$eval("[aria-label='Where Maya is'] button", (bs) => (bs[1] as HTMLButtonElement).click());
  await shows(page, "6 weeks old", 90_000);
  await page.close();
});
