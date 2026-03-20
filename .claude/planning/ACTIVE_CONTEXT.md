# Active Context

## Current Task
Fixing lint errors and maintaining code quality

## Project Overview
ChronoScope - интерактивный исторический атлас для визуализации карт с 323 г. до н.э. по 2000 год.

## Tech Stack
- **Frontend:** Next.js 16.0.3, React 19.2.0, TypeScript 5
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Maps:** Leaflet 1.9.4, React-Leaflet 5.0.0
- **Styles:** Tailwind CSS v4
- **Package Manager:** pnpm 10.9.0

## Key Files Structure
```
├── app/
│   ├── page.tsx                    # Main map page
│   ├── layout.tsx                  # Root layout
│   ├── api/generate-history/      # AI history generator API
│   ├── auth/login/, register/      # Auth pages
│   ├── duel/                       # Game mode
│   └── enhanced-map/               # Detailed 1914 map
├── components/
│   ├── SupabaseMap.tsx             # Main map component
│   ├── TimeSlider.tsx              # Year selector
│   ├── AIHistoryGenerator.tsx      # AI chat component
│   ├── auth/                       # Auth components
│   └── game/HistoricalDuel.tsx     # Game component
├── lib/
│   ├── supabase-client.ts          # Browser Supabase client
│   ├── supabase-server.ts          # Server Supabase client
│   ├── maps.ts                     # Map data fetching
│   ├── game.ts                     # Game logic
│   └── auth.ts                     # Auth utilities
└── scripts/                        # DB import scripts
```

## Database Schema (Supabase)
- `historical_periods` - periods with year and name
- `countries` - countries with metadata (name, ruler, capital, etc.)
- `country_geometries` - GeoJSON geometries linked to countries
- `map_layers` - additional layers (trade routes, religions, etc.)
- `game_results` - user game scores

## API Routes
- `POST /api/generate-history` - AI-generated alternative history (uses HuggingFace)

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `HUGGINGFACE_API_KEY`

## Current State
- Lint errors fixed (commit de7985f)
- Supabase migration complete - static GeoJSON removed
- All ESLint warnings resolved

## Notes
- ESLint ignores `scripts/*.js` files (legacy CommonJS)
- Map data fetched dynamically from Supabase PostGIS
- AI history generator uses HuggingFace Inference API
