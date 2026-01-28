# ChronoScope - Интерактивный исторический атлас

Веб-приложение для визуализации исторических карт с интеграцией Supabase для хранения данных.

## Возможности

- 📍 Интерактивные исторические карты
- 🕐 Временная шкала для навигации по периодам
- 🗄️ Хранение данных в Supabase
- 🔍 Поиск по странам и территориям
- 📱 Адаптивный дизайн

## Быстрый старт

1. **Установите зависимости:**
   ```bash
   pnpm install
   ```

2. **Настройте переменные окружения:**
   ```bash
   cp .env.local.example .env.local
   ```
   Заполните значения из вашего Supabase проекта.

3. **Запустите сервер разработки:**
   ```bash
   pnpm dev
   ```

4. **Откройте в браузере:**
   - Основное приложение: [http://localhost:3000](http://localhost:3000)
   - Демо Supabase: [http://localhost:3000/supabase-demo](http://localhost:3000/supabase-demo)

## Миграция данных в Supabase

Подробные инструкции см. в [MIGRATION.md](./MIGRATION.md)

### Быстрая миграция:

1. Получите Service Role Key из Supabase Dashboard
2. Добавьте его в `.env.local`
3. Запустите миграцию:
   ```bash
   # Тестовая миграция (3 страны из 1914 года)
   pnpm run test-migration
   
   # Полная миграция всех карт
   pnpm run migrate-maps
   ```

## Структура проекта

```
├── app/                    # Next.js App Router
├── components/            # React компоненты
│   ├── Map1914.tsx       # Статическая карта 1914
│   ├── SupabaseMap.tsx   # Карта из Supabase
│   └── TimeSlider.tsx    # Временная шкала
├── lib/                  # Утилиты
│   ├── supabase.ts      # Клиент Supabase
│   └── maps.ts          # API для работы с картами
├── scripts/             # Скрипты миграции
├── data/               # Статические данные
└── public/data/        # GeoJSON файлы
```

## API для работы с картами

```typescript
import { getMapForYear, getAvailableYears, searchCountries } from '@/lib/maps'

// Получить карту для года
const map = await getMapForYear(1914)

// Список доступных лет
const years = await getAvailableYears()

// Поиск стран
const results = await searchCountries('Россия', 1914)
```

## Технологии

- **Frontend:** Next.js 16, React 19, TypeScript
- **Карты:** Leaflet, React-Leaflet
- **База данных:** Supabase (PostgreSQL)
- **Стили:** Tailwind CSS
- **Пакетный менеджер:** pnpm

## Разработка

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка для продакшена
pnpm build

# Запуск продакшен сервера
pnpm start

# Линтинг
pnpm lint
```
