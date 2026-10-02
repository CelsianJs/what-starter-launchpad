# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-01
- Primary product surfaces: Home, product tour, pricing calculator, docs, changelog, build reference, 404.
- Evidence reviewed: existing What Framework starter conventions, server-rendering documentation and Vura static artifact conventions.

## Brand
- Personality: precise, technical, fast-moving, architectural, calm under operational pressure.
- Trust signals: concrete workflow panels, explicit pricing assumptions, docs/changelog pages, no fake signup or inflated benchmark claims.
- Avoid: generic purple SaaS gradients, fake “AI-powered” badges, unverified performance claims, placeholder forms.

## Product goals
- Goals: demonstrate a polished static marketing starter for a developer-tools company; show What Framework signals/computed/effects through a useful pricing calculator; ship deployable Vura static output.
- Non-goals: real account creation, external analytics, paid service integration, production billing logic.
- Success signals: static HTML renders without JS, calculator client-mounts and updates instantly, docs explain how the starter was built.

## Personas and jobs
- Primary personas: founder launching a developer-tools product, agent building a startup landing page, engineer evaluating What Framework starter quality.
- User jobs: understand the product, explore pricing, read docs/changelog, copy patterns into their own app.
- Key contexts of use: public marketing gallery, local starter development, Vura-hosted demo.

## Information architecture
- Primary navigation: Home, Tour, Pricing, Docs, Changelog, Build.
- Core routes/screens: `/`, `/tour`, `/pricing`, `/docs`, `/changelog`, `/build`, `/404`.
- Content hierarchy: sharp value proposition, operational product tour, transparent pricing, implementation reference.

## Design principles
- Principle 1: Architectural grid over decorative chrome.
- Principle 2: Interactive controls must be genuinely useful, not ornamental.
- Tradeoffs: static-first speed is favored over deep backend simulation; motion is restrained and reduced-motion aware.

## Visual language
- Color: carbon navy background, electric cobalt accents, white/blue technical panels, amber warning accents for build-risk callouts.
- Typography: narrow uppercase labels, strong geometric headings, readable sans body with tabular numerals.
- Spacing/layout rhythm: 12-column grid, visible rule lines, dense but breathable product panels.
- Shape/radius/elevation: crisp 14px panels, hairline borders, restrained shadows.
- Motion: small reveal/active states, no heavy scroll choreography.
- Imagery/iconography: CSS/SVG diagrams and grid overlays; no remote images.

## Components
- Existing components to reuse: What Framework client `mount`, `useSignal`, `useComputed`, `useEffect`; server `h` + `renderToString`.
- New/changed components: marketing shell, pricing calculator island, tour stage island, docs cards, changelog timeline.
- Variants and states: active tour step, pricing slider states, keyboard focus, mobile nav wrapping, guarded sample release rows.
- Refinement state: the home hero now leads with a meaningful sample build timeline so build observability is visible as a product object, not a decorative terminal.
- Token/component ownership: CSS variables in `src/shared/site.css`; route/content data in `src/content/site.mjs`.

## Accessibility
- Target standard: WCAG AA practical starter baseline.
- Keyboard/focus behavior: visible focus rings; buttons and inputs remain reachable in DOM order.
- Contrast/readability: dark backgrounds have high-contrast text; cobalt is not used as body text on dark.
- Screen-reader semantics: one H1 per route, landmarks, labeled range controls, descriptive link text.
- Reduced motion and sensory considerations: transitions disabled under `prefers-reduced-motion`.

## Responsive behavior
- Supported breakpoints/devices: mobile 360px+, tablet, desktop.
- Layout adaptations: nav wraps, grids collapse to single column, pricing split becomes stacked.
- Touch/hover differences: hover is enhancement only; active/focus states work on touch.

## Interaction states
- Loading: static routes do not require async loading.
- Empty: calculator always has seeded values.
- Error: 404 route explains recovery paths.
- Success: CTA copies “Open the docs”/“View build notes” as navigational outcomes.
- Disabled: no disabled controls in primary flows.
- Offline/slow network: static pages work after HTML/assets load; no third-party dependencies.

## Content voice
- Tone: direct, operational, exact.
- Terminology: “build signal”, “release channel”, “seat”, “pipeline minute”, “preview”.
- Microcopy rules: name assumptions; avoid unverified speed, revenue or adoption claims.

## Implementation constraints
- Framework/styling system: `what-framework@0.13.10`, `what-compiler@0.13.10`, vanilla CSS.
- Design-token constraints: single shared CSS file; no external fonts or remote assets.
- Performance constraints: static HTML, one client bundle, no trackers.
- Compatibility constraints: Node 22 build/test path; Vura CLI-prebuilt static artifact.
- Test/screenshot expectations: build checks, Playwright route/interaction smoke, desktop and mobile screenshots under `.screenshots/`.

## Open questions
- [ ] Publishing owner will confirm final Vura project IDs before deployment.

## Refinement notes — 2026-10-02 Opus review
- Reduced the global h1 ceiling and added route-scoped pricing hero spacing so the calculator no longer competes with oversized display type.
- Replaced process-facing metric copy with honest fictional product states and moved implementation/routing explanations into `/build`.
- Mobile nav is left-aligned with horizontal overflow rather than a ragged right-wrapped cluster.
