# ChronoScope - Правила работы с проектом

## О проекте
ChronoScope - интерактивный исторический атлас для визуализации карт с 323 г. до н.э. по 2000 год. Next.js 16 + Supabase + Leaflet.

## Стек технологий
- **Frontend:** Next.js 16, React 19, TypeScript
- **База данных:** Supabase (PostgreSQL + PostGIS)
- **Карты:** Leaflet, React-Leaflet
- **Стили:** Tailwind CSS v4
- **Пакетный менеджер:** pnpm

## Соглашения по коду

### Структура файлов
```
├── app/                    # App Router (page.tsx, layout.tsx, api/)
├── components/             # React компоненты
│   ├── auth/              # Компоненты авторизации
│   └── game/              # Игровые компоненты
├── lib/                   # Утилиты и клиенты
├── scripts/               # Скрипты для работы с БД
└── DOCS/                  # Документация
```

### Импорты
- Использовать `@/` для абсолютных импортов
- Пути: `@/components/...`, `@/lib/...`, `@/app/...`

### Стилизация
- Tailwind CSS v4 (CSS-first конфигурация)
- CSS переменные для темизации в `app/globals.css`

### База данных
- Supabase клиент в `lib/supabase-client.ts` и `lib/supabase-server.ts`
- Геометрии хранятся в PostGIS (таблица `historical_borders`)
- Импорт данных через скрипты в `scripts/*.ts`

### API маршруты
- `app/api/` - API routes для серверной логики
- Аутентификация через Supabase Auth

## Процесс разработки

### Перед началом работы
1. Проверить Memory Bank (.claude/planning/)
2. Обновить ACTIVE_CONTEXT.md с текущей задачей

### После завершения задачи
1. Запустить `pnpm lint` для проверки кода
2. Проверить сборку `pnpm build`
3. Обновить RECENT_TASKS.md
4. Зафиксировать изменения

### Коммиты
- Использовать понятные сообщения на английском
- Формат: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Пример: `feat: add authentication flow`

## Команды

```bash
pnpm dev          # Запуск dev сервера
pnpm build        # Сборка
pnpm start        # Продакшен сервер
pnpm lint         # Линтинг
```
