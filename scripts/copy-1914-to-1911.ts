import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
for (const line of envFile.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const nameMap: Record<string, string> = {
  "Королевство Италия": "Kingfom of Italy",
  "Французская Республика": "Франция",
  "Британская империя": "United Kingdom of Great Britain and Ireland",
  "Болгарское царство": "Болгария",
  "Итальянская Ливия": "Kingfom of Italy"
};

async function copyGeometries() {
  console.log('=== Copying geometries from 1914 to 1911 ===');

  const { data: p1914 } = await supabase.from('historical_periods').select('id').eq('year', 1914).single();
  const { data: p1911 } = await supabase.from('historical_periods').select('id').eq('year', 1911).single();

  if (!p1914 || !p1911) {
    console.error('Periods not found!');
    return;
  }

  console.log(`1914 ID: ${p1914.id}, 1911 ID: ${p1911.id}`);

  const { data: countries1914 } = await supabase
    .from('countries')
    .select('id, name, country_geometries(geometry_type, coordinates)')
    .eq('period_id', p1914.id);

  const { data: countries1911 } = await supabase
    .from('countries')
    .select('id, name')
    .eq('period_id', p1911.id);

  if (!countries1914 || !countries1911) {
    console.error('No countries found');
    return;
  }

  console.log(`1914 countries: ${countries1914.length}, 1911 countries: ${countries1911.length}`);

  let copied = 0;

  for (const c11 of countries1911) {
    let c14Name = c11.name;
    if (nameMap[c11.name]) {
      c14Name = nameMap[c11.name];
    }
    
    const c14 = countries1914.find((c) => c.name === c14Name);
    
    if (c14 && c14.country_geometries && c14.country_geometries.length > 0) {
      for (const geom of c14.country_geometries) {
        await supabase.from('country_geometries').insert({
          country_id: c11.id,
          geometry_type: geom.geometry_type,
          coordinates: geom.coordinates
        });
      }
      console.log(`✅ Copied geometry for ${c11.name}`);
      copied++;
    } else {
      console.log(`⚠️ No geometry for ${c11.name} (tried: ${c14Name})`);
    }
  }

  console.log(`\n🏁 Done! Copied ${copied} geometries.`);
}

copyGeometries();
