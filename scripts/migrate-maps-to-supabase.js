const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Настройка Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Необходимо установить переменные окружения NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Используем ключ:', supabaseServiceKey ? 'Найден' : 'Не найден');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Функция для извлечения года из имени файла
function extractYearFromFilename(filename) {
  const match = filename.match(/world_(\w+)\.geojson$/);
  if (!match) return null;
  
  const yearStr = match[1];
  
  // Обработка BC годов
  if (yearStr.startsWith('bc')) {
    const year = parseInt(yearStr.substring(2));
    return -year; // Отрицательные значения для BC
  }
  
  return parseInt(yearStr);
}

// Функция для создания периода
async function createPeriod(year) {
  const { data, error } = await supabase
    .from('historical_periods')
    .upsert({ 
      year,
      name: year < 0 ? `${Math.abs(year)} до н.э.` : `${year} н.э.`,
      description: `Исторический период ${year < 0 ? Math.abs(year) + ' до н.э.' : year + ' н.э.'}`
    }, { 
      onConflict: 'year',
      ignoreDuplicates: false 
    })
    .select()
    .single();
    
  if (error) {
    console.error('Ошибка создания периода:', error);
    return null;
  }
  
  return data;
}

// Функция для создания страны
async function createCountry(periodId, properties, featureIndex) {
  // Создаем уникальное название для неизвестных территорий
  let countryName = properties.NAME || properties.name;
  if (!countryName || countryName.trim() === '') {
    countryName = `Неизвестная территория ${featureIndex + 1}`;
  }

  const countryData = {
    period_id: periodId,
    name: countryName,
    name_en: properties.NAME,
    ruler: properties.ruler,
    capital: properties.capital,
    government: properties.government,
    color: properties.color,
    abbrevn: properties.ABBREVN,
    subjecto: properties.SUBJECTO,
    border_precision: properties.BORDERPRECISION,
    part_of: properties.PARTOF
  };

  const { data, error } = await supabase
    .from('countries')
    .insert(countryData)
    .select()
    .single();
    
  if (error) {
    console.error('Ошибка создания страны:', error, countryData);
    return null;
  }
  
  return data;
}

// Функция для создания геометрии
async function createGeometry(countryId, geometry) {
  const geometryData = {
    country_id: countryId,
    geometry_type: geometry.type,
    coordinates: geometry.coordinates
  };

  const { data, error } = await supabase
    .from('country_geometries')
    .insert(geometryData)
    .select()
    .single();
    
  if (error) {
    console.error('Ошибка создания геометрии:', error);
    return null;
  }
  
  return data;
}

// Основная функция миграции
async function migrateMapData() {
  const historicalDir = path.join(__dirname, '../public/data/historical');
  
  if (!fs.existsSync(historicalDir)) {
    console.error('Папка с историческими данными не найдена:', historicalDir);
    return;
  }

  const files = fs.readdirSync(historicalDir)
    .filter(file => file.endsWith('.geojson'))
    .sort((a, b) => {
      const yearA = extractYearFromFilename(a);
      const yearB = extractYearFromFilename(b);
      return (yearA || 0) - (yearB || 0);
    });

  console.log(`Найдено ${files.length} файлов для миграции`);

  for (const file of files) {
    const year = extractYearFromFilename(file);
    if (year === null) {
      console.log(`Пропускаем файл с неопределенным годом: ${file}`);
      continue;
    }

    console.log(`\nОбрабатываем период: ${year} (${file})`);
    
    try {
      // Создаем период
      const period = await createPeriod(year);
      if (!period) continue;

      // Читаем GeoJSON файл
      const filePath = path.join(historicalDir, file);
      const geoJsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
        console.log(`Некорректная структура данных в файле: ${file}`);
        continue;
      }

      console.log(`  Найдено ${geoJsonData.features.length} территорий`);
      
      let processedCount = 0;
      let errorCount = 0;

      for (let featureIndex = 0; featureIndex < geoJsonData.features.length; featureIndex++) {
        const feature = geoJsonData.features[featureIndex];
        try {
          // Создаем страну
          const country = await createCountry(period.id, feature.properties || {}, featureIndex);
          if (!country) {
            errorCount++;
            continue;
          }

          // Создаем геометрию
          if (feature.geometry) {
            const geometry = await createGeometry(country.id, feature.geometry);
            if (!geometry) {
              errorCount++;
              continue;
            }
          }

          processedCount++;
          
          if (processedCount % 10 === 0) {
            console.log(`    Обработано: ${processedCount}/${geoJsonData.features.length}`);
          }
        } catch (error) {
          console.error(`    Ошибка обработки территории:`, error);
          errorCount++;
        }
      }

      console.log(`  Завершено: ${processedCount} успешно, ${errorCount} ошибок`);
      
    } catch (error) {
      console.error(`Ошибка обработки файла ${file}:`, error);
    }
  }

  console.log('\nМиграция завершена!');
}

// Запуск миграции
if (require.main === module) {
  migrateMapData().catch(console.error);
}

module.exports = { migrateMapData };