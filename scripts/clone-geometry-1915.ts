import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function cloneGeometryTo1915() {
  console.log("🚀 Начинаю привязку геометрии для 1915 года...");

  // 1. Получаем ID периодов
  const { data: p1914 } = await supabase.from("historical_periods").select("id").eq("year", 1914).single();
  const { data: p1915 } = await supabase.from("historical_periods").select("id").eq("year", 1915).single();

  if (!p1914 || !p1915) return console.error("❌ Не найдены периоды 1914 или 1915");

  // 2. Получаем страны 1915 года
  const { data: countries1915 } = await supabase.from("countries").select("*").eq("period_id", p1915.id);

  // 3. Получаем все страны 1914 года с геометрией для копирования
  const { data: countries1914 } = await supabase
    .from("countries")
    .select("name, country_geometries(geometry_type, coordinates)")
    .eq("period_id", p1914.id);

  if (!countries1915 || !countries1914) return;

  for (const c15 of countries1915) {
    // Ищем такую же страну в 1914 году (или похожую по названию)
    const sourceCountry = countries1914.find(c14 => c14.name === c15.name ||
      (c15.name === "Российская империя" && c14.name === "Российская империя") ||
      (c15.name === "Султанат Египет" && c14.name === "Египет"));

    if (sourceCountry && sourceCountry.country_geometries) {
      console.log(`📦 Копирую геометрию для: ${c15.name} (Источник: 1914 год)`);

      const geometries = Array.isArray(sourceCountry.country_geometries)
        ? sourceCountry.country_geometries
        : [sourceCountry.country_geometries];

      for (const geom of geometries) {
        const { error: gError } = await supabase.from("country_geometries").insert({
          country_id: c15.id,
          geometry_type: geom.geometry_type,
          coordinates: geom.coordinates
        });

        if (gError) console.error(`❌ Ошибка копирования для ${c15.name}:`, gError.message);
      }
    } else {
      console.warn(`⚠️ Не найдена исходная геометрия для: ${c15.name}`);
    }
  }

  console.log("🏁 Геометрия для 1915 года успешно импортирована!");
}

cloneGeometryTo1915();
