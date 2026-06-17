import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const URL = 'http://localhost:3000/Atelier-Image/';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', '.playwright-output');

const label = process.argv[2] || 'before';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: {
    origins: [{ origin: 'http://localhost:3000', localStorage: [{ name: 'gemini_api_key', value: 'test-key-not-real' }] }],
    cookies: [],
  },
});
const page = await ctx.newPage();
const consoleMsgs = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.atelier-sidebar', { timeout: 10000 });

const addBtn = page.getByRole('button', { name: /^Add$/ });
for (let i = 0; i < 12; i++) {
  await addBtn.click();
}

const promptCount = await page.locator('.prompt-panel').count();
const sidebarBody = page.locator('.atelier-sidebar-body');
const sidebarBodyBox = await sidebarBody.boundingBox();

const metrics = await page.evaluate(() => {
  const body = document.querySelector('.atelier-sidebar-body');
  const sidebar = document.querySelector('.atelier-sidebar');
  const panels = Array.from(document.querySelectorAll('.prompt-panel'));
  const panelRects = panels.map((p, i) => {
    const r = p.getBoundingClientRect();
    return { i, top: r.top, bottom: r.bottom, height: r.height };
  });
  let overlaps = 0;
  for (let i = 1; i < panelRects.length; i++) {
    if (panelRects[i].top < panelRects[i - 1].bottom - 1) overlaps++;
  }
  return {
    sidebar: sidebar ? { clientHeight: sidebar.clientHeight, scrollHeight: sidebar.scrollHeight } : null,
    sidebarBody: body ? { clientHeight: body.clientHeight, scrollHeight: body.scrollHeight, scrollTop: body.scrollTop, canScroll: body.scrollHeight > body.clientHeight } : null,
    firstPanel: panelRects[0],
    lastPanel: panelRects[panelRects.length - 1],
    overlaps,
    panelCount: panels.length,
  };
});

let typeResult = 'not attempted';
try {
  const lastTextarea = page.locator('.prompt-panel textarea').last();
  await lastTextarea.scrollIntoViewIfNeeded({ timeout: 2000 });
  await lastTextarea.click({ timeout: 2000 });
  await lastTextarea.fill('hello from last prompt');
  const value = await lastTextarea.inputValue();
  typeResult = value === 'hello from last prompt' ? 'OK' : `mismatch: "${value}"`;
} catch (e) {
  typeResult = `FAIL: ${e.message.split('\n')[0]}`;
}

await page.screenshot({ path: path.join(outDir, `${label}-full.png`), fullPage: true });
const sidebar = page.locator('.atelier-sidebar');
await sidebar.screenshot({ path: path.join(outDir, `${label}-sidebar.png`) });

console.log(JSON.stringify({
  label, URL, promptCount, sidebarBodyBox, metrics, typeResult,
  consoleErrors: consoleMsgs.filter(m => m.startsWith('[error]')),
}, null, 2));

await browser.close();
