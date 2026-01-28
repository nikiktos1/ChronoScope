const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Настройка Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Необходимо установить переменные окружения');
  process.exit(1);
}

console.log('Используем ключ:', supabaseServiceKey ? 'Найден' : 'Не найден');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Реализованные периоды из TimeSlider
const IMPLEMENTED_PERIODS = [
  { year: -323, file: 'bc323' },
  { year: 100, file: '100' },
  { year: 800, file: '800' },
  { year: 1492, file: '1492' },
  { year: 1815, file: '1815' },
  { year: 1880, file: '1880' },
  { year: 1900, file: '1900' },
  { year: 1914, file: '1914' },
  { year: 1920, file: '1920' },
  { year: 1938, file: '1938' },
  { year: 1945, file: '1945' },
  { year: 2000, file: '2000' }
];

// Европейские страны + Турция и Россия (ключевые слова для фильтрации)
const EUROPEAN_KEYWORDS = [
  // Основные европейские страны
  'Франция', 'France', 'French',
  'Германия', 'Germany', 'German', 'Prussia', 'Пруссия',
  'Италия', 'Italy', 'Italian',
  'Испания', 'Spain', 'Spanish',
  'Португалия', 'Portugal', 'Portuguese',
  'Англия', 'England', 'Britain', 'British', 'United Kingdom', 'Великобритания',
  'Австрия', 'Austria', 'Austrian', 'Austro-Hungarian', 'Австро-Венгрия',
  'Венгрия', 'Hungary', 'Hungarian',
  'Польша', 'Poland', 'Polish',
  'Чехия', 'Czech', 'Bohemia', 'Богемия',
  'Словакия', 'Slovakia', 'Slovak',
  'Румыния', 'Romania', 'Romanian',
  'Болгария', 'Bulgaria', 'Bulgarian',
  'Сербия', 'Serbia', 'Serbian',
  'Хорватия', 'Croatia', 'Croatian',
  'Босния', 'Bosnia', 'Bosnian',
  'Черногория', 'Montenegro',
  'Албания', 'Albania', 'Albanian',
  'Греция', 'Greece', 'Greek',
  'Македония', 'Macedonia', 'Macedonian',
  'Швеция', 'Sweden', 'Swedish',
  'Норвегия', 'Norway', 'Norwegian',
  'Дания', 'Denmark', 'Danish',
  'Финляндия', 'Finland', 'Finnish',
  'Эстония', 'Estonia', 'Estonian',
  'Латвия', 'Latvia', 'Latvian',
  'Литва', 'Lithuania', 'Lithuanian',
  'Беларусь', 'Belarus', 'Belarusian',
  'Украина', 'Ukraine', 'Ukrainian',
  'Молдова', 'Moldova', 'Moldovan',
  'Швейцария', 'Switzerland', 'Swiss',
  'Нидерланды', 'Netherlands', 'Dutch', 'Holland',
  'Бельгия', 'Belgium', 'Belgian',
  'Люксембург', 'Luxembourg',
  'Ирландия', 'Ireland', 'Irish',
  'Исландия', 'Iceland', 'Icelandic',
  'Мальта', 'Malta', 'Maltese',
  'Кипр', 'Cyprus', 'Cypriot',
  'Словения', 'Slovenia', 'Slovenian',
  
  // Россия и Турция
  'Россия', 'Russia', 'Russian', 'Российская империя', 'СССР', 'Soviet',
  'Турция', 'Turkey', 'Turkish', 'Ottoman', 'Османская',
  
  // Исторические образования
  'Holy Roman Empire', 'Священная Римская империя',
  'Byzantine', 'Византия', 'Византийская',
  'Venetian', 'Венеция', 'Венецианская',
  'Papal', 'Папская',
  'Teutonic', 'Тевтонский',
  'Hanseatic', 'Ганзейский',
  'Mongol', 'Монгольская',
  'Viking', 'Викинги',
  'Celtic', 'Кельтский',
  'Roman', 'Римская',
  'Frankish', 'Франкская',
  'Gothic', 'Готская',
  'Lombard', 'Лангобардская'
];

// Функция проверки, является ли страна европейской
function isEuropeanCountry(properties) {
  const name = (properties.NAME || properties.name || '').toLowerCase();
  const nameEn = (properties.name_en || '').toLowerCase();
  const ruler = (properties.ruler || '').toLowerCase();
  const government = (properties.government || '').toLowerCase();
  
  const searchText = `${name} ${nameEn} ${ruler} ${government}`.toLowerCase();
  
  return EUROPEAN_KEYWORDS.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
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
async function migrateEuropeanMaps() {
  const historicalDir = path.join(__dirname, '../public/data/historical');
  
  if (!fs.existsSync(historicalDir)) {
    console.error('Папка с историческими данными не найдена:', historicalDir);
    return;
  }

  console.log(`🗺️  Миграция европейских карт для ${IMPLEMENTED_PERIODS.length} периодов`);
  console.log('Периоды:', IMPLEMENTED_PERIODS.map(p => p.year).join(', '));

  for (const period of IMPLEMENTED_PERIODS) {
    const fileName = `world_${period.file}.geojson`;
    const filePath = path.join(historicalDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Файл не найден: ${fileName}`);
      continue;
    }

    console.log(`\n📅 Обрабатываем период: ${period.year} (${fileName})`);
    
    try {
      // Создаем период
      const periodData = await createPeriod(period.year);
      if (!periodData) continue;

      // Читаем GeoJSON файл
      const geoJsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
        console.log(`❌ Некорректная структура данных в файле: ${fileName}`);
        continue;
      }

      // Фильтруем только европейские страны
      const europeanFeatures = geoJsonData.features.filter(feature => 
        isEuropeanCountry(feature.properties || {})
      );

      console.log(`   📊 Всего территорий: ${geoJsonData.features.length}`);
      console.log(`   🇪🇺 Европейских: ${europeanFeatures.length}`);
      
      if (europeanFeatures.length === 0) {
        console.log(`   ⚠️  Европейские территории не найдены`);
        continue;
      }

      let processedCount = 0;
      let errorCount = 0;

      for (let featureIndex = 0; featureIndex < europeanFeatures.length; featureIndex++) {
        const feature = europeanFeatures[featureIndex];
        try {
          // Создаем страну
          const country = await createCountry(periodData.id, feature.properties || {}, featureIndex);
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
          
          if (processedCount % 5 === 0) {
            console.log(`     ✅ Обработано: ${processedCount}/${europeanFeatures.length}`);
          }
        } catch (error) {
          console.error(`     ❌ Ошибка обработки территории:`, error);
          errorCount++;
        }
      }

      console.log(`   ✅ Завершено: ${processedCount} успешно, ${errorCount} ошибок`);
      
    } catch (error) {
      console.error(`❌ Ошибка обработки файла ${fileName}:`, error);
    }
  }

  console.log('\n🎉 Миграция европейских карт завершена!');
}

// Запуск миграции
if (require.main === module) {
  migrateEuropeanMaps().catch(console.error);
}

module.exports = { migrateEuropeanMaps };