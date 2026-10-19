// The invite flow in a real browser against the running app: a mother signs up, invites her partner, the partner
// signs up from the link and lands linked to her; then she narrows what he sees and removes him.
// Run with the app up: npm run e2e  (E2E_URL defaults to http://localhost:3000)
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { createClient } from "@supabase/supabase-js";

const base = process.env.E2E_URL ?? "http://localhost:3000";
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const run = crypto.randomUUID().slice(0, 8);
const password = crypto.randomUUID();
const mom = `momwell.e2e.mom.${run}@example.com`;
const partner = `momwell.e2e.partner.${run}@example.com`;

let browser: Browser;
before(async () => {
  browser = await puppeteer.launch({ executablePath: chrome, headless: true });
});
after(async () => {
  await browser?.close();
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const u of data.users.filter((u) => u.email?.includes(run))) await admin.auth.admin.deleteUser(u.id);
});

async function fresh(): Promise<Page> {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 390, height: 844 });
  // Motion off, as for people who ask their phone for less: clicks never land mid-animation.
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  return page;
}

async function signUp(page: Page, name: string, email: string) {
  await page.type("input[name=name]", name);
  await page.type("input[name=email]", email);
  await page.type("input[name=password]", password);
  await Promise.all([page.waitForNavigation(), page.click("button.btn")]);
}

const text = (page: Page) => page.$eval("main", (m) => (m as HTMLElement).innerText);

test("a mother invites her partner and he joins her circle", async () => {
  const m = await fresh();
  await m.goto(`${base}/signup?role=mother`);
  await signUp(m, "Maya", mom);
  assert.equal(new URL(m.url()).pathname, "/home");
  assert.match(await text(m), /Hi, Maya/);

  await m.goto(`${base}/people`);
  await m.type("input[name=relation]", "husband");
  await m.click("input[name=partner]");
  await Promise.all([m.waitForResponse((r) => r.request().method() === "POST"), m.click("form:has(input[name=relation]) button.btn")]);
  await m.waitForFunction(() => document.body.innerText.includes("Partner · waiting"));

  const { data: invite } = await admin.from("invites").select("token, from_id").eq("partner", true).eq("relation", "husband").order("created_at", { ascending: false }).limit(1).single();
  const p = await fresh();
  await p.goto(`${base}/join/${invite!.token}`);
  assert.match(await text(p), /Maya invited you to her circle/);
  await Promise.all([p.waitForNavigation(), p.click("a.btn")]);
  assert.equal(await p.$$eval("input[name=role]", (r) => r.map((x) => (x as HTMLInputElement).value).join()), "circle");
  await signUp(p, "Sam", partner);
  assert.equal(new URL(p.url()).pathname, "/home");
  assert.match(await text(p), /Maya/);
  await p.goto(`${base}/people`);
  assert.match(await text(p), /Maya\s+partner/);
  assert.match(await text(p), /Urgent alerts/);

  // The mother takes alerts away: the partner's page no longer lists them.
  await m.reload();
  await m.waitForFunction(() => document.body.innerText.includes("What Sam sees"));
  await m.click("input[name=alerts]");
  await Promise.all([m.waitForResponse((r) => r.request().method() === "POST"), m.click("form:has(input[name=alerts]) button.btn-quiet")]);
  await p.reload();
  assert.doesNotMatch(await text(p), /Urgent alerts/);

  // And removes him: he no longer sees her.
  await m.reload();
  await Promise.all([m.waitForResponse((r) => r.request().method() === "POST"), m.click("article form button")]);
  await p.reload();
  assert.match(await text(p), /Nobody yet/);
});

test("a used invite link says so", async () => {
  const { data } = await admin.from("invites").select("token").not("accepted_by", "is", null).limit(1);
  const page = await fresh();
  await page.goto(`${base}/join/${data?.[0]?.token ?? crypto.randomUUID()}`);
  assert.match(await text(page), /expired or was already used/);
});

test("signed-out visitors are sent to sign in", async () => {
  const page = await fresh();
  await page.goto(`${base}/home`);
  assert.equal(new URL(page.url()).pathname, "/login");
});

test("a clinician's invite shows the mother what they will see before she accepts", async () => {
  const doc = await fresh();
  await doc.goto(`${base}/signup?role=care_team`);
  await signUp(doc, "Dr Lee", `momwell.e2e.doc.${run}@example.com`);
  await doc.goto(`${base}/people`);
  await doc.type("input[name=relation]", "OB-GYN");
  await Promise.all([doc.waitForResponse((r) => r.request().method() === "POST"), doc.click("form:has(input[name=relation]) button.btn")]);
  await doc.waitForFunction(() => document.body.innerText.includes("OB-GYN · waiting"));

  const { data } = await admin.from("invites").select("token").eq("relation", "OB-GYN").order("created_at", { ascending: false }).limit(1).single();
  const page = await fresh();
  await page.goto(`${base}/join/${data!.token}`);
  const shown = await text(page);
  assert.match(shown, /Dr Lee invited you to Momwell as their patient/);
  assert.match(shown, /Dr Lee will see[\s\S]*Mood screening/);
});
