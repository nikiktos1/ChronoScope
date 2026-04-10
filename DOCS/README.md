# ChronoScope Architecture

## Overview
ChronoScope is a Next.js 16 application for exploring historical maps with Supabase-backed spatial data, timeline navigation, authentication, AI-assisted alternate history, and a quiz-like duel mode.

## Main Routes
- `/` - main interactive atlas route with the map, timeline, and AI history panel.
- `/enhanced-map` - detailed map route with richer country inspection.
- `/auth/login` - primary login route.
- `/auth/register` - primary registration route.
- `/login` - legacy login route still present in the codebase.
- `/duel` - historical duel gameplay mode.

## Core Modules
- `components/SupabaseMap.tsx` - central Leaflet map renderer.
- `components/TimeSlider.tsx` - year selection and autoplay timeline UI.
- `components/AIHistoryGenerator.tsx` - alternate-history chat interface.
- `components/game/HistoricalDuel.tsx` - gameplay flow built on top of map data.
- `components/auth/*` - authentication UI and wrappers.
- `lib/maps.ts` - Supabase queries for years and map data.
- `lib/auth.ts` - Supabase Auth integration.

## Data Flow
Pages in `app/` compose interactive client components. Map-heavy views dynamically import Leaflet-based components to avoid SSR issues. Data is loaded from Supabase tables through `lib/maps.ts`, while authentication uses Supabase Auth through `lib/auth.ts`.

## Current Scope Notes
- The implemented codebase already includes map rendering, auth, AI, enhanced map, and duel flows.
- Full historical coverage across the intended timeline is still incomplete at the data level.
- Search, event cards, saved user history, and deployment/monitoring workflows remain outside the currently completed scope.
