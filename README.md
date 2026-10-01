# Launchpad — What Framework starter

Launchpad is a static-first starter for a developer-tools startup. It ships a sharp marketing site, product tour, docs, changelog, and a client-mounted pricing calculator powered by What Framework signals.

## Quick start

Prerequisite: Node.js 22.

```sh
npm ci
npm run dev
```

Build and test the deployable artifact:

```sh
npm run build
npm run test
```

Preview the production artifact exactly as a static host will serve it:

```sh
npm run build
npm run preview
# Open http://127.0.0.1:4173
```

The static Vura artifact is written to `dist/`:

- `dist/static/**` — public HTML and assets
- `dist/manifest.json` — Vura static route manifest
- `vura.json` — cache headers and redirect rules sent by `vura-platform deploy`

## Routes

- `/` — marketing home
- `/tour` — interactive product tour island
- `/pricing` — pricing calculator island
- `/docs` — documentation landing
- `/changelog` — release notes
- `/build` — agent-readable build reference
- `/404` — preview of the not-found page; unknown paths are served from root `404.html` with HTTP 404

## Vura deployment

After creating or linking the Vura project, run:

```sh
npm ci
npx vura-platform login
npx vura-platform projects create launchpad --team <team-id>
# or: npx vura-platform projects link <project-id>
SITE_URL=https://what-starter-launchpad-fae244da.vura.app npm run build
npx vura-platform deploy --prod
```

`SITE_URL` must be an absolute `http` or `https` origin with no path, query or hash. Local builds safely default to `http://localhost:4173`; production builds should set the deployed Vura origin so canonical, sitemap and robots URLs are correct.

This starter does not require secrets, databases, webhooks, or paid services.

## Source

Public repository: <https://github.com/CelsianJs/what-starter-launchpad>

## What this demonstrates

- Static server rendering with `what-framework/server`
- Client-mounted islands with `mount`, `useSignal`, `useComputed`, and `useEffect`
- Vanilla CSS tokens and responsive layout
- Vura CLI-prebuilt static deployment shape

See [BUILD.md](./BUILD.md) and the live `/build` route for implementation notes and caveats.
