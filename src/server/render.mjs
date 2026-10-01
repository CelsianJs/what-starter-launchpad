import { h } from 'what-framework';
import { renderToString } from 'what-framework/server';
import { changelog, docsCards, nav, routes, site, tourSteps } from '../content/site.mjs';

const css = '/site.css';

function text(...children) {
  return children.flat().filter((child) => child !== null && child !== undefined && child !== false);
}

function A(props, ...children) {
  return h('a', props, ...children);
}

function Layout({ route, assetPath }, children) {
  const current = route.path;
  return h('div', { class: 'page' },
    h('a', { class: 'skip-link', href: '#content' }, 'Skip to content'),
    h('header', { class: 'site-header shell' },
      A({ class: 'brand', href: '/' }, h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, 'L'), h('span', {}, site.name)),
      h('nav', { class: 'nav', 'aria-label': 'Primary' },
        nav.map(([href, label]) => A({ href, 'aria-current': href === current ? 'page' : undefined }, label)),
      ),
    ),
    h('main', { id: 'content' }, ...children),
    h('footer', { class: 'site-footer shell' },
      h('span', {}, 'Launchpad build observability.'),
      h('span', {}, 'Static pages · live estimates · release notes'),
    ),
    h('script', { type: 'module', src: assetPath }),
  );
}

function Home() {
  return h('div', {},
    h('section', { class: 'hero shell' },
      h('div', {},
        h('p', { class: 'eyeline' }, 'Build observability'),
        h('h1', {}, 'See the release before it breaks.'),
        h('p', {}, 'Launchpad gives engineering teams a crisp operating view across build health, release risk and ownership before the train leaves the station.'),
        h('div', { class: 'actions' },
          A({ class: 'button primary', href: '/pricing' }, 'Try the calculator'),
          A({ class: 'button', href: '/build' }, 'Read build notes'),
        ),
      ),
      h('aside', { class: 'terminal', 'aria-label': 'Build signal example' },
        h('div', { class: 'terminal-bar' }, h('span', { class: 'dot' }), h('span', { class: 'dot' }), h('span', { class: 'dot' })),
        h('pre', {}, `release/421\nstatus: guarded\nslowest step: browser smoke\nowner: frontend-platform\nnext action: ship docs diff`),
      ),
    ),
    h('section', { class: 'section shell' },
      h('div', { class: 'grid' },
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '0'), h('h3', {}, 'Dark launches guessed'), h('p', {}, 'Give every release owner the same visible source of truth before production changes hands.')),
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '7'), h('h3', {}, 'Decision surfaces'), h('p', {}, 'Home, tour, pricing, docs and release notes all resolve to durable product pages.')),
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '1'), h('h3', {}, 'Operating model'), h('p', {}, 'The calculator keeps assumptions local so visitors can test scenarios without surrendering data.')),
      ),
    ),
  );
}

function Tour() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Product tour'),
    h('h1', {}, 'From noisy CI to one release call.'),
    h('p', {}, 'Follow a release from its first build signal to a clear production decision. Choose a stage to explore the workflow.'),
    h('div', { id: 'tour-island', class: 'tour-layout', 'data-steps': JSON.stringify(tourSteps) },
      h('div', { class: 'stack' },
        tourSteps.map((step, index) => h('button', { class: 'tour-button', 'aria-pressed': index === 0 ? 'true' : 'false', type: 'button' },
          h('strong', {}, step.title),
          h('p', {}, step.body),
        )),
      ),
      h('aside', { class: 'panel' },
        h('p', { class: 'eyeline' }, tourSteps[0].key),
        h('h2', {}, tourSteps[0].title),
        h('p', {}, tourSteps[0].body),
        h('div', { class: 'metric' }, tourSteps[0].metric),
      ),
    ),
  );
}

