# London Walk Companion – Implementation Phases TODO

## Phase 0 – Project Foundation
- [ ] Scaffold Next.js 14 TypeScript app with Tailwind and React Query configured.
- [ ] Integrate linting/formatting (ESLint, Prettier) and CI workflow stubs.
- [ ] Add environment variable schema (`.env.local.example`, runtime validation).
- [ ] Smoke test: run `pnpm lint && pnpm test` (empty suite) passes in CI.

## Phase 1 – Input Capture & Geolocation
- [ ] Implement landing page form (`(public)/page.tsx`) with duration picker and destination search UI.
- [ ] Request and handle HTML5 geolocation permission; display fallback input if declined.
- [ ] Wire Mapbox Places autocomplete for destination search.
- [ ] Write component/unit tests covering form validation and geolocation denial path.
- [ ] Manual QA: mock location in browser devtools and ensure inputs propagate state.

## Phase 2 – Routing API & Integrations
- [ ] Create `POST /api/route` handler calling stubbed TfL and Mapbox clients.
- [ ] Implement `lib/route-engine.ts` with duration-fitting heuristic (using mocked data initially).
- [ ] Add Upstash/Vercel KV caching helper and apply to route responses.
- [ ] Unit tests for route engine (Vitest) verifying duration tolerance logic.
- [ ] Integration test hitting `/api/route` with mocked external services (MSW).

## Phase 3 – Route Summary Experience
- [ ] Build `RouteMap` and `SegmentCard` components to render itinerary details.
- [ ] Display Tube status chips using `GET /api/status` endpoint.
- [ ] Ensure route summary view matches mobile-first design breakpoints.
- [ ] Component tests for route summary (React Testing Library).
- [ ] Playwright smoke test: simulate user from Phase 1 to summary view with mocked APIs.

## Phase 4 – Live Navigation & Adjustments
- [ ] Implement navigation page with geolocation watch and pace deviation alerts.
- [ ] Hook live TfL status polling and trigger reroute call when disruptions detected.
- [ ] Provide audible/visual cues for leg transitions (walking ↔ Tube).
- [ ] Unit tests for `useLivePace` hook and reroute trigger logic.
- [ ] Field test in staging: emulate slow/fast pace and confirm recalculation within ±5 minutes.

## Phase 5 – Feedback & Analytics
- [ ] Add feedback modal at journey completion; POST to `/api/feedback`.
- [ ] Integrate PostHog/Vercel Analytics for key events (route_generated, navigation_started, feedback_submitted).
- [ ] Create telemetry dashboard stub (e.g., SQL snapshot or PostHog report link).
- [ ] Test feedback submission (API + UI) with mocked store.
- [ ] Verify analytics events fire using provider’s debugging tools.

## Phase 6 – Hardening & Launch Prep
- [ ] Conduct accessibility audit (axe) and remediate WCAG 2.1 AA issues.
- [ ] Run performance profiling; ensure route generation under 3 seconds P95 with caching enabled.
- [ ] Add rate limiting middleware and security headers (CSP, COOP/COEP).
- [ ] Final regression suite: lint, unit, integration, Playwright on CI.
- [ ] Launch checklist review: env vars, API key rotation, rollback plan documented.
