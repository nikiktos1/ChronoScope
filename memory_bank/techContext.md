# Tech Context

## Stack
- Framework: Next.js 16 with App Router.
- UI: React 19 and Tailwind CSS v4.
- Language: TypeScript.
- Maps: Leaflet and React-Leaflet.
- Backend services: Supabase Auth and PostgreSQL/PostGIS.

## Package Management
- The active workspace contains `package-lock.json`, `pnpm-lock.yaml`, and `bun.lock`.
- `package.json` declares `pnpm` in `packageManager`, but the upstream agent rule requested by the user says to use `bun` going forward.
- This mismatch is a project-level constraint to keep in mind for future implementation work.

## Key Files
- `app/page.tsx`: main atlas experience.
- `app/enhanced-map/page.tsx`: detailed map route.
- `app/duel/page.tsx`: game route.
- `app/api/generate-history/route.ts`: AI generation endpoint.
- `components/SupabaseMap.tsx`: interactive Leaflet map.
- `lib/maps.ts`: Supabase map and year queries.
- `lib/auth.ts`: auth operations.

## Operational Constraints
- Leaflet requires client-only rendering.
- Supabase environment variables must be configured for the app to function fully.
- The public map flow depends on anon-readable access to both `countries` and `country_geometries`; the client code now avoids nested REST embeds to reduce PostgREST relation-resolution fragility.
- The current dataset contains malformed polygon coordinate nesting in at least some map rows, so the client includes defensive geometry normalization to keep rendering stable.
- `SUPABASE_SERVICE_ROLE_KEY` is required only for privileged maintenance tasks such as data repair scripts and full-database audits; the public map runtime does not depend on it.
- The workspace is a local git repository, but it currently has no configured remote, so push operations require remote setup before they can succeed.
- Markdown files are exempt from Biome checks per the upstream agent rule.
