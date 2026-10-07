export const site = {
  name: 'Launchpad',
  tagline: 'Build observability for teams shipping on Friday.',
  description: 'Build observability pages for teams that want release risk visible before production.',
  origin: 'http://localhost:4173',
};

export const nav = [
  ['/', 'Home'],
  ['/tour', 'Tour'],
  ['/pricing', 'Pricing'],
  ['/docs', 'Docs'],
  ['/changelog', 'Changelog'],
  ['/build', 'Build'],
];

export const routes = [
  { path: '/', title: 'Launchpad', description: site.description, kind: 'home' },
  { path: '/tour', title: 'Product tour', description: 'Explore the release health workflow.', kind: 'tour' },
  { path: '/pricing', title: 'Pricing calculator', description: 'Estimate seats, build minutes and data retention.', kind: 'pricing' },
  { path: '/docs', title: 'Docs', description: 'Implementation notes for adapting Launchpad.', kind: 'docs' },
  { path: '/changelog', title: 'Changelog', description: 'A static changelog route for product updates.', kind: 'changelog' },
  { path: '/build', title: 'How this starter was built', description: 'Agent-readable What Framework and Vura build reference.', kind: 'build' },
  { path: '/404', title: 'Page not found', description: 'Preview of the static 404 page used for unknown paths.', kind: 'notFound' },
];

export const releaseTimeline = [
  {
    step: '01',
    label: 'Install',
    owner: 'platform',
    duration: '1m 12s',
    status: 'passed',
    percent: 22,
  },
  {
    step: '02',
    label: 'Build',
    owner: 'frontend',
    duration: '3m 48s',
    status: 'passed',
    percent: 62,
  },
  {
    step: '03',
    label: 'Browser smoke',
    owner: 'frontend',
    duration: '6m 04s',
    status: 'guarded',
    percent: 100,
  },
];

export const tourSteps = [
  {
    key: 'collect',
    title: 'Collect build signals',
    body: 'Ingest status, duration and artifact metadata from the tools your team already runs.',
    metric: '4 inputs',
    evidence: ['release/421 · preview channel', 'Build: passed · 3m 48s · frontend', 'Browser smoke: guarded · 6m 04s · frontend-platform'],
  },
  {
    key: 'explain',
    title: 'Explain release risk',
    body: 'Group warnings by owner and surface what changed since the last healthy deployment.',
    metric: '18 rules',
    evidence: ['Risk: browser smoke exceeds the sample 5m budget', 'Previous healthy release: 4m 20s', 'Decision: review the changed route before promotion'],
  },
  {
    key: 'route',
    title: 'Route the fix',
    body: 'Hand the right context to the right teammate before the release train stalls.',
    metric: '1 owner',
    evidence: ['Owner: frontend-platform', 'Next action: inspect the route diff and repeat browser smoke', 'Release stays guarded until the owner records the result'],
  },
];

export const docsCards = [
  ['Signal intake', 'Connect build status, duration, artifact and owner metadata into one release view.'],
  ['Risk rules', 'Group warnings by release lane so the team can distinguish noise from real blockers.'],
  ['Ownership routing', 'Move the next action to the teammate who can unblock the build fastest.'],
  ['Transparent estimates', 'Show pricing assumptions clearly and keep scenario planning local to the browser.'],
];

export const changelog = [
  { version: '0.3', date: '2026-09-24', title: 'Plan a release budget', body: 'Compare seat count, pipeline minutes and retention in a browser-local estimate. The line items make the rate assumptions visible; no payment or account is created.' },
  { version: '0.2', date: '2026-09-10', title: 'Make guarded releases actionable', body: 'The sample release workflow now carries a risk explanation and an owner handoff alongside the build signals. A warning has a next action instead of becoming another anonymous red badge.' },
  { version: '0.1', date: '2026-08-28', title: 'A shared release view', body: 'A fictional release record brings install, build and browser-smoke stages into one operating view. These notes describe the demo product, not a connected CI service.' },
];
