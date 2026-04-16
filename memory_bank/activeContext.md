# Active Context

## Current Task
Add the 1916 historical map period using external source data from CShapes 2.0, without hand-drawing borders, then expose the new year in the UI.

## In Progress
- The 1916 import is being implemented using CShapes 2.0 as the primary geometry source, with no manual border drawing.
- The current import approach targets the existing `historical_periods`, `countries`, and `country_geometries` tables already used by the map loader.
- The current popup rule for `part_of` remains restricted to puppet-like or dependent regimes only.
- `memory_bank/projectbrief.md` still contains the required `## Project Deliverables` Markdown table with a verified exact weight sum of `100`.

## Latest Outcome
- Period `1916` has now been imported into Supabase from `CShapes 2.0` using a scripted pipeline and exposed in the UI selectors.
- The production build passes after the import and UI updates.

## Key Decisions
- The 1916 period should use a reproducible external dataset instead of copied hand-made geometry; CShapes 2.0 is the current chosen baseline because it supports exact 1916 temporal filtering.
- Euratlas remains a verification source for Europe rather than the primary import dataset.
- The production app build should not fail on one-off operational scripts, so `scripts/**/*` stays excluded from the main `tsconfig.json` app type-check scope.
- The existing deliverables list in `memory_bank/projectbrief.md` remains unchanged because no confirmed product-scope change beyond historical dataset coverage has been requested.

## Active Risks
- The direct CShapes download endpoint may be slow or intermittently unavailable from the current environment, so the import script may need to fetch with retry/fallback logic.
- CShapes is a state-boundary dataset and may not capture every WWI occupation or protectorate nuance without later curation.
- Excluding `scripts/**/*` from the main TypeScript scope means those scripts should be validated separately when they are actively edited or executed.
- The repository still contains mixed package-manager metadata while the active workflow rule requires `bun`, so future maintenance should preserve that constraint carefully.
