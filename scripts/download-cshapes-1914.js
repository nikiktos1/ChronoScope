const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CShapes - самый точный источник исторических границ
const CSHAPES_URLS = [
  'https://github.com/nils-weidmann/cshapes/raw/master/data/cshapes.geojson',
  'https://raw.githubusercontent.com/nils-weidmann/cshapes/master/data/cshapes.geojson',
  // Альтернативные источники
  'https://www.correlatesofwar.org/data-sets/colonial-dependency-contiguity/cshapes-dataset',
  'http://nils.weidmann.ws/projects/cshapes.html'
];

async function downloadCShapes1914() {
  console.log('🗺️  Загружаем исторические границы 1914 года из CShapes dataset...');
  console.log('📍 Источник: https://github.com/nils-weidmann/cshapes');
  console.log('📊 CShapes содержит точные границы стран с 1886 по 2019 год\n');
  
  let cshapesData = null;
  
  // Пробуем загрузить из разных источников
  for (const url of CSHAPES_URLS) {
    try {
      console.log(`Попытка загрузки из: ${url}`);
      
      const response = await axios.get(url, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'ChronoScope Historical Maps Downloader'
        }
      });
      
      if (response.data && response.data.features) {
        cshapesData = response.data;
        console.log(`✅ Успешно загружено ${response.data.features.length} объектов`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Ошибка загрузки из ${url}: ${error.message}`);
      continue;
    }
  }
  
  if (!cshapesData) {
    console.log('\n⚠️  CShapes недоступен. Используем альтернативный источник...');
    return await downloadAlternativeHistoricalData();
  }
  
  // Фильтруем данные для 1914 года
  console.log('\n🔍 Фильтруем данные для 1914 года...');
  
  const features1914 = cshapesData.features.filter(feature => {
    const props = feature.properties;
    // CShapes использует GWSYEAR (start year) и GWEYEAR (end year)
    const startYear = props.GWSYEAR || props.START_YEAR || props.start_year;
    const endYear = props.GWEYEAR || props.END_YEAR || props.end_year;
    
    return startYear <= 1914 && endYear >= 1914;
  });
  
  console.log(`📊 Найдено ${features1914.length} стран для 1914 года`);
  
  if (features1914.length === 0) {
    console.log('⚠️  Не найдено данных для 1914 года в CShapes');
    return await downloadAlternativeHistoricalData();
  }
  
  // Сохраняем исходные данные
  fs.writeFileSync('data/cshapes-1914-raw.json', JSON.stringify({
    type: 'FeatureCollection',
    features: features1914,
    metadata: {
      source: 'CShapes Dataset',
      year: 1914,
      downloaded: new Date().toISOString()
    }
  }, null, 2));
  
  console.log('💾 Данные сохранены в data/cshapes-1914-raw.json');
  
  // Обрабатываем и загружаем в Supabase
  return await processCShapesData1914(features1914);
}

async function processCShapesData1914(features) {
  console.log('\n🔄 Обрабатываем данные CShapes для 1914 года...');
  
  const { data: period } = await supabase
    .from('historical_periods')
    .select('id')
    .eq('year', 1914)
    .single();
  
  if (!period) {
    console.error('❌ Период 1914 года не найден в базе данных');
    return;
  }
  
  // Очищаем существующие данные 1914 года
  console.log('🧹 Очищаем существующие данные 1914 года...');
  
  const { data: existingCountries } = await supabase
    .from('countries')
    .select('id')
    .eq('period_id', period.id);
  
  if (existingCountries && existingCountries.length > 0) {
    // Удаляем геометрии
    await supabase
      .from('country_geometries')
      .delete()
      .in('country_id', existingCountries.map(c => c.id));
    
    // Удаляем страны
    await supabase
      .from('countries')
      .delete()
      .eq('period_id', period.id);
  }
  
  console.log('✅ Существующие данные очищены');
  
  // Добавляем новые данные из CShapes
  let successCount = 0;
  let errorCount = 0;
  
  for (const feature of features) {
    const props = feature.properties;
    
    // Извлекаем название страны
    const countryName = props.CNTRY_NAME || props.NAME || props.name || 
                       props.COUNTRY || props.country || 'Неизвестная страна';
    
    // Извлекаем дополнительную информацию
    const countryCode = props.COWCODE || props.COW || props.code;
    const capital = props.CAPITAL || props.capital;
    
    console.log(`📍 Добавляем: ${countryName} (${countryCode || 'без кода'})`);
    
    try {
      // Создаем страну
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .insert({
          period_id: period.id,
          name: countryName,
          name_en: countryName,
          capital: capital,
          abbrevn: countryCode,
          border_precision: 5, // Максимальная точность для CShapes
          color: generateHistoricalColor(countryName),
          subjecto: `Данные из CShapes Dataset для ${props.GWSYEAR || 'неизв.'}-${props.GWEYEAR || 'неизв.'}`
        })
        .select('id')
        .single();
      
      if (countryError) {
        console.error(`❌ Ошибка создания ${countryName}:`, countryError.message);
        errorCount++;
        continue;
      }
      
      // Добавляем геометрию
      const { error: geoError } = await supabase
        .from('country_geometries')
        .insert({
          country_id: country.id,
          geometry_type: feature.geometry.type,
          coordinates: feature.geometry.coordinates
        });
      
      if (geoError) {
        console.error(`❌ Ошибка геометрии для ${countryName}:`, geoError.message);
        errorCount++;
      } else {
        console.log(`✅ ${countryName} успешно добавлена`);
        successCount++;
      }
      
    } catch (error) {
      console.error(`❌ Общая ошибка для ${countryName}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Результаты загрузки CShapes 1914:`);
  console.log(`   ✅ Успешно: ${successCount} стран`);
  console.log(`   ❌ Ошибки: ${errorCount} стран`);
  console.log(`   🎯 Точность границ: 5 (максимальная)`);
  console.log(`   📍 Источник: CShapes Historical Dataset`);
}

async function downloadAlternativeHistoricalData() {
  console.log('\n🔄 Загружаем альтернативные исторические данные...');
  
  // Можно добавить загрузку из других источников:
  // - GeaCron API
  // - World Historical Gazetteer
  // - Euratlas данные
  
  console.log('⚠️  Альтернативные источники пока не реализованы');
  console.log('💡 Рекомендуется вручную скачать данные из:');
  console.log('   - http://geacron.com/');
  console.log('   - https://whgazetteer.org/');
  console.log('   - https://www.euratlas.net/');
}

function generateHistoricalColor(countryName) {
  // Исторически точные цвета для основных держав 1914 года
  const historicalColors = {
    'Russia': '#4A90E2',           // Российская империя - синий
    'Germany': '#2C3E50',          // Германская империя - темно-серый
    'Austria-Hungary': '#E74C3C',  // Австро-Венгрия - красный
    'France': '#3498DB',           // Франция - голубой
    'United Kingdom': '#E67E22',   // Великобритания - оранжевый
    'Ottoman Empire': '#9B59B6',   // Османская империя - фиолетовый
    'Italy': '#27AE60',            // Италия - зеленый
    'Spain': '#F39C12',            // Испания - желтый
  };
  
  // Ищем по ключевым словам
  for (const [key, color] of Object.entries(historicalColors)) {
    if (countryName.toLowerCase().includes(key.toLowerCase()) ||
        countryName.toLowerCase().includes(key.split('-')[0].toLowerCase())) {
      return color;
    }
  }
  
  // Случайный цвет для остальных
  const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Запускаем загрузку
downloadCShapes1914().catch(console.error);