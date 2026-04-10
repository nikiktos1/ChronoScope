# Progress

## Project Status
The codebase contains a working interactive atlas foundation with implemented map, timeline, auth, alternate-history, and duel flows. Project completion must be interpreted only through `memory_bank/projectbrief.md`.

## What Is Implemented
- Main interactive map route backed by Supabase data loading.
- Timeline-driven year switching on the main page.
- Enhanced map page with detailed country popups.
- Login and registration UI tied to Supabase Auth.
- Alternate-history chat flow using an API route.
- Historical duel gameplay route with score handling.

## Known Issues
- The repository has no configured git remote yet, so push is blocked until a destination remote is provided or created.
- Historical data coverage for the full intended timeline is not yet validated as complete.
- Product requirements such as richer search, event cards, user favorites, and operational deployment setup remain incomplete.

## Changelog

### 2026-04-10
- Checked the upstream `AGENTS.md` from `ravva/projects-tracker` and confirmed the local file is aligned with the requested policy.
- Verified that `memory_bank/projectbrief.md` contains the required `## Project Deliverables` Markdown table with columns `ID | Deliverable | Status | Weight`.
- Revalidated the deliverables arithmetic and confirmed the exact sum remains `100`.
- Added `docs/README.md` as the canonical architecture source required by the Memory Bank policy, preserving the existing `DOCS/README.md`.
- Updated `activeContext.md`, `techContext.md`, and `progress.md` to reflect the current repository and documentation state.

### 2026-04-09
- Verified via `getMapForYear(1915)` and direct Supabase reads that 1915 already contains `Российская империя` with valid multipolygon geometry; the user-facing issue was not caused by a missing 1915 Russia row.
- Hid 1914 from the year lists returned by `lib/maps.ts` and removed 1914 from the hardcoded timeline UI.
- Switched the main page, enhanced map page, and `SupabaseMap` default year from 1914 to 1915 so the product opens on the working WWI dataset.
- Updated `components/SupabaseMap.tsx` so popup field `Часть:` is shown only for puppet-like dependent governments instead of every record that happens to have `part_of` filled.
- Reintroduced 1914 to the UI year selectors after the user asked to keep the year available.
- Added loader-side WWI empire geometry cleanup in `lib/maps.ts` and verified that 1914 Britain now reuses the cleaner 1915 Britain contour, reducing the rendered shape to the same 3-polygon geometry used in 1915.
- Replaced the broken 1914 Russia atlas geometry with the cleaner 1913 Russia contour in `lib/maps.ts` and verified that 1914 Russia now matches the 1913 8-polygon shape instead of the visibly clipped block.
- Initialized local git support preparation by adding an ignored `.github-token.local` placeholder and updating project context for repository setup.

### 2026-04-07
- Replaced the local `AGENTS.md` with the upstream version requested by the user.
- Rebuilt `memory_bank/projectbrief.md` so `## Project Deliverables` is a canonical Markdown table with statuses limited to `pending`, `in_progress`, and `completed`.
- Recomputed deliverable weights and verified the exact arithmetic sum is `100`.
- Synchronized `ACTIVE_CONTEXT.md`, `productContext.md`, `systemPatterns.md`, and `techContext.md` with the current project state.
- Recorded the current git blocker explicitly because the workspace has no `.git` directory.
- Diagnosed Supabase map loading and confirmed the public client can read `historical_periods`, `countries`, and `country_geometries`.
- Reworked `lib/maps.ts` to load countries and geometries in separate queries, join them client-side, and serialize empty-looking errors more usefully.
- Ran Biome with auto-fix on `lib/maps.ts` after the bugfix.
- Diagnosed the `Invalid LatLng object` crash as malformed polygon nesting in Supabase geometry rows for at least two 1914 countries.
- Added defensive geometry normalization in `lib/maps.ts` and verified `getMapForYear(1914)` now returns `26` features without runtime failure.
- Audited all `630` `country_geometries` rows with the service-role key and confirmed only two rows were structurally invalid.
- Repaired the two malformed 1914 rows directly in Supabase and confirmed there are no remaining invalid `country_geometries` records.
- Revalidated map loading for every available year; remaining issues are limited to countries that have no geometry rows, not broken coordinate structures.
- Removed the Russia-specific Europe-only clipping workaround and the 1914-from-1913 Russian geometry substitution from `lib/maps.ts`.
- Repaired 1915 Russian Empire coverage in Supabase by replacing its incomplete geometry subset with the full verified 1914 geometry set.
- Verified via `getMapForYear` that both 1914 and 1915 now render the Russian Empire as `25` polygons instead of the previously truncated shape.

## Контроль изменений
last_checked_commit: 2026-04-10
