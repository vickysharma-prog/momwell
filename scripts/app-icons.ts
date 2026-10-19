// Makes the app icons from the logo: the italic Fraunces m with its honey heart on evergreen. Renders in Chrome so
// the real font is used. 192 and 512 for Android, a maskable 512 with room for round masks, 180 for iPhone, and a
// 32 favicon without the heart (it blurs that small). Run: node scripts/app-icons.ts
import puppeteer from "puppeteer-core";

const HEART = "M12 21C5 15 2 11.5 2 8c0-3 2.5-5 5-5 2 0 4 1.2 5 3 1-1.8 3-3 5-3 2.5 0 5 2 5 5 0 3.5-3 7-10 13z";
const page = (size: number, { radius, scale, heart }: { radius: number; scale: number; heart: boolean }) => `<html><head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@1,9..144,500,100&display=block" rel="stylesheet">
<style>body{margin:0;background:transparent}div{width:${size}px;height:${size}px;border-radius:${radius * size}px;background:#0E4A47;position:relative;display:flex;align-items:center;justify-content:center}
span{font-family:Fraunces;font-style:italic;font-weight:500;font-variation-settings:'SOFT' 100,'opsz' 144;color:#fff;font-size:${0.8 * scale * size}px;line-height:1;padding-bottom:${0.13 * scale * size}px}
svg{position:absolute;right:${50 - 35 * scale}%;top:${50 - 39 * scale}%;width:${0.23 * scale * size}px;height:${0.23 * scale * size}px}</style></head>
<body><div><span>m</span>${heart ? `<svg viewBox="0 0 24 24"><path d="${HEART}" fill="#F2B84B"/></svg>` : ""}</div></body></html>`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const tab = await browser.newPage();
const out = (name: string) => new URL(`../public/icons/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const shots: [string, number, { radius: number; scale: number; heart: boolean }][] = [
  ["icon-192.png", 192, { radius: 0.22, scale: 1, heart: true }],
  ["icon-512.png", 512, { radius: 0.22, scale: 1, heart: true }],
  ["maskable-512.png", 512, { radius: 0, scale: 0.72, heart: true }],
  ["apple-180.png", 180, { radius: 0, scale: 1, heart: true }],
  ["favicon-32.png", 32, { radius: 0.22, scale: 1.05, heart: false }],
];
for (const [name, size, opts] of shots) {
  await tab.setViewport({ width: size, height: size });
  await tab.setContent(page(size, opts), { waitUntil: "load" });
  await tab.evaluate(async () => { await document.fonts.load("italic 500 40px Fraunces"); await document.fonts.ready; });
  await tab.screenshot({ path: out(name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log("icons made");
