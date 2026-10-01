import { existsSync, readFileSync } from 'node:fs';
import { routes } from '../src/content/site.mjs';
import { validateVuraStaticManifest } from './vura-static-check.mjs';

const problems = [];
const fail = (msg) => problems.push(msg);

for (const route of routes) {
  const file = route.path === '/' ? 'dist/static/index.html' : `dist/static${route.path}/index.html`;
  if (!existsSync(file)) {
    fail(`missing ${file}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<!doctype html>')) fail(`${route.path} missing doctype`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${route.path} must have one h1`);
  if (/>undefined<|>null<|="undefined"|="null"/.test(html)) fail(`${route.path} rendered nullish text`);
  if (!html.includes('<script type="module" src="/assets/')) fail(`${route.path} missing client asset`);
}

for (const required of ['dist/static/404.html', 'dist/static/site.css', 'dist/static/sitemap.xml', 'dist/static/robots.txt', 'dist/static/llms.txt']) {
  if (!existsSync(required)) fail(`missing ${required}`);
}

let manifestPages = 0;
try {
  manifestPages = validateVuraStaticManifest(routes.length);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (problems.length) {
  console.error(problems.map((p) => `- ${p}`).join('\n'));
  process.exit(1);
}

console.log(`check OK: ${routes.length} routes, ${manifestPages} canonical Vura manifest pages validated.`);
