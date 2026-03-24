import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Ошибка: Не найдены ключи Supabase");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function import1911Data() {
  console.log("🚀 Starting import of 1911 historical data (Europe only)...");

  const { data: period, error: periodError } = await supabase
    .from("historical_periods")
    .select("id")
    .eq("year", 1911)
    .single();

  if (periodError || !period) {
    console.error("❌ Period 1911 not found:", periodError);
    return;
  }

  const periodId = period.id;
  console.log(`✅ Period 1911 ready (ID: ${periodId})`);

  await supabase.from("countries").delete().eq("period_id", periodId);
  console.log("🗑️ Cleared old countries");

  const countriesData = [
    {
      name: "Российская империя",
      name_en: "Russian Empire",
      ruler: "Николай II",
      capital: "Санкт-Петербург",
      government: "Абсолютная монархия",
      color: "#3366cc",
      religion: "Православие",
      part_of: null
    },
    {
      name: "Германская империя",
      name_en: "German Empire",
      ruler: "Вильгельм II",
      capital: "Берлин",
      government: "Конституционная монархия",
      color: "#333333",
      religion: "Протестантизм/Католицизм",
      part_of: null
    },
    {
      name: "Австро-Венгрия",
      name_en: "Austria-Hungary",
      ruler: "Франц Иосиф I",
      capital: "Вена / Будапешт",
      government: "Дуалистическая монархия",
      color: "#ffcc00",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Османская империя",
      name_en: "Ottoman Empire",
      ruler: "Мехмед V",
      capital: "Константинополь",
      government: "Абсолютная монархия",
      color: "#cc3300",
      religion: "Ислам",
      part_of: null
    },
    {
      name: "Королевство Италия",
      name_en: "Kingdom of Italy",
      ruler: "Виктор Эммануил III",
      capital: "Рим",
      government: "Конституционная монархия",
      color: "#009246",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Итальянская Ливия",
      name_en: "Italian Libya",
      ruler: "Виктор Эммануил III",
      capital: "Триполи",
      government: "Колония",
      color: "#009246",
      religion: "Ислам",
      part_of: "Королевство Италия"
    },
    {
      name: "Французская Республика",
      name_en: "French Republic",
      ruler: "Арман Фальер",
      capital: "Париж",
      government: "Республика",
      color: "#0055a4",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Британская империя",
      name_en: "British Empire",
      ruler: "Георг V",
      capital: "Лондон",
      government: "Конституционная монархия",
      color: "#c8102e",
      religion: "Протестантизм",
      part_of: null
    },
    {
      name: "Болгарское царство",
      name_en: "Kingdom of Bulgaria",
      ruler: "Фердинанд I",
      capital: "София",
      government: "Конституционная монархия",
      color: "#00966e",
      religion: "Православие",
      part_of: null
    },
    {
      name: "Сербия",
      name_en: "Kingdom of Serbia",
      ruler: "Пётр I",
      capital: "Белград",
      government: "Конституционная монархия",
      color: "#0c4076",
      religion: "Православие",
      part_of: null
    },
    {
      name: "Черногория",
      name_en: "Kingdom of Montenegro",
      ruler: "Никола I",
      capital: "Цетине",
      government: "Конституционная монархия",
      color: "#b71c1c",
      religion: "Православие",
      part_of: null
    },
    {
      name: "Греция",
      name_en: "Kingdom of Greece",
      ruler: "Георг I",
      capital: "Афины",
      government: "Конституционная монархия",
      color: "#001489",
      religion: "Православие",
      part_of: null
    },
    {
      name: "Бельгия",
      name_en: "Kingdom of Belgium",
      ruler: "Альберт I",
      capital: "Брюссель",
      government: "Конституционная монархия",
      color: "#ffce00",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Нидерланды",
      name_en: "Kingdom of the Netherlands",
      ruler: "Вильгельмина",
      capital: "Амстердам",
      government: "Конституционная монархия",
      color: "#ff6600",
      religion: "Протестантизм",
      part_of: null
    },
    {
      name: "Швейцария",
      name_en: "Swiss Confederation",
      ruler: "Федеральный совет",
      capital: "Берн",
      government: "Конфедерация",
      color: "#d52b1e",
      religion: "Протестантизм/Католицизм",
      part_of: null
    },
    {
      name: "Португалия",
      name_en: "Kingdom of Portugal",
      ruler: "Мануэль II",
      capital: "Лиссабон",
      government: "Конституционная монархия",
      color: "#006600",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Испания",
      name_en: "Kingdom of Spain",
      ruler: "Альфонс XIII",
      capital: "Мадрид",
      government: "Конституционная монархия",
      color: "#aa151b",
      religion: "Католицизм",
      part_of: null
    },
    {
      name: "Швеция",
      name_en: "Kingdom of Sweden",
      ruler: "Густав V",
      capital: "Стокгольм",
      government: "Конституционная монархия",
      color: "#006aa7",
      religion: "Протестантизм",
      part_of: null
    },
    {
      name: "Норвегия",
      name_en: "Kingdom of Norway",
      ruler: "Хокон VII",
      capital: "Осло",
      government: "Конституционная монархия",
      color: "#ba0c2f",
      religion: "Протестантизм",
      part_of: null
    },
    {
      name: "Дания",
      name_en: "Kingdom of Denmark",
      ruler: "Кристиан X",
      capital: "Копенгаген",
      government: "Конституционная монархия",
      color: "#c8102e",
      religion: "Протестантизм",
      part_of: null
    },
    {
      name: "Румыния",
      name_en: "Kingdom of Romania",
      ruler: "Кароль I",
      capital: "Бухарест",
      government: "Конституционная монархия",
      color: "#002b7f",
      religion: "Православие",
      part_of: null
    }
  ];

  for (const country of countriesData) {
    const { error: countryError } = await supabase
      .from("countries")
      .upsert({
        period_id: periodId,
        ...country
      }, { onConflict: 'period_id, name' })
      .select()
      .single();

    if (countryError) {
      console.error(`❌ Error importing ${country.name}:`, countryError);
    } else {
      console.log(`✅ Imported: ${country.name}`);
    }
  }

  console.log("🏁 Import finished (Europe only).");
}

import1911Data();
