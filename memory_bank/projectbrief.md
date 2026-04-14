# Project Brief

## Overview
ChronoScope is an interactive historical atlas focused on exploring political borders, timelines, and contextual historical information from antiquity to the modern era.

## Goals
- Provide an interactive historical map UI backed by Supabase and PostGIS.
- Let users move between supported historical years with a timeline-driven experience.
- Support user authentication for personalized features.
- Add exploratory modes such as detailed country inspection, alternate history generation, and quiz gameplay.

## Scope
- Frontend: Next.js 16, React 19, TypeScript.
- Data layer: Supabase, PostgreSQL, PostGIS.
- Maps: Leaflet and React-Leaflet.
- Styling: Tailwind CSS v4.
- Runtime and scripts: bun is the preferred package manager by project rule, while the current repository also contains pnpm metadata.

## Project Deliverables

| ID | Deliverable | Status | Weight |
|----|-------------|--------|--------|
| PR-01 | Core interactive map experience with Supabase-backed borders | completed | 24 |
| PR-02 | Timeline navigation across supported historical years | completed | 12 |
| PR-03 | Detailed country view and enhanced map route | completed | 12 |
| PR-04 | User authentication flows for login and registration | completed | 14 |
| PR-05 | Alternate history generation flow via AI API | completed | 12 |
| PR-06 | Historical duel gameplay mode with score persistence | completed | 10 |
| PR-07 | Historical dataset coverage across target product periods | in_progress | 8 |
| PR-08 | Search, event cards, and richer historical metadata UX | pending | 3 |
| PR-09 | User profile, favorites, and saved history features | pending | 3 |
| PR-10 | Deployment, CI/CD, and production monitoring setup | pending | 2 |

## Validation
Deliverables weight self-check: 24 + 12 + 12 + 14 + 12 + 10 + 8 + 3 + 3 + 2 = 100.
