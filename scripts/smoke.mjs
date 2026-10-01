import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'dist/static');
if (!existsSync(root)) throw new Error('dist/static missing; run npm run build first');

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = join(root, decodeURIComponent(url.pathname));
  if (!extname(file)) file = join(file, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, '404.html');
  res.setHeader('content-type', contentType(file));
  res.statusCode = file.endsWith('404.html') && !url.pathname.startsWith('/404') ? 404 : 200;
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const failures = [];

async function check(name, fn) {
  try {
    await fn();
    console.log(`ok ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

try {
  await check('desktop routes load without console errors', async () => {
    const page = await browser.newPage({ viewport: { width: 1360, height: 900 } });
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    for (const path of ['/', '/tour', '/pricing', '/docs', '/changelog', '/build']) {
      const res = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      if (res.status() !== 200) throw new Error(`${path} status ${res.status()}`);
      if (await page.locator('h1').count() !== 1) throw new Error(`${path} h1 count`);
      if (path === '/') await page.screenshot({ path: '.screenshots/launchpad-home-desktop.png', fullPage: true });
    }
    if (errors.length) throw new Error(errors.join(' | '));
    await page.screenshot({ path: '.screenshots/launchpad-build-desktop.png', fullPage: true });
    await page.close();
  });

  await check('pricing calculator updates and persists', async () => {
    const page = await browser.newPage();
    await page.goto(`${base}/pricing`, { waitUntil: 'networkidle' });
    await page.locator('#lp-seats').evaluate((el) => { el.value = '30'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.locator('#lp-minutes').evaluate((el) => { el.value = '20'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const price = await page.locator('.price').textContent();
    if (!price.includes('$')) throw new Error('price did not render');
    const stored = await page.evaluate(() => localStorage.getItem('launchpad-pricing'));
    if (!stored || !stored.includes('"seats":30')) throw new Error('pricing state did not persist');
    await page.close();
  });

  await check('pricing calculator recovers from malformed persisted values', async () => {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('launchpad-pricing', JSON.stringify({ seats: 'bad', minutes: {}, retention: -999 }));
    });
    await page.goto(`${base}/pricing`, { waitUntil: 'networkidle' });
    const state = await page.evaluate(() => ({
      seats: document.querySelector('#lp-seats')?.value,
      minutes: document.querySelector('#lp-minutes')?.value,
      retention: document.querySelector('#lp-retention')?.value,
      stored: localStorage.getItem('launchpad-pricing'),
      price: document.querySelector('.price')?.textContent,
    }));
    if (state.seats !== '12') throw new Error(`seats did not default to 12: ${JSON.stringify(state)}`);
    if (state.minutes !== '8') throw new Error(`minutes did not default to 8: ${JSON.stringify(state)}`);
    if (state.retention !== '7') throw new Error(`retention did not clamp to 7: ${JSON.stringify(state)}`);
    if (!state.stored?.includes('"retention":7')) throw new Error(`sanitized state was not persisted: ${JSON.stringify(state)}`);
    if (!state.price?.includes('$')) throw new Error(`price missing after recovery: ${JSON.stringify(state)}`);
    await page.close();
  });

  await check('pricing calculator works when browser storage is denied', async () => {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      const denied = () => { throw new DOMException('denied', 'SecurityError'); };
      Storage.prototype.getItem = denied;
      Storage.prototype.setItem = denied;
    });
    await page.goto(`${base}/pricing`, { waitUntil: 'networkidle' });
    if (await page.locator('#lp-seats').count() !== 1) throw new Error('pricing island did not mount');
    await page.locator('#lp-seats').evaluate((el) => { el.value = '30'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    const state = await page.evaluate(() => ({
      seats: document.querySelector('#lp-seats')?.value,
      price: document.querySelector('.price')?.textContent,
      storageNoteHidden: document.querySelector('.storage-note')?.hidden,
    }));
    if (state.seats !== '30') throw new Error(`seats did not update with storage denied: ${JSON.stringify(state)}`);
    if (!state.price?.includes('$')) throw new Error(`price missing with storage denied: ${JSON.stringify(state)}`);
    if (state.storageNoteHidden !== false) throw new Error(`storage fallback note not visible: ${JSON.stringify(state)}`);
    await page.close();
  });

  await check('mobile tour remains usable', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 820 }, isMobile: true });
    await page.goto(`${base}/tour`, { waitUntil: 'networkidle' });
    await page.locator('.tour-button').nth(2).click();
    const metric = await page.locator('.metric').last().textContent();
    if (!metric.includes('9 min')) throw new Error(`unexpected tour metric: ${metric}`);
    await page.screenshot({ path: '.screenshots/launchpad-mobile.png', fullPage: true });
    await page.close();
  });

  await check('unknown path returns genuine 404', async () => {
    const res = await fetch(`${base}/missing`);
    const html = await res.text();
    if (res.status !== 404) throw new Error(`status ${res.status}`);
    if (!html.includes('This release lane does not exist')) throw new Error('404 copy missing');
  });
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

function contentType(file) {
  if (file.endsWith('.css')) return 'text/css';
  if (file.endsWith('.js')) return 'text/javascript';
  if (file.endsWith('.xml')) return 'application/xml';
  if (file.endsWith('.txt')) return 'text/plain';
  return 'text/html; charset=utf-8';
}
