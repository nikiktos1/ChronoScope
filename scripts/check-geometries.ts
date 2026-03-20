import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function check1914Geometry() {
  const { data: period } = await supabase.from("historical_periods").select("id").eq("year", 1914).single();
  if (!period) return console.log("Период 1914 не найден");

  const { data: countries } = await supabase.from("countries").select("id, name, country_geometries(id)").eq("period_id", period.id);

  console.log(`Проверка 1914 года (ID: ${period.id}):`);
  countries?.forEach(c => {
    console.log(`- ${c.name}: ${c.country_geometries?.length || 0} геометрий`);
  });
}

check1914Geometry();
