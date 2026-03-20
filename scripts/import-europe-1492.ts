import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Цвета для основных держав 1492 года
const countryColors: Record<string, string> = {
  'France': '#0055A4',
  'Spain': '#C60B1E',
  'Portugal': '#006600',
  'England': '#C8102E',
  'Scotland': '#0065BD',
  'Ottoman Empire': '#E30A17',
  'Holy Roman Empire': '#FFD700',
  'Poland': '#DC143C',
  'Lithuania': '#FDB913',
  'Hungary': '#436F4D',
  'Venice': '#B31B1B',
  'Papal States': '#FFD700',
  'Muscovy': '#D52B1E',
  'Denmark': '#C60C30',
  'Sweden': '#006AA7',
  'Norway': '#BA0C2F',
};

async function main() {
  try {
    console.log('Загрузка исторических данных 1492 года...');
    console.log('Источник: Historical Basemaps by André Ourednik');
    console.log('URL: https://github.com/aourednik/historical-basemaps');
    
    // Читаем отфильтрованный файл с Европой
    const geojsonData = fs.readFileSync('europe_1492.geojson', 'utf-8');
    const geojson = JSON.parse(geojsonData);
    
    console.log(`Загружено ${geojson.features.length} европейских территорий`);
    
    // Получаем period_id для 1492 года
    const { data: period } = await supabase
      .from('historical_periods')
      .select('id')
      .eq('year', 1492)
      .single();
    
    if (!period) {
      console.error('Период 1492 года не найден');
      return;
    }
    
    console.log(`Period ID для 1492: ${period.id}`);
    
    // Обновляем информацию об источнике данных
    await supabase
      .from('historical_periods')
      .update({
        data_source: 'Historical Basemaps by André Ourednik',
        data_source_url: 'https://github.com/aourednik/historical-basemaps',
        data_source_description: 'Georeferenced historical boundaries for 1492 CE'
      })
      .eq('id', period.id);
    
    // Импортируем каждую территорию
    let imported = 0;
    for (const feature of geojson.features) {
      const props = feature.properties;
      const name = props.NAME;
      const subjecto = props.SUBJECTO;
      const partOf = props.PARTOF;
      const borderPrecision = props.BORDERPRECISION;
      
      console.log(`Импорт: ${name} (${subjecto})`);
      
      // Определяем цвет
      const color = countryColors[name] || countryColors[subjecto] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
      
      // Создаем запись страны
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .insert({
          period_id: period.id,
          name: name,
          name_en: name,
          abbrevn: props.ABBREVN,
          subjecto: subjecto !== name ? subjecto : null,
          part_of: partOf !== name && partOf !== subjecto ? partOf : null,
          border_precision: borderPrecision,
          color: color,
        })
        .select()
        .single();
      
      if (countryError) {
        console.error(`Ошибка создания страны ${name}:`, countryError);
        continue;
      }
      
      // Создаем геометрию
      const { error: geomError } = await supabase
        .from('country_geometries')
        .insert({
          country_id: country.id,
          geometry_type: feature.geometry.type,
          coordinates: feature.geometry.coordinates,
        });
      
      if (geomError) {
        console.error(`Ошибка создания геометрии для ${name}:`, geomError);
      } else {
        imported++;
      }
    }
    
    console.log(`\nИмпорт завершен! Импортировано: ${imported} территорий`);
    console.log('\nИсточник данных:');
    console.log('- Historical Basemaps Collection by André Ourednik');
    console.log('- Лицензия: GPL-3.0');
    console.log('- GitHub: https://github.com/aourednik/historical-basemaps');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

main();
