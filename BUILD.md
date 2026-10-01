# How Launchpad was built

Launchpad is a static-first startup marketing reference. The build renders every public route to HTML, then mounts two small What islands for pricing and product-tour interaction.

The important boundary: `mount()` adds client interactivity over static fallback HTML. It is not SSR-preserving hydration.

## Source map

| Concern | File | Why it matters |
| --- | --- | --- |
| Content and routes | `src/content/site.mjs` | One module owns nav, route metadata, docs cards, tour steps and changelog entries. |
| Static rendering | `src/server/render.mjs` | Uses `h()` plus `renderToString()` so Node never imports browser-lowered JSX. |
| Client islands | `src/client/main.jsx` | Mounts the pricing calculator and product tour only when their host elements exist. |
| Styles | `src/shared/site.css` | Local CSS variables and components; no remote images or font files. |
| Static artifact | `scripts/build.mjs` | Reads Vite manifest, writes route HTML, sitemap, robots and Vura manifest. |
| Artifact checks | `scripts/check.mjs` | Fails the build for missing routes, nullish text, multiple h1 elements or bad manifest shape. |

## Data flow

```text
content records -> renderRoute(route) -> static HTML -> client islands mount into known hosts
```

The server renderer returns complete HTML for marketing, docs and changelog pages. Pricing and tour controls are deliberately isolated in `src/client/main.jsx`, because those controls need browser APIs such as `localStorage` and DOM events.

## Static server rendering

`src/server/render.mjs` chooses a component by route kind, renders it with `what-framework/server`, and writes document metadata from the same route record.

```js
export function renderRoute(route, { assetPath, siteUrl = site.origin }) {
  const Component = pageFor(route.kind);
  const body = renderToString(Layout({ route, assetPath }, [h(Component)]));
  const canonical = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`;
  return '<!doctype html>' +
    `<html lang="en"><head><meta charset="utf-8">` +
    `<title>${esc(route.title)} | ${esc(site.name)}</title>` +
    `<link rel="canonical" href="${esc(canonical)}">` +
    `<link rel="stylesheet" href="${css}">` +
    `</head><body>${body}</body></html>`;
}
```

This is static site generation. There is no request-time rendering in this starter.

## Pricing island

The pricing calculator restores saved local values, clamps them before creating signals, derives totals with computed values and persists the current scenario in an effect.

```jsx
const saved = safeJson(safeStorageGet('launchpad-pricing', storageStatus)) || {};
const seats = useSignal(coerceRange(saved.seats, 2, 80, 12));
const minutes = useSignal(coerceRange(saved.minutes, 1, 50, 8));
const retention = useSignal(coerceRange(saved.retention, 7, 90, 30));

const seatCost = useComputed(() => seats() * 20);
const minuteCost = useComputed(() => minutes() * 6);
const retentionCost = useComputed(() => Math.max(0, retention() - 14) * 2.5);
const total = useComputed(() => seatCost() + minuteCost() + retentionCost());
```

The persistence effect is intentionally plain:

```jsx
useEffect(() => {
  const state = { seats: seats(), minutes: minutes(), retention: retention(), total: total() };
  safeStorageSet('launchpad-pricing', JSON.stringify(state), storageStatus);
  window.dispatchEvent(new CustomEvent('launchpad:pricing-change', { detail: state }));
});
```

The event is local demo observability. It is not analytics.

## Storage fallback

Local storage can be denied in private, embedded or locked-down contexts. The island switches to a memory Map and shows copy that the estimate will reset.

```js
function safeStorageSet(key, value, storageStatus) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    storageStatus('memory');
    storageFallback.set(key, value);
  }
}
```

## Real issues and fixes

### Persisted controls can poison the first render

Problem: saved localStorage values may be missing, malformed or outside the product range.

Before:

```js
const seats = useSignal(Number(saved.seats));
```

After:

```js
const seats = useSignal(coerceRange(saved.seats, 2, 80, 12));
```

Proof: `scripts/check.mjs` rejects nullish rendered text, and smoke coverage exercises the pricing controls from the production artifact.

Takeaway: static islands still need input hygiene because their first browser render is user-controlled.

### Do not import client JSX into the server build

The What compiler lowers JSX for browser execution. Server-rendered pages use `h()` instead:

```js
function pageFor(kind) {
  return { home: Home, tour: Tour, pricing: Pricing, docs: Docs, changelog: Changelog, build: Build, notFound: NotFound }[kind] || NotFound;
}
```

Keep `src/client/main.jsx` as the browser boundary.

## What went smoothly

- Route metadata, page titles and sitemap entries all come from `src/content/site.mjs`.
- The pricing island was small enough to document as a complete signal/computed/effect loop.
- Artifact checks made static route regressions cheaper than visual inspection.

## Limits to preserve

- The pricing calculator is local-only estimate UI, not billing or entitlement logic.
- Static pages are generated at build time, not server-rendered per request.
- Browser islands are client-mounted enhancements over static fallbacks, not hydration.

## Verification

Run:

```bash
npm ci
npm run build
npm run smoke
```

The checks should cover route output, one h1 per page, no undefined/null text, manifest shape, pricing interaction, tour interaction and a genuine static 404.

## Reset

Delete local calculator state:

```js
localStorage.removeItem('launchpad-pricing');
```

Then reload `/pricing`.
