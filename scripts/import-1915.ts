import { createClient } from '@supabase/supabase-js';

// В Bun переменные окружения из .env.local доступны через process.env автоматически
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Ошибка: Не найдены ключи Supabase. Проверьте .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function import1915Data() {
  console.log("🚀 Начинаю импорт данных за 1915 год...");

  // 1. Создаем период
  const { data: period, error: periodError } = await supabase
    .from("historical_periods")
    .upsert({
        year: 1915,
        name: "1915: Великая война",
        description: "Разгар Первой мировой войны. Вступление Италии и Болгарии."
    }, { onConflict: 'year' })
    .select()
    .single();

  if (periodError) {
    console.error("❌ Ошибка создания периода:", periodError.message);
    return;
  }

  const periodId = period.id;
  console.log(`✅ Период 1915 готов (ID: ${periodId})`);

  // 2. Список стран
  const countries = [
    { name: "Российская империя", name_en: "Russian Empire", capital: "Петроград", color: "#3366cc", part_of: null },
    { name: "Германская империя", name_en: "German Empire", capital: "Берлин", color: "#303030", part_of: null },
    { name: "Австро-Венгрия", name_en: "Austria-Hungary", capital: "Вена", color: "#ffcc00", part_of: null },
    { name: "Королевство Италия", name_en: "Kingdom of Italy", capital: "Рим", color: "#009246", part_of: null },
    { name: "Болгарское царство", name_en: "Kingdom of Bulgaria", capital: "София", color: "#00966e", part_of: null },
    { name: "Султанат Египет", name_en: "Sultanate of Egypt", capital: "Каир", color: "#cc3300", part_of: "Британская империя" }
  ];

  for (const country of countries) {
    const { error: cError } = await supabase
      .from("countries")
      .upsert({ period_id: periodId, ...country }, { onConflict: 'period_id, name' });

    if (cError) console.error(`❌ Ошибка ${country.name}:`, cError.message);
    else console.log(`✅ Добавлено: ${country.name}`);
  }

  console.log("🏁 Импорт завершен. Теперь период 1915 существует в базе.");
}

import1915Data();
