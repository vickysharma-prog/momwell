// Phone-size screenshots of the main screens with synthetic people, removed after.
// Run: node --env-file=.env.local scripts/screens.ts <base url> <out dir>
import puppeteer from "puppeteer-core";
import { defaultSees } from "../lib/people/access.ts";
import { invite, person, removeAll } from "../lib/people/test-people.ts";

const [base = "http://localhost:3000", out = "."] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
try {
  const mom = await person("mother", "Maya");
  const partner = await person("circle", "Sam");
  await partner.db.rpc("accept_invite", { t: await invite(mom, { from_id: mom.id, kind: "circle", partner: true, relation: "husband", sees: defaultSees({ kind: "circle", partner: true }) }) });
  const page = await (await browser.createBrowserContext()).newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: process.env.SCHEME ?? "light" }]);
  const shot = (name: string) => page.screenshot({ path: `${out}/${name}.png`, fullPage: true });

  await page.goto(`${base}/signup`);
  await shot("1-signup");
  await page.goto(`${base}/login`);
  await page.type("input[name=email]", mom.email);
  await page.type("input[name=password]", mom.password);
  await Promise.all([page.waitForNavigation(), page.click("button.btn")]);
  await shot("2-home");
  await page.goto(`${base}/check-in`);
  await shot("3-checkin");
  await page.click("input[value=headache]");
  await page.type("input[name=systolic]", "162");
  await page.type("input[name=diastolic]", "104");
  await page.click("form:has(input[name=signs]) button.btn");
  await page.waitForSelector("section[aria-live=assertive]");
  await shot("4-red");
  await page.goto(`${base}/check-in`);
  await page.click("input[value=harm_thoughts]");
  await page.click("form:has(input[name=signs]) button.btn");
  await page.waitForSelector("section[aria-live=assertive]");
  await shot("5-crisis");
} finally {
  await browser.close();
  await removeAll();
}
