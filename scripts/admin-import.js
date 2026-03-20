const { createClient } = require('@supabase/supabase-js');

// Используем SERVICE_ROLE_KEY для обхода RLS (Row Level Security)
const supabaseUrl = 'https://olzwbjmnyyznkvkoujak.supabase.co';
const supabaseServiceKey = 'sb_publishable_j9gZ_YhTwh2nMY3c5Rinjg_oXroiQu_';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importLayers1914() {
  console.log("🚀 Попытка №3: Загрузка слоев с обходом RLS...");

  const { data: period } = await supabase
    .from("historical_periods")
    .select("id")
    .eq("year", 1914)
    .single();

  if (!period) {
    console.error("❌ Период 1914 не найден.");
    return;
  }

  const periodId = period.id;

  const layersData = [
    {
      period_id: periodId,
      layer_type: "trade",
      properties: { name: "Транссибирская магистраль", source: "World History Maps" },
      geometry_data: {
        type: "LineString",
        coordinates: [[30.3, 59.9], [37.6, 55.7], [60.6, 56.8], [82.9, 55.0], [104.3, 52.3], [131.9, 43.1]]
      }
    },
    {
      period_id: periodId,
      layer_type: "trade",
      properties: { name: "Суэцкий канал", source: "Euratlas" },
      geometry_data: {
        type: "LineString",
        coordinates: [[-5.6, 35.9], [14.5, 35.9], [32.3, 31.2], [32.5, 29.9], [42.5, 15.0]]
      }
    },
    {
      period_id: periodId,
      layer_type: "religion",
      properties: { name: "Православие", color: "#3b82f6", source: "AWMC" },
      geometry_data: {
        type: "Polygon",
        coordinates: [[[25, 45], [60, 45], [60, 65], [25, 65], [25, 45]]]
      }
    },
    {
      period_id: periodId,
      layer_type: "religion",
      properties: { name: "Ислам", color: "#10b981", source: "AWMC" },
      geometry_data: {
        type: "Polygon",
        coordinates: [[[10, 20], [50, 20], [50, 35], [10, 35], [10, 20]]]
      }
    },
    {
      period_id: periodId,
      layer_type: "industrial",
      properties: { name: "Рурский промышленный район", intensity: "high" },
      geometry_data: { type: "Point", coordinates: [7.0, 51.5] }
    },
    {
      period_id: periodId,
      layer_type: "industrial",
      properties: { name: "Донецкий бассейн", intensity: "high" },
      geometry_data: { type: "Point", coordinates: [37.8, 48.0] }
    },
    {
      period_id: periodId,
      layer_type: "military",
      properties: { name: "План Шлиффена", side: "Germany" },
      geometry_data: {
        type: "LineString",
        coordinates: [[6.5, 51.0], [4.5, 50.5], [2.5, 49.0]]
      }
    }
  ];

  const { error: insertError } = await supabase
    .from("map_layers")
    .insert(layersData);

  if (insertError) {
    console.error("❌ Ошибка:", insertError.message);
  } else {
    console.log("✅ ДАННЫЕ УСПЕШНО ЗАГРУЖЕНЫ!");
  }
}

importLayers1914();
