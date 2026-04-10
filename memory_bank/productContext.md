# Product Context

## Why This Project Exists
ChronoScope is intended to turn historical map exploration into an interactive, searchable, and visually approachable web experience. It replaces static atlas browsing with a navigable timeline, rich map overlays, and product features that encourage repeated exploration.

## User Problems
- Static historical maps are hard to compare across time.
- Many users need a quicker way to inspect borders, states, and geopolitical changes for a specific year.
- General history products rarely combine map exploration with gameplay and speculative history tools.
- Historical datasets are fragmented, so the product needs a coherent UI over a structured spatial database.

## Target Users
- History enthusiasts.
- Students and teachers.
- Researchers and hobbyists working with geopolitical history.
- Users interested in historical comparison and alternate-history scenarios.

## Current Product Surface
- Main interactive map at `/`.
- Enhanced map page at `/enhanced-map` with detailed country inspection.
- Auth routes at `/auth/login`, `/auth/register`, and a legacy `/login` route.
- Duel mode at `/duel`.
- Alternate history generation through `/api/generate-history` and `components/AIHistoryGenerator.tsx`.

## Current Gaps
- Complete historical coverage across the intended time range is not yet confirmed in code and data.
- Search and event-card UX described in product docs are not yet surfaced as dedicated user-facing flows.
- Persistent user personalization beyond auth and duel score handling remains incomplete.
