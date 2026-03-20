# Recent Tasks

## 2026-03-20

### Completed
- Initial project setup with Next.js 16, React 19, TypeScript
- Configured Supabase integration with PostGIS
- Added Leaflet and React-Leaflet for maps
- Set up Tailwind CSS v4
- Created authentication flow structure (login, register, protected routes)
- Added game/duel features (HistoricalDuel component)
- Migrated from static GeoJSON to Supabase database
- Removed old static GeoJSON files and migration scripts (~1MB deleted)
- Added new Supabase import scripts for 1492 and 1914 periods
- Created API routes for map data and game logic
- Fixed all ESLint errors (23 errors → 0)
- Resolved React hooks warnings (useCallback, exhaustive-deps)
- Removed exposed HuggingFace API token (replaced with env variable)
- Added scripts/*.js to ESLint ignore list

### Fixes Applied
- TypeScript strict mode compliance
- React hooks purity rules
- Unused variables removal
- `any` type replacements with proper interfaces
- Escaped JSX entities
- Math.random in useCallback

## Previous
- Initial commit: ChronoScope historical maps application
