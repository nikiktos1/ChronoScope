import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importLayers1914() {
  console.log("🚀 Importing additional layers for 1914...");

  // 1. Get or Create 1914 period ID
  let { data: period, error: periodError } = await supabase
    .from("historical_periods")
    .select("id")
    .eq("year", 1914)
    .single();

  if (periodError || !period) {
    console.log("Creating period 1914...");
    const { data: newPeriod, error: createError } = await supabase
        .from("historical_periods")
        .insert({ year: 1914, name: "1914: The Eve of WWI" })
        .select()
        .single();

    if (createError) {
        console.error("❌ Error creating period:", createError);
        return;
    }
    period = newPeriod;
  }

  const periodId = period!.id;
  console.log(`✅ Using Period ID: ${periodId}`);

  const layersData = [
    // --- TRADE ROUTES ---
    {
      period_id: periodId,
      layer_type: "trade",
      properties: { name: "Транссибирская магистраль", description: "Главная ж/д артерия Российской империи" },
      geometry_data: {
        type: "LineString",
        coordinates: [[30.3, 59.9], [37.6, 55.7], [60.6, 56.8], [82.9, 55.0], [104.3, 52.3], [131.9, 43.1]]
      }
    },
    {
      period_id: periodId,
      layer_type: "trade",
      properties: { name: "Суэцкий канал", description: "Ключевой морской путь Британской империи" },
      geometry_data: {
        type: "LineString",
        coordinates: [[-5.6, 35.9], [14.5, 35.9], [32.3, 31.2], [32.5, 29.9], [42.5, 15.0]]
      }
    },
    // --- RELIGION ---
    {
      period_id: periodId,
      layer_type: "religion",
      properties: { name: "Православие", color: "#3b82f6" },
      geometry_data: {
        type: "Polygon",
        coordinates: [[[25, 45], [60, 45], [60, 65], [25, 65], [25, 45]]]
      }
    },
    {
      period_id: periodId,
      layer_type: "religion",
      properties: { name: "Ислам", color: "#10b981" },
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
      properties: { name: "Донецкий каменноугольный бассейн", intensity: "high" },
      geometry_data: {
        type: "Point",
        coordinates: [37.8, 48.0]
      }
    },
    // --- MILITARY ---
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

  console.log(`📤 Uploading ${layersData.length} features to map_layers...`);

  const { error: insertError } = await supabase
    .from("map_layers")
    .upsert(layersData);

  if (insertError) {
    console.error("❌ Error uploading layers:", insertError);
    if (insertError.code === '42P01') {
        console.error("💡 Table 'map_layers' does not exist. You need to create it in Supabase SQL editor.");
    }
  } else {
    console.log("✅ All layers successfully imported for 1914!");
  }
}

importLayers1914();
