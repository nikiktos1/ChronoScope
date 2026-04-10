# System Patterns

## Architecture
The application is a Next.js 16 App Router project. The main user flows are rendered from route-level pages in `app/`, with client-side interactive map components loaded dynamically to avoid Leaflet SSR issues.

## Main Subsystems

### Map Rendering
- `components/SupabaseMap.tsx` is the central map renderer.
- It loads available years and GeoJSON-like feature collections from Supabase via `lib/maps.ts`.
- Leaflet is loaded client-side only through `next/dynamic` wrappers in page components.
- `lib/maps.ts` now loads `countries` and `country_geometries` in separate Supabase queries and joins them in memory instead of relying on a nested PostgREST embed.
- `lib/maps.ts` also normalizes malformed polygon nesting before emitting GeoJSON so invalid records do not crash Leaflet rendering.
- `lib/maps.ts` now also applies atlas-view geometry cleanup for oversized WWI empire shapes and can substitute a cleaner geometry from another year at runtime when the source year is visibly broken, as with 1914 Britain reusing the 1915 Britain contour.
- The current data pipeline still allows geometry inconsistencies to enter the database because import and copy scripts persist `geometry_type` and `coordinates` without structural validation.

### Historical Navigation
- `components/TimeSlider.tsx` controls the active year on the main route.
- The main page keeps year state and passes it down to the map and AI-related UI.

### Authentication
- `lib/auth.ts` wraps Supabase Auth operations.
- Auth UI lives in `components/auth/` with dedicated routes for login and registration.

### AI Flow
- `components/AIHistoryGenerator.tsx` posts chat history to `app/api/generate-history/route.ts`.
- The current implementation returns generated essay text and can surface it on the main page.

### Game Mode
- `components/game/HistoricalDuel.tsx` composes the duel experience.
- It reuses the map data APIs and persists score-related data through `lib/game.ts`.

## Cross-Cutting Patterns
- Dynamic imports are used for map-heavy components to bypass SSR incompatibility.
- Supabase acts as both data source and auth backend.
- Public routes are page-first, while shared behaviors are encapsulated in `components/` and `lib/`.
- The codebase currently mixes historical-product ambitions from docs with a narrower implemented MVP in code; Memory Bank should track the delta explicitly.
