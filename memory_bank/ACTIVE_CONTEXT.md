# Active Context

## Current Task
Diagnose and fix the console error during Supabase-backed map loading where country fetches intermittently fail in the browser.

## In Progress
- Verified that `historical_periods`, `countries`, and `country_geometries` are accessible through the public Supabase client.
- Reproduced that the base tables are readable and replaced the fragile nested map query strategy in `lib/maps.ts` with separate country and geometry queries.
- Added geometry normalization in `lib/maps.ts` so the map can tolerate malformed Supabase records where `Polygon` coordinates are stored with an extra nesting level.
- Audited all `country_geometries` rows with the service-role key, fixed the only two malformed rows in Supabase, and revalidated map loading across all supported years.
- Kept project deliverable statuses unchanged because the task is a reliability bugfix within the already implemented map experience.

## Key Decisions
- Map loading should not depend on a nested PostgREST embed for `country_geometries`; `countries` and `country_geometries` are now loaded separately and joined in application code for better resilience.
- Error serialization in `lib/maps.ts` should preserve non-enumerable fields so browser console logs remain actionable when Supabase returns atypical error objects.
- The client should normalize malformed `Polygon` and `MultiPolygon` coordinate shapes defensively instead of crashing Leaflet at render time.
- The database fix was limited to two unambiguous 1914 rows whose `Polygon` coordinates had a single extra array wrapper; no broader data rewrite was needed.

## Active Risks
- The repository root currently has no `.git` directory, so commit and push cannot be completed until a git repository or remote target is available.
- The upstream Memory Bank policy references `docs/README.md`, but this workspace currently uses `README.md` and `DOCS/`; this mismatch should be resolved in a future documentation pass if the user wants full policy convergence.
- The exact original browser-side trigger for the empty-object error was not reproducible in direct Bun diagnostics, so the fix intentionally targets the unstable query shape rather than a verified Supabase outage.
- Several years still contain countries without any geometry rows at all; the app now skips them safely, but historical coverage remains incomplete for those records.
