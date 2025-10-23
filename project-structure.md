# London Walk Companion – Suggested Project Structure

```
london-walk-companion/
├─ app/                          # Next.js App Router pages and layouts
│  ├─ layout.tsx                 # Root layout with providers (theme, query client)
│  ├─ globals.css                # Global Tailwind styles
│  ├─ (public)/page.tsx          # Landing page (location + duration + destination form)
│  ├─ route/page.tsx             # Route summary view
│  └─ navigate/page.tsx          # Turn-by-turn navigation experience
├─ components/
│  ├─ form/
│  │  ├─ DurationPicker.tsx      # Duration presets and custom slider control
│  │  └─ DestinationSearch.tsx   # Autocomplete search input for destinations
│  ├─ map/
│  │  └─ RouteMap.tsx            # Mapbox GL wrapper with polylines and markers
│  ├─ route/
│  │  ├─ SegmentCard.tsx         # Walking/Tube segment summaries
│  │  └─ ScenicHighlight.tsx     # Optional scenic callouts for the itinerary
│  └─ status/
│     └─ TflLineBadge.tsx        # Tube line status indicator chips
├─ hooks/
│  ├─ useLivePace.ts             # Geolocation watcher adjusting for pace deviations
│  └─ useRoutePlanner.ts         # Encapsulates route API interaction with React Query
├─ lib/
│  ├─ analytics.ts               # Analytics abstraction (PostHog/Vercel)
│  ├─ cache.ts                   # Helper for Upstash/Vercel KV caching
│  ├─ geospatial.ts              # Distance, polyline, and pace utilities
│  ├─ mapbox.ts                  # Mapbox API client helpers
│  ├─ route-engine.ts            # Duration-fitting and scenic heuristic logic
│  └─ tfl.ts                     # TfL API client with rate limit guard
├─ pages/
│  └─ api/
│     ├─ route.ts                # POST handler generating blended walking + Tube plans
│     ├─ status.ts               # GET handler returning Tube line health
│     └─ feedback.ts             # POST handler storing user feedback
├─ public/
│  ├─ data/poi.json              # Curated scenic POI list (static JSON for MVP)
│  └─ assets/                    # Logos, icons, favicons
├─ styles/
│  └─ mapbox.css                 # Custom styling for Mapbox GL controls
├─ tests/
│  ├─ e2e/
│  │  └─ navigation.spec.ts      # Playwright smoke test for full journey
│  └─ unit/
│     └─ route-engine.test.ts    # Vitest coverage for duration-fitting logic
├─ .env.local.example            # Document required environment variables
├─ next.config.mjs               # Next.js configuration (including mapbox transpile)
├─ postcss.config.mjs            # Tailwind/PostCSS setup
├─ tailwind.config.ts            # Tailwind configuration with design tokens
├─ package.json
├─ tsconfig.json
└─ README.md
```

- Keep `app/` focused on user-facing flows, delegating heavy logic to `lib/`.
- `hooks/` encapsulate client-only behavior (geolocation, data fetching).
- `lib/route-engine.ts` is the core algorithm unit and should be thoroughly tested.
- Consider co-locating feature-specific components under `/components/<feature>` as features expand.
