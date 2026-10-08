import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'dist/static');
const routes = JSON.parse(readFileSync('dist/manifest.json', 'utf8')).pages.map(page => page.urlPattern);
const evidence = process.env.VISUAL_EVIDENCE_DIR || mkdtempSync(join(tmpdir(), 'starter-visual-'));
mkdirSync(evidence, { recursive: true });
const server = createServer((req, res) => {
  let file = join(root, new URL(req.url, 'http://local').pathname);
  if (!extname(file)) file = join(file, 'index.html');
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, '404.html');
  res.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  res.end(readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch();
const records = [];
async function verifyTimeline(page) {
  const bars = await page.locator('.build-timeline li').evaluateAll(rows => rows.map(row => {
    const bar = getComputedStyle(row, '::before');
    return {
      expectedPercent: parseFloat(row.style.getPropertyValue('--bar')),
      renderedPercent: parseFloat(bar.width) / row.clientWidth * 100,
      content: bar.content,
      position: bar.position,
      background: bar.backgroundColor,
      foreground: [...row.children].every(child => getComputedStyle(child).position === 'relative'),
    };
  }));
  for (const bar of bars) {
    assert.equal(bar.content, '""', 'duration bar exists');
    assert.equal(bar.position, 'absolute', 'duration bar positioned within row');
    assert.notEqual(bar.background, 'rgba(0, 0, 0, 0)', 'duration bar visible');
    assert.ok(Math.abs(bar.expectedPercent - bar.renderedPercent) < 1, 'duration bar encodes source percent');
    assert.ok(bar.foreground, 'timeline labels remain above duration bar');
  }
}
async function verifyTourTypography(page) {
  const labels = await page.locator('.tour-button strong, .tour-button p').evaluateAll(nodes => nodes.map(node => {
    const style = getComputedStyle(node);
    return { tag: node.tagName, size: style.fontSize, weight: style.fontWeight, font: style.fontFamily };
  }));
  for (const label of labels) {
    assert.equal(label.size, '14px', 'stage control typography size');
    assert.equal(label.weight, label.tag === 'STRONG' ? '600' : '400', 'stage control typography weight');
    assert.ok(label.font.includes('Avenir Next'), 'stage control uses shared sans');
  }
}
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    for (const [index, route] of routes.entries()) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1, route + ' heading');
      const navLinks = await page.locator('.nav a').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), current: link.getAttribute('aria-current') })));
      const expectedCurrent = navLinks.find(link => link.href === route)?.href
        || navLinks.find(link => link.href !== '/' && route.startsWith(link.href + '/'))?.href
        || (route.startsWith('/sessions/') && navLinks.some(link => link.href === '/agenda') ? '/agenda' : undefined);
      assert.deepEqual(navLinks.filter(link => link.current).map(link => ({ href: link.href, current: link.current })), expectedCurrent ? [{ href: expectedCurrent, current: expectedCurrent === route ? 'page' : 'location' }] : [], route + ' current navigation token');
      assert.ok((await page.locator('main').textContent()).trim().length > 50, route + ' meaningful content');
      await verifyTimeline(page);
      await verifyTourTypography(page);
      const metrics = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        const h1 = getComputedStyle(document.querySelector('h1'));
        const controls = [...document.querySelectorAll('button, input:not([type=hidden]), select, textarea, .nav a, .button, .brand')].filter(node => !node.hidden && node.getBoundingClientRect().height > 0);
        return {
          title: document.title,
          width: document.documentElement.scrollWidth,
          bodySize: body.fontSize,
          bodyLineHeight: body.lineHeight,
          font: body.fontFamily,
          headingSize: parseFloat(h1.fontSize),
          controls: controls.map(node => ({ label: (node.textContent || node.tagName).slice(0, 60), wordmark: node.matches('.brand'), size: getComputedStyle(node).fontSize, height: node.getBoundingClientRect().height })),
        };
      });
      assert.ok(metrics.title.length > 2, route + ' title');
      assert.ok(metrics.width <= viewport.width, route + ' horizontal overflow');
      assert.equal(metrics.bodySize, '16px', route + ' body size');
      assert.equal(metrics.bodyLineHeight, '25.6px', route + ' body rhythm');
      assert.ok(metrics.font.includes('Avenir Next') && metrics.font.includes('Segoe UI Variable'), route + ' local shared font');
      assert.ok(metrics.headingSize <= (viewport.width === 390 ? 32 : 48), route + ' bounded heading');
      for (const control of metrics.controls) {
        if (!control.wordmark) assert.equal(control.size, '14px', route + ' control typography: ' + control.label);
        assert.ok(control.height >= 43.9, route + ' target: ' + control.label);
      }
      const target = page.locator('button, .nav a, .button').first();
      await target.focus();
      const focus = await target.evaluate(node => ({ width: getComputedStyle(node).outlineWidth, style: getComputedStyle(node).outlineStyle }));
      assert.equal(focus.width, '3px', route + ' focus width');
      assert.equal(focus.style, 'solid', route + ' focus style');
      await page.screenshot({ path: join(evidence, index + '-' + viewport.width + '.png'), fullPage: false });
      records.push({ route, viewport, navigation: navLinks, ...metrics });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  const staticPage = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  for (const route of routes) {
    await staticPage.goto(base + route);
    assert.equal(await staticPage.locator('h1').count(), 1, route + ' static heading');
    assert.ok((await staticPage.locator('main').textContent()).trim().length > 50, route + ' static content');
    assert.ok(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route + ' static geometry');
    await verifyTimeline(staticPage);
    await verifyTourTypography(staticPage);
  }
  await staticPage.close();
  writeFileSync(join(evidence, 'metrics.json'), JSON.stringify(records, null, 2));
  console.log('ok visual consistency: ' + routes.length + ' routes; 1440×1000 / 390×844; typography, targets, focus, geometry, console and no-JS');
} finally {
  await browser.close();
  server.close();
}
