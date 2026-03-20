const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olzwbjmnyyznkvkoujak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sendiam1ueXl6bmt2a291amFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjE3MDksImV4cCI6MjA4NDEzNzcwOX0.DX8aplLclnBK0slVOc6Va9LKW4W9M8KJPtAIQItEi6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importLayers1914() {
  console.log("🚀 Загрузка слоев для 1914 года в таблицу map_layers...");

  // 1. Получаем ID периода 1914
  const { data: period, error: periodError } = await supabase
    .from("historical_periods")
    .select("id")
    .eq("year", 1914)
    .single();

  if (periodError || !period) {
    console.error("❌ Период 1914 не найден. Сначала нужно создать период.");
    return;
  }

  const periodId = period.id;
  console.log(`✅ ID периода 1914: ${periodId}`);

  const layersData = [
    // --- TRADE ROUTES ---
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
    // --- RELIGION ---
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
    // --- INDUSTRIAL ---
    {
      period_id: periodId,
      layer_type: "industrial",
      properties: { name: "Рурский промышленный район", intensity: "high" },
      geometry_data: {
        type: "Point",
        coordinates: [7.0, 51.5]
      }
    },
    {
      period_id: periodId,
      layer_type: "industrial",
      properties: { name: "Донецкий бассейн (Юзовка)", intensity: "high" },
      geometry_data: {
        type: "Point",
        coordinates: [37.8, 48.0]
      }
    },
    // --- MILITARY ---
    {
      period_id: periodId,
      layer_type: "military",
      properties: { name: "План Шлиффена (наступление)", side: "Central Powers" },
      geometry_data: {
        type: "LineString",
        coordinates: [[6.5, 51.0], [4.5, 50.5], [2.5, 49.0]]
      }
    },
    {
      period_id: periodId,
      layer_type: "military",
      properties: { name: "Галицийская битва (наступление РФ)", side: "Entente" },
      geometry_data: {
        type: "LineString",
        coordinates: [[25.0, 50.0], [24.0, 49.5], [22.5, 49.0]]
      }
    }
  ];

  console.log(`📤 Загрузка ${layersData.length} объектов в map_layers...`);

  const { data, error: insertError } = await supabase
    .from("map_layers")
    .insert(layersData);

  if (insertError) {
    console.error("❌ Ошибка при загрузке слоев:", insertError.message);
  } else {
    console.log("✅ Все слои успешно загружены в базу данных!");
  }
}

importLayers1914();
