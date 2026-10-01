import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseManifest } from '@celsian/vura-contract';

export function writeCanonicalVuraManifest(routePaths) {
  const manifest = canonicalManifest(routePaths);
  parseManifest(manifest, { allowLegacy: true });
  writeFileSync('dist/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest.pages.length;
}

export function validateVuraStaticManifest(expectedPages) {
  if (!existsSync('dist/manifest.json')) {
    throw new Error('missing dist/manifest.json; CLI deploy needs the canonical manifest because this artifact keeps files under dist/static');
  }

  const manifest = parseManifest(readFileSync('dist/manifest.json', 'utf8'), { allowLegacy: true });
  if (manifest.pages.length !== expectedPages) {
    throw new Error(`canonical static manifest has ${manifest.pages.length} pages; expected ${expectedPages}`);
  }
  if (manifest.api.length !== 0) {
    throw new Error('static starter should not register API routes');
  }

  for (const page of manifest.pages) {
    if (page.mode !== 'static') throw new Error(`${page.urlPattern} must be a static page`);
    const staticKey = page.config?.staticKey;
    if (typeof staticKey !== 'string' || staticKey.length === 0) {
      throw new Error(`${page.urlPattern} missing config.staticKey`);
    }
    if (!existsSync(join('dist/static', staticKey))) {
      throw new Error(`${page.urlPattern} staticKey does not exist in dist/static: ${staticKey}`);
    }
  }

  return manifest.pages.length;
}

function canonicalManifest(routePaths) {
  return {
    api: [],
    pages: routePaths.map((routePath) => {
      const filePath = routePath === '/' ? 'index.html' : `${routePath.replace(/^\/+/, '')}/index.html`;
      return {
        filePath,
        urlPattern: routePath,
        mode: 'static',
        hasGetServerData: false,
        hasLoader: false,
        config: { staticKey: filePath },
      };
    }),
    layouts: [],
    timestamp: new Date().toISOString(),
  };
}
