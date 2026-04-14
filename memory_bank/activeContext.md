# Active Context

## Current Task
Verify that the project completes a production server build and fix any blocking type or compile errors.

## In Progress
- A production `bun run build` verification is being executed against the current workspace state.
- A TypeScript build blocker in `lib/maps.ts` has been identified in the 1914 Britain geometry replacement path and is being corrected minimally.
- The workspace `tsconfig.json` is being narrowed so production builds type-check the app code without being blocked by ad-hoc data-import scripts under `scripts/`.
- `memory_bank/projectbrief.md` still contains the required `## Project Deliverables` Markdown table with a verified exact weight sum of `100`.

## Key Decisions
- Build verification uses `bun run build` to match the repository workflow requirement.
- The current build fix is intentionally minimal: align the replacement geometry assignment with the `GeoJSON.Geometry` type expected by the feature object rather than refactoring the whole map typing model.
- The production app build should not fail on one-off operational scripts, so `scripts/**/*` is excluded from the main `tsconfig.json` app type-check scope.
- The existing deliverables list in `memory_bank/projectbrief.md` remains unchanged because no confirmed product-scope change has been requested.

## Active Risks
- Additional build blockers may still exist after the current `lib/maps.ts` type fix, so another full build pass is required before declaring the server build healthy.
- Excluding `scripts/**/*` from the main TypeScript scope means those scripts should be validated separately when they are actively edited or executed.
- The repository still contains mixed package-manager metadata while the active workflow rule requires `bun`, so future maintenance should preserve that constraint carefully.
- Public Supabase access remains limited to the anon key in `.env.local`, so direct dataset correction from the workspace is constrained.
