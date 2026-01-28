# Миграция карт в Supabase

## Подготовка

1. **Установите зависимости:**
   ```bash
   pnpm install
   ```

2. **Настройте переменные окружения:**
   - Скопируйте `.env.local.example` в `.env.local`
   - Заполните значения из вашего Supabase проекта:
     - `NEXT_PUBLIC_SUPABASE_URL` - URL проекта
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - публичный ключ
     - `SUPABASE_SERVICE_ROLE_KEY` - сервисный ключ (для миграции)

3. **Получите Service Role Key:**
   - Откройте Supabase Dashboard
   - Перейдите в Settings → API
   - Скопируйте "service_role" ключ в переменную `SUPABASE_SERVICE_ROLE_KEY`

## Структура базы данных

Созданы следующие таблицы:

### `historical_periods`
- `id` - уникальный идентификатор
- `year` - год (отрицательные для до н.э.)
- `name` - название периода
- `description` - описание

### `countries`
- `id` - уникальный идентификатор
- `period_id` - ссылка на период
- `name` - название страны/территории
- `name_en` - название на английском
- `ruler` - правитель
- `capital` - столица
- `government` - форма правления
- `color` - цвет на карте
- `abbrevn`, `subjecto`, `border_precision`, `part_of` - дополнительные поля

### `country_geometries`
- `id` - уникальный идентификатор
- `country_id` - ссылка на страну
- `geometry_type` - тип геометрии (Polygon, MultiPolygon)
- `coordinates` - координаты границ

## Запуск миграции

```bash
pnpm run migrate-maps
```

Скрипт автоматически:
1. Обработает все файлы в `public/data/historical/`
2. Извлечет годы из названий файлов
3. Создаст периоды в базе данных
4. Загрузит страны и их границы

## Использование в коде

```typescript
import { getMapForYear, getAvailableYears, searchCountries } from '@/lib/maps'

// Получить карту для конкретного года
const map = await getMapForYear(1914)

// Получить список доступных лет
const years = await getAvailableYears()

// Поиск стран
const results = await searchCountries('Россия', 1914)
```

## Мониторинг

После миграции проверьте:
- Количество созданных периодов
- Количество стран по периодам
- Корректность геометрии

Используйте Supabase Dashboard для просмотра данных и выполнения SQL запросов.