function Pricing() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Pricing calculator'),
    h('h1', {}, 'Model a team before making a pricing page yours.'),
    h('div', { id: 'pricing-calculator', class: 'pricing-layout' },
      h('div', { class: 'panel stack' },
        h('label', { for: 'seats' }, 'Seats: 12'),
        h('input', { id: 'seats', type: 'range', min: '2', max: '80', value: '12' }),
        h('label', { for: 'minutes' }, 'Build minutes: 8k'),
        h('input', { id: 'minutes', type: 'range', min: '1', max: '50', value: '8' }),
        h('label', { for: 'retention' }, 'Retention: 30 days'),
        h('input', { id: 'retention', type: 'range', min: '7', max: '90', value: '30' }),
      ),
      h('aside', { class: 'panel' },
        h('p', { class: 'eyeline' }, 'Estimated monthly'),
        h('div', { class: 'price' }, '$328'),
        h('table', { class: 'table' },
          h('tbody', {},
            h('tr', {}, h('td', {}, 'Team seats'), h('td', {}, '$240')),
            h('tr', {}, h('td', {}, 'Build minutes'), h('td', {}, '$48')),
            h('tr', {}, h('td', {}, 'Retention'), h('td', {}, '$40')),
          ),
        ),
        h('p', {}, 'Local estimate only. Replace with real billing logic before accepting money.'),
      ),
    ),
  );
}

function Docs() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Docs'),
    h('h1', {}, 'Docs for the operator who owns the release.'),
    h('div', { class: 'grid' }, docsCards.map(([title, body]) => h('article', { class: 'panel' }, h('h3', {}, title), h('p', {}, body)))),
  );
}

function Changelog() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Changelog'),
    h('h1', {}, 'Ship notes without a CMS.'),
    h('ul', { class: 'timeline' }, changelog.map(([version, body]) => h('li', {}, h('strong', {}, `v${version}`), h('p', {}, body)))),
  );
}

function Build() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Build reference'),
    h('h1', {}, 'How Launchpad works.'),
    h('div', { class: 'panel' },
      h('p', {}, 'Server routes are rendered with `what-framework/server`; interactive pricing and tour widgets mount with What signals in the browser.'),
      h('ul', { class: 'build-list' },
        h('li', {}, 'Signals: `src/client/main.jsx` uses `useSignal` for seats, minutes, retention and tour step.'),
        h('li', {}, 'Computed: pricing totals use `useComputed` so derived rows update together.'),
        h('li', {}, 'Effects: pricing assumptions persist to localStorage and remain local-only.'),
        h('li', {}, 'Routing: route metadata lives in `src/content/site.mjs`; `scripts/build.mjs` emits `path/index.html`.'),
        h('li', {}, 'Vura: `dist/static` plus a canonical `dist/manifest.json` deploys with `vura-platform deploy`.'),
        h('li', {}, 'Lesson: the manifest must include `timestamp`, `pages[].filePath`, `hasLoader`, `hasGetServerData` and `config.staticKey`; Vura treats present manifests as authoritative.'),
        h('li', {}, 'Lesson: server pages use `h()` and `renderToString`; browser JSX stays in `src/client/main.jsx` so compiler-lowered DOM code is never imported by the Node renderer.'),
        h('li', {}, 'Lesson: `mount()` replaces island fallback containers when JavaScript loads. This is client-mounted interactivity, not SSR-preserving hydration.'),
        h('li', {}, 'Lesson: `safeStorageGet` and `safeStorageSet` catch denied storage access and fall back to tab-local memory without clearing user storage.'),
      ),
    ),
  );
}

function NotFound() {
  return h('section', { class: 'not-found shell' },
    h('div', {},
      h('p', { class: 'eyeline' }, '404'),
      h('h1', {}, 'This release lane does not exist.'),
      h('p', {}, 'Try the docs, pricing calculator or build reference.'),
      h('div', { class: 'actions' }, A({ class: 'button primary', href: '/' }, 'Return home'), A({ class: 'button', href: '/docs' }, 'Open docs')),
    ),
  );
}

function pageFor(kind) {
  return { home: Home, tour: Tour, pricing: Pricing, docs: Docs, changelog: Changelog, build: Build, notFound: NotFound }[kind] || NotFound;
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function renderRoute(route, { assetPath, siteUrl = site.origin }) {
  const Component = pageFor(route.kind);
  const body = renderToString(Layout({ route, assetPath }, [h(Component)]));
  const canonical = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`;
  return '<!doctype html>' +
    `<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${esc(route.title)} | ${esc(site.name)}</title>` +
    `<meta name="description" content="${esc(route.description)}">` +
    `<link rel="canonical" href="${esc(canonical)}">` +
    `<link rel="stylesheet" href="${css}">` +
    `</head><body>${body}</body></html>`;
}

export { routes };
