import { supabase } from "../lib/supabase";

async function import1914Data() {
  console.log("🚀 Starting import of 1914 historical data...");

  // 1. Create or get the historical period
  const { data: period, error: periodError } = await supabase
    .from("historical_periods")
    .upsert({ year: 1914, name: "1914: The Eve of WWI" }, { onConflict: 'year' })
    .select()
    .single();

  if (periodError) {
    console.error("❌ Error creating period:", periodError);
    return;
  }

  const periodId = period.id;
  console.log(`✅ Period 1914 ready (ID: ${periodId})`);

  // 2. Define key countries for 1914 (Simplified geometry for example, usually would fetch from external GeoJSON)
  // Since I don't have a local file, I'll create the structure for the most important ones.
  // In a real scenario, we would parse a large world_1914.geojson here.

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
      name: "Египет",
      name_en: "Egypt",
      ruler: "Аббас II Хильми",
      capital: "Каир",
      government: "Хедиват (под протекторатом Великобритании)",
      color: "#cc3300",
      religion: "Ислам",
      part_of: "Османская империя / Британская империя"
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

  console.log("🏁 Import finished. Note: Geometry must be added via GeoJSON upload.");
}

import1914Data();
