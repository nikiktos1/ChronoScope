# Tech Context

## Стек технологий
- **Frontend:** Next.js 16, React 19, TypeScript
- **База данных:** Supabase (PostgreSQL + PostGIS)
- **Карты:** Leaflet, React-Leaflet
- **Стили:** Tailwind CSS v4
- **Пакетный менеджер:** pnpm

## Ограничения
- PostGIS требует настроенной Supabase базы данных
- Leaflet требует динамического импорта (нет SSR)

## Зависимости
- next: ^16.0.0
- react: ^19.0.0
- react-dom: ^19.0.0
- @supabase/supabase-js: ^2.x
- @supabase/ssr: ^0.x
- leaflet: ^1.9.x
- react-leaflet: ^5.x
- tailwindcss: ^4.0.0

## CI/CD
- Локальная разработка: pnpm dev
- Сборка: pnpm build
- Линтинг: pnpm lint
