# London Walk Companion – MVP Architecture

## 1. Architecture Overview
- **Pattern:** Client-focused single-page experience backed by serverless APIs hosted via Next.js (App Router) with TypeScript.
- **Deployment Target:** Vercel (primary) leveraging built-in edge caching; fallback container image for alternative cloud.
- **Core Idea:** Keep state on the client, run routing logic in stateless API routes, depend on external services (TfL, Mapbox) for transport and map data, and use lightweight caching to hit performance targets.

```
┌──────────────────────────────┐
│   Client (Next.js App)       │
│  - React UI components       │
│  - Geolocation + sensors     │
│  - Mapbox GL map             │
│  - Navigation state (local)  │
└───────▲──────────────────────┘
        │ GraphQL-like fetch via REST
┌───────┴──────────────────────┐
│   Next.js API Routes         │
│  - /api/route (route engine) │
│  - /api/status (TfL health)  │
│  - /api/feedback             │
│  - Edge Middleware (auth)    │
└───────▲───────────┬──────────┘
        │           │
        │           │
┌───────┴───┐   ┌───┴─────────┐
│ TfL APIs  │   │ Mapbox APIs │
│ (journey  │   │ (tiles,     │
│ planner & │   │ directions) │
└───────────┘   └─────────────┘
        │           │
        └────┬──────┘
             │
      ┌──────▼─────────┐
      │ Cache Layer    │
      │ (Upstash Redis │
      │  or Vercel KV) │
      └────────────────┘
```

## 2. Tech Stack Choices
- **Framework:** Next.js 14 (App Router, TypeScript, React Server Components).
- **Styling/UI:** Tailwind CSS + Headless UI for accessible components.
- **Maps:** Mapbox GL JS + Mapbox Directions API for walking segments; custom overlays for Tube lines.
- **State Management:** React Query (TanStack Query) for data fetching + caching.
- **Serverless Runtime:** Next API routes with node runtime; background revalidation via `route` cache TTL.
- **Caching:** Upstash Redis (serverless) or Vercel KV for short-lived route templates and TfL status snapshots.
- **Analytics:** PostHog (self-hosted option) or Vercel Analytics for MVP instrumentation.
- **Testing:** Vitest + React Testing Library; Playwright for E2E regression on key flows.

## 3. Frontend Modules
- `app/(public)/page.tsx`: Landing page collecting duration and destination, requesting geolocation.
- `app/route/page.tsx`: Displays generated itinerary (walking segments, Tube segments, total time, scenic notes).
- `app/navigate/page.tsx`: Turn-by-turn navigation view with live status updates; uses Web APIs for geolocation watch.
- `components/form/DurationPicker.tsx`: Preset buttons + slider for custom timing.
- `components/map/RouteMap.tsx`: Mapbox GL integration with route polylines, station markers, pacing overlays.
- `components/route/SegmentCard.tsx`: Summaries for each segment, icons for walking vs Tube.
- `components/status/TflLineBadge.tsx`: Live line health indicators from `/api/status`.
- `hooks/useLivePace.ts`: Computes deviation from expected pace using geolocation updates.
- `lib/analytics.ts`: Wrapper for analytics calls to avoid duplicate dependencies.

## 4. API Surface (Backend)
- `POST /api/route`
  - **Input:** `{ origin, destination, durationMinutes, pacePreference }`
  - **Logic:** Calls TfL Journey Planner to list viable Tube legs, Mapbox Directions for walking segments, then runs duration-fitting algorithm (greedy + heuristics) to match target time within ±5 minutes.
  - **Response:** `RoutePlan` containing segments, total durations, map geometry, scenic snippets.
  - **Caching:** Keyed by `origin|destination|duration|timeBlock` for 5 minutes to reduce API load.
- `GET /api/status`
  - Fetches relevant Tube line status once per minute, cached to avoid hitting TfL per request.
- `POST /api/feedback`
  - Stores route feedback in lightweight store (Upstash Redis list) for later export.
- **Middleware:** Request validation via Zod; API key enforcement using environment secrets.

## 5. Services & Utilities
- `lib/tfl.ts`: Thin client for TfL Unified API with rate-limit guard.
- `lib/mapbox.ts`: Abstraction for Mapbox Directions + map styling tokens.
- `lib/route-engine.ts`: Core logic that blends walking and Tube segments, applies scenic weighting (simple heuristics in MVP using curated POI list).
- `lib/cache.ts`: Helper to interact with Upstash/Vercel KV; ensures TTL and JSON serialization.
- `lib/geospatial.ts`: Utility for Haversine distance, polyline manipulation, pace adjustments.

## 6. Data & State Strategy
- No permanent database in MVP; rely on serverless KV for cached routes, feedback queue, and experiment flags.
- Client retains current route and navigation state in memory + `sessionStorage` for resume capability.
- Secrets (API keys) managed via Vercel environment variables, rotated manually in MVP.
- Local POI/scenic dataset shipped as static JSON in `/public/data/poi.json`; future move to managed CMS.

## 7. Deployment & DevOps
- **CI/CD:** GitHub Actions pipeline running lint, type-check, unit tests, and Playwright smoke before deploying to Vercel preview.
- **Branch Strategy:** `main` (production) + feature branches; use Vercel preview URLs for QA.
- **Observability:** Vercel logs, Logtail (optional) for structured API logging; PostHog for user behavior.
- **Feature Flags:** Minimal environment-based toggles; upgrade to ConfigCat/LaunchDarkly if needed.

## 8. Security & Compliance Notes
- Enforce HTTPS; use CSP with Mapbox and app domains allowlisted.
- Prompt explicit consent before geolocation; store choice in cookie compliant with GDPR.
- Sanitize user input for destination search to prevent injection; rely on Mapbox Places for geocoding.
- Rate limit API endpoints (Upstash rate limiter or middleware) to 60 requests/min per IP.

## 9. Open Engineering Questions
- Do we need offline fallback (downloaded route) for poor connectivity?
- Should duration-fitting run as an edge function (lower latency) or remain in Node runtime due to dependencies?
- What is the minimal scenic weighting dataset we can maintain without manual curation overhead?

