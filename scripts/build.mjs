import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { renderRoute, routes } from '../src/server/render.mjs';

const manifest = JSON.parse(readFileSync('dist/client/.vite/manifest.json', 'utf8'));
const assetPath = `/${manifest['src/client/main.jsx'].file}`;
const siteUrl = readSiteUrl('http://localhost:4173');

mkdirSync('dist/static', { recursive: true });
cpSync('dist/client/assets', 'dist/static/assets', { recursive: true });
copyFileSync('src/shared/site.css', 'dist/static/site.css');

for (const route of routes) {
  const out = route.path === '/' ? 'dist/static/index.html' : `dist/static${route.path}/index.html`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, renderRoute(route, { assetPath, siteUrl }));
}

copyFileSync('dist/static/404/index.html', 'dist/static/404.html');
writeFileSync('dist/static/sitemap.xml', sitemap());
writeFileSync('dist/static/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync('dist/static/llms.txt', '# Launchpad What starter\n\nSee /build for implementation notes.\n');
writeFileSync('dist/manifest.json', JSON.stringify({
  version: 1,
  notFoundPage: '404.html',
  pages: routes.map((route) => ({ urlPattern: route.path, mode: 'static' })),
  api: [],
}, null, 2));

function sitemap() {
  const urls = routes.filter((route) => route.path !== '/404').map((route) => {
    const loc = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`;
    return `  <url><loc>${loc}</loc></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function readSiteUrl(fallback) {
  const raw = (process.env.SITE_URL || fallback).trim().replace(/\/+$/, '');
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`SITE_URL must be an absolute http(s) URL, received ${JSON.stringify(process.env.SITE_URL)}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`SITE_URL must use http or https, received ${parsed.protocol}`);
  }
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('SITE_URL must include only origin, for example https://what-starter-launchpad-fae244da.vura.app');
  }
  return parsed.origin;
}
