import { h } from 'what-framework';
import { renderToString } from 'what-framework/server';
import { changelog, docsCards, nav, releaseTimeline, routes, site, tourSteps } from '../content/site.mjs';

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
          A({ class: 'button', href: '/tour' }, 'Explore the workflow'),
        ),
      ),
      h('aside', { class: 'release-card', 'aria-label': 'Sample build timeline' },
        h('div', { class: 'release-head' },
          h('span', { class: 'status-chip' }, 'guarded'),
          h('span', { class: 'meta' }, 'release/421'),
        ),
        h('h2', {}, 'Browser smoke is the slowest gate.'),
        h('p', {}, 'Owner: frontend-platform · next action: ship docs diff'),
        h('ol', { class: 'build-timeline' }, releaseTimeline.map((item) => h('li', { style: `--bar:${item.percent}%` },
          h('span', { class: 'step-index' }, item.step),
          h('span', {}, h('strong', {}, item.label), h('small', {}, item.owner)),
          h('span', { class: `result ${item.status}` }, item.duration),
        ))),
      ),
    ),
    h('section', { class: 'section shell' },
      h('div', { class: 'grid' },
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '1'), h('h3', {}, 'Named release owner'), h('p', {}, 'Each sample warning has an owner and a next action, so the handoff does not disappear between stages.')),
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '11m'), h('h3', {}, 'Sample pipeline duration'), h('p', {}, 'Install, build and browser smoke total 11 minutes 4 seconds in this fictional record. This is not a performance benchmark.')),
        h('article', { class: 'panel' }, h('div', { class: 'metric' }, '3'), h('h3', {}, 'Guarded release states'), h('p', {}, 'Passed, guarded and action-needed states make the release call easy to scan.')),
      ),
    ),
  );
}

function Tour() {
  return h('section', { class: 'section shell page-hero' },
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
        h('ul', { class: 'build-list' }, ...tourSteps[0].evidence.map(item => h('li', {}, item))),
      ),
    ),
  );
}

function Pricing() {
  return h('section', { class: 'section shell page-hero' },
    h('p', { class: 'eyeline' }, 'Pricing calculator'),
    h('h1', {}, 'A clear budget for the next release.'),
    h('p', {}, 'Explore fictional rates for a team, pipeline usage and history. This local estimate is not a quote, subscription or checkout.'),
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
        h('p', {}, 'Sample rates: $20 per seat, $6 per 1,000 build minutes, and $2.50 per retention day beyond 14. No payment or account is created.'),
      ),
    ),
  );
}

function Docs() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Docs'),
    h('h1', {}, 'Docs for the operator who owns the release.'),
    h('div', { class: 'grid' }, docsCards.map(([title, body]) => h('article', { class: 'panel' }, h('h3', {}, title), h('p', {}, body)))),
    h('section', { class: 'panel operator-example' }, h('h2', {}, 'Read a guarded release'), h('ol', {}, h('li', {}, 'Collect the record: release/421 has a passed build and a 6m 04s browser-smoke stage.'), h('li', {}, 'Explain the guard: the smoke stage exceeds the sample 5-minute budget. Duration alone does not establish a defect.'), h('li', {}, 'Route the check: frontend-platform reviews the changed route and repeats smoke before promotion.')), h('p', {}, 'Sample workflow only. Launchpad does not ingest a real pipeline or promote deployments in this demo.'), A({ href: '/tour' }, 'Follow the sample release')),
  );
}

function Changelog() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Changelog'),
    h('h1', {}, 'Release notes, with a next step.'),
    h('p', {}, 'Fictional product updates for the Launchpad demo.'),
    h('ul', { class: 'timeline' }, changelog.map(entry => h('li', {}, h('strong', {}, `v${entry.version} · ${entry.date}`), h('h2', {}, entry.title), h('p', {}, entry.body)))),
  );
}

function Build() {
  return h('section', { class: 'section shell' },
    h('p', { class: 'eyeline' }, 'Build reference'),
    h('h1', {}, 'How Launchpad works.'),
    h('div', { class: 'panel' },
      h('p', {}, 'Server routes are rendered with `what-framework/server`; interactive pricing and tour widgets mount with What signals in the browser.'),
      h('ul', { class: 'build-list' },
        h('li', {}, h('code', {}, 'current().evidence.map(item => ...)'), ' runs inside a reactive accessor so selected-stage evidence updates without remounting.'), h('li', {}, 'Distinct intake, risk and owner records retain a useful static first-stage fallback. Unsupported time-saved copy was replaced with a named owner, and rate assumptions now sit beside totals.'), h('li', {}, 'Signals: `src/client/main.jsx` uses `useSignal` for seats, minutes, retention and tour step.'),
        h('li', {}, 'Computed: pricing totals use `useComputed` so derived rows update together.'),
        h('li', {}, 'Effects: pricing assumptions persist to localStorage and remain local-only.'),
        h('li', {}, 'Routing: route metadata lives in `src/content/site.mjs`; `scripts/build.mjs` emits `path/index.html`.'),
        h('li', {}, 'Vura: `dist/static` plus a canonical `dist/manifest.json` deploys with `vura-platform deploy`.'),
        h('li', {}, 'Lesson: the manifest must include `timestamp`, `pages[].filePath`, `hasLoader`, `hasGetServerData` and `config.staticKey`; Vura treats present manifests as authoritative.'),
        h('li', {}, 'Lesson: server pages use `h()` and `renderToString`; browser JSX stays in `src/client/main.jsx` so compiler-lowered DOM code is never imported by the Node renderer.'),
        h('li', {}, 'Lesson: `mount()` replaces island fallback containers when JavaScript loads. This is client-mounted interactivity, not SSR-preserving hydration.'),
        h('li', {}, 'Lesson: `safeStorageGet` and `safeStorageSet` catch denied storage access and fall back to tab-local memory without clearing user storage.'),
        h('li', {}, 'Refinement: the home hero uses a server-rendered sample build timeline instead of a generic terminal card, so the product object teaches release observability even without JavaScript.'),
        h('li', {}, 'Refinement: product screens avoid internal route/process claims; implementation details live here in the build reference.'),
        h('li', {}, 'Regression covered: the pricing route shares the `.page-hero` headline scale, and smoke tests require at least 24px between the headline box and calculator panel at 1440px and 390px.'),
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
