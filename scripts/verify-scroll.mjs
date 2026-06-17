import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const URL = 'http://localhost:3000/Atelier-Image/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', '.playwright-output');

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: {
    origins: [{ origin: 'http://localhost:3000', localStorage: [{ name: 'gemini_api_key', value: 'test-key-not-real' }] }],
    cookies: [],
  },
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.atelier-sidebar');

const addBtn = page.getByRole('button', { name: /^Add$/ });
for (let i = 0; i < 12; i++) await addBtn.click();

await page.evaluate(() => {
  const body = document.querySelector('.atelier-sidebar-body');
  body.scrollTop = body.scrollHeight;
});
await page.waitForTimeout(150);

const scrolled = await page.evaluate(() => {
  const body = document.querySelector('.atelier-sidebar-body');
  return { scrollTop: body.scrollTop, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight };
});

const lastTextareaRect = await page.locator('.prompt-panel textarea').last().evaluate(el => {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, height: r.height, visible: r.bottom > 60 && r.top < window.innerHeight };
});

let mouseTypeResult;
try {
  await page.locator('.prompt-panel textarea').last().click({ timeout: 2000, position: { x: 30, y: 30 } });
  await page.keyboard.type('typed by user after scroll');
  const v = await page.locator('.prompt-panel textarea').last().inputValue();
  mouseTypeResult = v === 'typed by user after scroll' ? 'OK' : `mismatch: "${v}"`;
} catch (e) {
  mouseTypeResult = `FAIL: ${e.message.split('\n')[0]}`;
}

await page.screenshot({ path: path.join(outDir, 'after-scrolled.png'), fullPage: false });

console.log(JSON.stringify({ scrolled, lastTextareaRect, mouseTypeResult }, null, 2));
await browser.close();
