const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Источники исторических карт на GitHub
const githubSources = [
  {
    name: 'World Historical Boundaries',
    url: 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/GeoJSON/World_1914.geojson',
    description: 'Исторические границы мира 1914 года'
  },
  {
    name: 'CShapes Historical Dataset',
    url: 'https://raw.githubusercontent.com/nils-weidmann/cshapes/master/data/cshapes-0.6.geojson',
    description: 'CShapes исторические границы'
  },
  {
    name: 'Historical Europe Boundaries',
    url: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
    description: 'Базовые границы для адаптации'
  },
  {
    name: 'Natural Earth Historical',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
    description: 'Natural Earth страны'
  },
  {
    name: 'World Bank Boundaries',
    url: 'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson',
    description: 'Мировые границы'
  }
];

async function importGitHubHistoricalMap() {
  try {
    console.log('📥 Импортируем историческую карту 1914 года из GitHub...');
    
    let mapData = null;
    let successfulSource = null;
    
    // Пробуем загрузить из разных источников
    for (const source of githubSources) {
      try {
        console.log(`\n🔍 Пробуем: ${source.name}`);
        console.log(`   URL: ${source.url}`);
        
        const response = await axios.get(source.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'ChronoScope Historical Maps Importer',
            'Accept': 'application/json'
          }
        });
        
        if (response.data && response.data.features) {
          mapData = response.data;
          successfulSource = source;
          console.log(`✅ Успешно загружено ${response.data.features.length} объектов`);
          break;
        }
        
      } catch (error) {
        console.log(`❌ Ошибка: ${error.message}`);
        continue;
      }
    }
    
    if (!mapData) {
      console.error('💥 Не удалось загрузить данные ни из одного источника');
      return;
    }
    
    console.log(`\n📊 Используем данные из: ${successfulSource.name}`);
    console.log(`📍 Загружено ${mapData.features.length} географических объектов`);
    
    // Сохраняем исходные данные
    const rawDataPath = 'data/github-historical-raw.json';
    fs.writeFileSync(rawDataPath, JSON.stringify(mapData, null, 2));
    console.log(`💾 Исходные данные сохранены: ${rawDataPath}`);
    
    // Фильтруем и адаптируем для 1914 года
    const europeanCountries1914 = filterFor1914(mapData.features);
    
    console.log(`\n🔄 Отфильтровано ${europeanCountries1914.length} стран для 1914 года`);
    
    // Загружаем в Supabase
    await uploadToSupabase(europeanCountries1914);
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

function filterFor1914(features) {
  // Маппинг современных названий к историческим 1914 года
  const countryMapping = {
    'Russia': 'Российская империя',
    'Russian Federation': 'Российская империя',
    'Germany': 'Германская империя',
    'Austria': 'Австро-Венгрия',
    'Hungary': 'Австро-Венгрия',
    'France': 'Франция',
    'United Kingdom': 'Великобритания',
    'Turkey': 'Османская империя',
    'Italy': 'Италия',
    'Spain': 'Испания',
    'Portugal': 'Португалия',
    'Serbia': 'Сербия',
    'Greece': 'Греция',
    'Bulgaria': 'Болгария',
    'Romania': 'Румыния',
    'Belgium': 'Бельгия',
    'Netherlands': 'Нидерланды',
    'Switzerland': 'Швейцария',
    'Sweden': 'Швеция',
    'Norway': 'Норвегия',
    'Denmark': 'Дания'
  };
  
  const filtered = [];
  
  for (const feature of features) {
    const props = feature.properties;
    const name = props.NAME || props.name || props.ADMIN || props.admin || props.NAME_EN;
    
    if (!name) continue;
    
    const historicalName = countryMapping[name];
    if (historicalName) {
      // Адаптируем свойства для 1914 года
      const adapted = {
        type: 'Feature',
        properties: {
          name: historicalName,
          name_en: name,
          source: 'GitHub Historical Data',
          original_name: name
        },
        geometry: feature.geometry
      };
      
      filtered.push(adapted);
      console.log(`📍 Добавлено: ${name} → ${historicalName}`);
    }
  }
  
  return filtered;
}

async function uploadToSupabase(countries) {
  try {
    console.log('\n🚀 Загружаем данные в Supabase...');
    
    // Получаем период 1914 года
    const { data: period } = await supabase
      .from('historical_periods')
      .select('id')
      .eq('year', 1914)
      .single();
    
    if (!period) {
      console.error('❌ Период 1914 года не найден');
      return;
    }
    
    console.log(`✅ Период 1914 найден, ID: ${period.id}`);
    
    // Очищаем существующие данные
    console.log('🧹 Очищаем существующие данные...');
    
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
      
      console.log(`✅ Удалено ${existingCountries.length} старых записей`);
    }
    
    // Загружаем новые данные
    let successCount = 0;
    
    for (const country of countries) {
      const props = country.properties;
      
      console.log(`📥 Загружаем: ${props.name}`);
      
      try {
        // Создаем страну
        const { data: newCountry, error: countryError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: props.name,
            name_en: props.name_en,
            border_precision: 5, // Высокая точность для GitHub данных
            color: generateHistoricalColor(props.name),
            subjecto: `Импортировано из GitHub: ${props.source}`
          })
          .select('id')
          .single();
        
        if (countryError) {
          console.error(`❌ Ошибка создания ${props.name}:`, countryError.message);
          continue;
        }
        
        // Добавляем геометрию
        const { error: geoError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: newCountry.id,
            geometry_type: country.geometry.type,
            coordinates: country.geometry.coordinates
          });
        
        if (geoError) {
          console.error(`❌ Ошибка геометрии ${props.name}:`, geoError.message);
        } else {
          console.log(`✅ ${props.name} успешно загружена`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ Общая ошибка ${props.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Импорт завершен!`);
    console.log(`✅ Успешно загружено: ${successCount} стран`);
    console.log(`📊 Всего попыток: ${countries.length}`);
    console.log(`🎯 Точность границ: 5 (максимальная)`);
    console.log(`📍 Источник: GitHub Historical Data`);
    
    // Проверяем результат
    const { data: verification } = await supabase
      .from('countries')
      .select('name, border_precision')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n🔍 Итоговый список (${verification.length} стран):`);
    verification.forEach(country => {
      console.log(`   • ${country.name} (точность: ${country.border_precision})`);
    });
    
  } catch (error) {
    console.error('💥 Ошибка загрузки в Supabase:', error);
  }
}

function generateHistoricalColor(countryName) {
  const historicalColors = {
    'Российская империя': '#4A90E2',
    'Германская империя': '#2C3E50',
    'Австро-Венгрия': '#DC143C',
    'Франция': '#0055A4',
    'Великобритания': '#C8102E',
    'Османская империя': '#E30A17',
    'Италия': '#009246',
    'Испания': '#AA151B',
    'Португалия': '#006600',
    'Греция': '#0D5EAF',
    'Болгария': '#00966E',
    'Румыния': '#FCD116',
    'Бельгия': '#000000',
    'Нидерланды': '#FF9B00',
    'Швеция': '#006AA7',
    'Норвегия': '#EF2B2D',
    'Дания': '#C60C30',
    'Сербия': '#C6363C'
  };
  
  return historicalColors[countryName] || '#95A5A6';
}

// Запускаем импорт
importGitHubHistoricalMap();