# Active Context

## Current Task
Synchronize the project with the current upstream `AGENTS.md` policy, verify `memory_bank/projectbrief.md`, update Memory Bank documents, and commit/push the current workspace state.

## In Progress
- The upstream `AGENTS.md` from `Ravva/projects-tracker` has been checked and is being used as the active rule set.
- `memory_bank/projectbrief.md` contains the required `## Project Deliverables` Markdown table with canonical columns and a verified exact weight sum of `100`.
- Memory Bank documents are being resynchronized with the actual repository state, including the configured `origin` remote and the current pending worktree changes.

## Key Decisions
- The existing deliverables list in `memory_bank/projectbrief.md` remains unchanged because it already matches the current documented product scope.
- Only stale operational Memory Bank files are being corrected; no product scope or architecture entries are being expanded without a confirmed scope change.
- All current workspace changes will be committed and pushed together because the user explicitly requested commit and push of all files.

## Active Risks
- The commit will include pre-existing code changes in `components/SupabaseMap.tsx`; this matches the explicit user request to commit and push all files.
- The repository still contains mixed package-manager metadata while the active workflow rule requires `bun`, so future maintenance should preserve that constraint carefully.
- Public Supabase access remains limited to the anon key in `.env.local`, so direct dataset correction from the workspace is constrained.
