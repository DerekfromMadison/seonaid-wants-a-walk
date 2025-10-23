# London Walk Companion – Product Requirements Document

## 1. Product Overview
- **Vision:** Help Londoners and visitors discover tailored walking journeys that match their available time while mixing scenic walking segments with efficient Tube connections.
- **Problem:** Existing navigation apps prioritize the fastest route from A to B. Users who want a walk of a specific duration must manually experiment with waypoints and transport combinations.
- **Solution:** A mobile-first web application that captures a user’s current location, desired walk duration, and target destination, then generates a mixed-mode route (walking + Tube) whose total travel time matches the requested walk length.

## 2. Goals and Success Metrics
- **Primary Goals**
  - Deliver an end-to-end itinerary that aligns within ±5 minutes of the requested walk duration.
  - Provide a delightful walking experience that highlights safe, interesting pedestrian segments.
  - Support real-time adjustments for delays or user pace deviations.
- **Key Metrics**
  - Route accuracy vs. requested duration (median delta ≤ 5 minutes).
  - Task completion rate (users accept and start a suggested route).
  - Weekly active users and repeat visit ratio.
  - NPS / satisfaction surveys focused on route quality.

## 3. Non-Goals
- Support beyond Greater London geographic bounds (Phase 1 limited to Zones 1-3; stretch goal expand to Zones 4-6).
- Indoor navigation or accessibility-specific routing (note as future enhancement).
- Integration with non-TfL transport (buses, ride-share) in MVP.
- Native mobile apps; this release is mobile web only.

## 4. Target Users & Personas
- **Seonaid (Primary):** Busy professional living in London who wants an enjoyable walk before heading to a specific evening destination. Values time-bounded experiences and scenic routes.
- **Visitor Persona:** Tourist seeking to explore London on foot while ensuring arrival at attractions on time.
- **Wellness Persona:** Local resident using walking as daily exercise, wants consistent duration walks with variable destinations.

## 5. User Journey
1. User opens web app on mobile and grants location permission.
2. Landing screen auto-detects current location; user inputs:
   - Desired walk duration (dropdown presets: 15, 30, 45, 60, 90 minutes + custom slider).
   - Destination (search by name, address, or landmark; show autocomplete suggestions).
3. App generates candidate route options combining Tube segments with walking legs to approximate requested duration.
4. User reviews route summary:
   - Total estimated time and variance from request.
   - Breakdown of walking vs. Tube legs.
   - Highlights of major sights or safe walking streets.
5. User starts navigation mode:
   - Turn-by-turn walking directions.
   - Real-time Tube updates (line status, platform info).
   - Notifications when user deviates or delays threaten schedule.
6. Upon completion, prompt for feedback and optional sharing.

## 6. Functional Requirements
- **FR1:** Obtain precise user current location using HTML5 Geolocation with best-effort accuracy < 30 meters.
- **FR2:** Capture desired walk duration via UI control and destination via search input; enforce validation and fallback defaults.
- **FR3:** Query mapping service to retrieve pedestrian network and POIs; integrate TfL APIs for Tube timetables, line statuses, and station coordinates.
- **FR4:** Generate route itinerary by combining walking segments and Tube segments to approximate requested duration.
  - Prioritize scenic or pedestrian-friendly paths when multiple walking options exist.
  - Enforce feasibility: walking legs within 15-minute buffer of station closing times.
- **FR5:** Present route summary card with time estimates, distance breakdown, walking intensity (steps/min).
- **FR6:** Provide interactive map (mobile-friendly) showing entire route and step-by-step instructions.
- **FR7:** Deliver live adjustments if user pace deviates by >10% or TfL disruptions occur; recalculate to stay near target duration.
- **FR8:** Persist recent requests locally for quick re-selection (localStorage).
- **FR9:** Capture feedback submission tied to route ID for qualitative insights.

## 7. Non-Functional Requirements
- Mobile-first responsive design; core flow optimized for 360-428px width.
- P95 route generation latency < 3 seconds with caching of frequent station pair queries.
- Ensure reliability: uptime 99.5% monthly; degrade gracefully if TfL API unavailable (fallback to walking-only route with disclaimer).
- GDPR compliance: processing only essential personal data, anonymized analytics, clear consent handling for location.
- Accessibility: WCAG 2.1 AA minimum; provide high-contrast map overlays, voiceover-friendly directions.
- Security: HTTPS-only, rate limiting on API endpoints, sanitize destination inputs.

## 8. Data & Integrations
- **Data Sources:** Map provider (Mapbox/Here/OSM), TfL Unified API (Line Status, Journey Planner), London POI dataset for highlights.
- **Storage:** Server-side cache for route templates, user session data (JWT). No PII persistence beyond temporary session token.
- **Analytics:** Mixpanel/GA for funnel tracking, route acceptance, pacing adjustments.
- **Third-Party Dependencies:** TfL API keys, map tiles, possible walking score API for scenic weighting.

## 9. Edge Cases & Failure Handling
- If user denies location access, prompt manual start location input and show limited experience.
- Destination outside supported zones -> show friendly error and suggested alternatives.
- TfL disruptions -> present alternate routes with disclaimer or convert to longer walking route.
- No matching route within ±10 minutes -> offer nearest feasible duration options (shorter/longer) and explain difference.

## 10. Open Questions
- What heuristics define a “scenic” or “safe” walking path (data availability, scoring model)?
- Should we support group walks (multiple destinations or midpoints)?
- Are users willing to pay for premium route curation? (Potential monetization path)
- How granular should pace customization be (e.g., slow vs. fast walkers)?

## 11. Release Plan & Dependencies
- **Milestone 0 (2 weeks):** Technical spike on TfL + map integrations, prototype duration-fitting algorithm.
- **Milestone 1 (4 weeks):** Implement MVP flow (location→duration→destination→single route), basic map display, manual scenario tests.
- **Milestone 2 (3 weeks):** Add live adjustments, multiple route options, scenic weighting.
- **Milestone 3 (2 weeks):** Usability polish, accessibility audit, analytics instrumentation, soft launch beta.
- Dependencies: API key provisioning, frontend map SDK licensing, TfL rate limits, QA resources for on-site testing.

## 12. Risks & Mitigations
- **API Reliability:** TfL outages could break routing; implement cached schedules and fallback walking-only routes.
- **Accuracy of Time Estimates:** Real-world walking pace variability; gather feedback loop, adjust algorithm with machine learning.
- **Legal / Compliance:** Ensure correct handling of geolocation consents and map licensing terms.
- **User Trust:** Need to validate safety of suggested walking paths; partner with local authority datasets, allow user flagging.

## 13. Future Enhancements
- Personalized route playlists (Spotify integration) or audio guides for landmarks.
- Social sharing of routes and community ratings.
- Integration with wearable devices for pace tracking.
- Multi-modal expansion to buses, bikes, river services once MVP proves traction.

