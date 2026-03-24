# System Patterns

## Архитектура
Next.js 16 App Router с серверными и клиентскими компонентами.

## Основные модули

### Картографический модуль
- Использует React-Leaflet для рендеринга карт
- Данные загружаются из Supabase (PostGIS)
- Поддержка GeoJSON формата

### Аутентификация
- Supabase Auth для управления пользователями
- AuthProvider wrapper для React контекста
- Страницы: /auth/login, /auth/register

### API Routes
- app/api/ - серверные API маршруты

## Связи подсистем
- Supabase клиент используется на клиенте (supabase-client.ts) и сервере (supabase-server.ts)
- Leaflet загружается динамически с ssr: false
- AI компонент интегрирован в основную страницу

## Паттерны
- Динамический импорт для карт (next/dynamic)
- React Context для авторизации
- CSS переменные для темизации в globals.css
