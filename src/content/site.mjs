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

export const tourSteps = [
  {
    key: 'collect',
    title: 'Collect build signals',
    body: 'Ingest status, duration and artifact metadata from the tools your team already runs.',
    metric: '4 inputs',
  },
  {
    key: 'explain',
    title: 'Explain release risk',
    body: 'Group warnings by owner and surface what changed since the last healthy deployment.',
    metric: '18 rules',
  },
  {
    key: 'route',
    title: 'Route the fix',
    body: 'Hand the right context to the right teammate before the release train stalls.',
    metric: '9 min saved',
  },
];

export const docsCards = [
  ['Signal intake', 'Connect build status, duration, artifact and owner metadata into one release view.'],
  ['Risk rules', 'Group warnings by release lane so the team can distinguish noise from real blockers.'],
  ['Ownership routing', 'Move the next action to the teammate who can unblock the build fastest.'],
  ['Transparent estimates', 'Show pricing assumptions clearly and keep scenario planning local to the browser.'],
];

export const changelog = [
  ['0.3', 'Added pricing calculator with local-only persistence and tabular totals.'],
  ['0.2', 'Split product tour, docs and changelog into static routes.'],
  ['0.1', 'Established cobalt architectural grid and accessible release documentation.'],
];
