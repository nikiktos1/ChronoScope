const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Различные варианты CShapes и других исторических источников
const historicalSources = [
  // CShapes - разные варианты репозитория и веток
  {
    name: 'CShapes Main Repository',
    url: 'https://raw.githubusercontent.com/nils-weidmann/cshapes/master/cshapes.geojson',
    description: 'Основной CShapes репозиторий'
  },
  {
    name: 'CShapes Data Folder',
    url: 'https://raw.githubusercontent.com/nils-weidmann/cshapes/master/data/cshapes.geojson',
    description: 'CShapes в папке data'
  },
  {
    name: 'CShapes Alternative',
    url: 'https://github.com/nils-weidmann/cshapes/raw/master/cshapes-0.6.geojson',
    description: 'CShapes версия 0.6'
  },
  
  // Альтернативные исторические проекты
  {
    name: 'Historical Basemaps - Aourednik',
    url: 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/GeoJSON/World_1914.geojson',
    description: 'Исторические карты мира 1914'
  },
  {
    name: 'Historical Basemaps - Europe 1914',
    url: 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/GeoJSON/Europe_1914.geojson',
    description: 'Европа 1914 года'
  },
  
  // Другие исторические ГИС проекты
  {
    name: 'World Historical Gazetteer',
    url: 'https://raw.githubusercontent.com/WorldHistoricalGazetteer/whg3/main/datasets/sample_data.geojson',
    description: 'Мировой исторический справочник'
  },
  {
    name: 'GeaCron Data',
    url: 'https://raw.githubusercontent.com/GeaCron/GeaCron-data/master/1914.geojson',
    description: 'GeaCron исторические данные'
  },
  
  // Университетские проекты
  {
    name: 'Harvard WorldMap Historical',
    url: 'https://raw.githubusercontent.com/harvard-library/geodata/master/historical/world_1914.geojson',
    description: 'Гарвардские исторические данные'
  },
  {
    name: 'Stanford Historical GIS',
    url: 'https://raw.githubusercontent.com/stanford-history/shgis/master/data/world_1914.geojson',
    description: 'Стэнфордский исторический ГИС'
  },
  
  // Специализированные исторические проекты
  {
    name: 'Historical Boundaries Project',
    url: 'https://raw.githubusercontent.com/historical-boundaries/data/master/1914/world.geojson',
    description: 'Проект исторических границ'
  },
  {
    name: 'Euratlas Historical Data',
    url: 'https://raw.githubusercontent.com/euratlas/historical-data/master/1914/europe.geojson',
    description: 'Euratlas исторические данные'
  }
];

async function downloadRealCShapes() {
  try {
    console.log('🌐 Пробуем загрузить НАСТОЯЩИЕ исторические данные с VPN...');
    console.log('🎯 Ищем CShapes и другие исторические источники\n');
    
    let historicalData = null;
    let successfulSource = null;
    
    for (const source of historicalSources) {
      try {
        console.log(`🔍 Проверяем: ${source.name}`);
        console.log(`   URL: ${source.url}`);
        
        const response = await axios.get(source.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          validateStatus: function (status) {
            return status < 500; // Принимаем все статусы кроме серверных ошибок
          }
        });
        
        console.log(`   Статус: ${response.status}`);
        
        if (response.status === 200 && response.data) {
          // Проверяем, что это GeoJSON
          if (response.data.type === 'FeatureCollection' && response.data.features) {
            historicalData = response.data;
            successfulSource = source;
            console.log(`✅ НАЙДЕНЫ ИСТОРИЧЕСКИЕ ДАННЫЕ!`);
            console.log(`   📊 Объектов: ${response.data.features.length}`);
            
            // Показываем примеры стран
            const samples = response.data.features.slice(0, 5);
            console.log(`   🗺️  Примеры:`);
            samples.forEach(feature => {
              const props = feature.properties;
              const name = props.CNTRY_NAME || props.NAME || props.name || props.ADMIN;
              const year = props.GWSYEAR || props.START_YEAR || props.year;
              console.log(`      • ${name} (${year || 'год неизвестен'})`);
            });
            
            break;
          } else if (typeof response.data === 'string' && response.data.includes('FeatureCollection')) {
            // Возможно, это строка JSON
            try {
              const parsed = JSON.parse(response.data);
              if (parsed.type === 'FeatureCollection') {
                historicalData = parsed;
                successfulSource = source;
                console.log(`✅ НАЙДЕНЫ ИСТОРИЧЕСКИЕ ДАННЫЕ (парсинг строки)!`);
                break;
              }
            } catch (parseError) {
              console.log(`   ⚠️  Ошибка парсинга JSON: ${parseError.message}`);
            }
          } else {
            console.log(`   ⚠️  Не GeoJSON формат`);
          }
        } else {
          console.log(`   ❌ Статус ${response.status}`);
        }
        
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ НЕ НАЙДЕН (404)`);
        } else {
          console.log(`   ❌ ОШИБКА: ${error.message}`);
        }
      }
      
      console.log(''); // Пустая строка для разделения
    }
    
    if (!historicalData) {
      console.log('💥 НЕ УДАЛОСЬ НАЙТИ НАСТОЯЩИЕ ИСТОРИЧЕСКИЕ ДАННЫЕ');
      console.log('🤔 Возможные причины:');
      console.log('   • Репозитории переехали или удалены');
      console.log('   • Данные в других форматах (Shapefile, KML)');
      console.log('   • Нужна авторизация или специальный доступ');
      console.log('   • Данные находятся в других местах');
      return;
    }
    
    console.log(`\n🎉 УСПЕХ! Найдены данные из: ${successfulSource.name}`);
    
    // Сохраняем исходные данные
    const rawPath = 'data/real-historical-1914.json';
    fs.writeFileSync(rawPath, JSON.stringify(historicalData, null, 2));
    console.log(`💾 Исходные данные сохранены: ${rawPath}`);
    
    // Фильтруем для 1914 года
    const filtered1914 = filterHistoricalData1914(historicalData.features);
    
    if (filtered1914.length > 0) {
      console.log(`\n🔄 Отфильтровано ${filtered1914.length} стран для 1914 года`);
      await uploadHistoricalToSupabase(filtered1914, successfulSource.name);
    } else {
      console.log('\n⚠️  Не найдено данных для 1914 года в загруженном файле');
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
  }
}

function filterHistoricalData1914(features) {
  const filtered = [];
  
  for (const feature of features) {
    const props = feature.properties;
    
    // Проверяем временные рамки
    const startYear = props.GWSYEAR || props.START_YEAR || props.start_year || 1800;
    const endYear = props.GWEYEAR || props.END_YEAR || props.end_year || 2000;
    
    // Страна должна существовать в 1914 году
    if (startYear <= 1914 && endYear >= 1914) {
      const countryName = props.CNTRY_NAME || props.NAME || props.name || props.ADMIN;
      
      if (countryName) {
        filtered.push({
          type: 'Feature',
          properties: {
            name: countryName,
            name_en: countryName,
            start_year: startYear,
            end_year: endYear,
            source: 'Real Historical Data'
          },
          geometry: feature.geometry
        });
        
        console.log(`📍 1914: ${countryName} (${startYear}-${endYear})`);
      }
    }
  }
  
  return filtered;
}

async function uploadHistoricalToSupabase(countries, sourceName) {
  try {
    console.log(`\n🚀 Загружаем НАСТОЯЩИЕ исторические данные в Supabase...`);
    console.log(`📍 Источник: ${sourceName}`);
    
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
    
    // Очищаем старые данные
    console.log('🧹 Очищаем современные границы...');
    
    const { data: oldCountries } = await supabase
      .from('countries')
      .select('id')
      .eq('period_id', period.id);
    
    if (oldCountries && oldCountries.length > 0) {
      await supabase
        .from('country_geometries')
        .delete()
        .in('country_id', oldCountries.map(c => c.id));
      
      await supabase
        .from('countries')
        .delete()
        .eq('period_id', period.id);
      
      console.log(`✅ Удалено ${oldCountries.length} современных границ`);
    }
    
    // Загружаем исторические данные
    let successCount = 0;
    
    for (const country of countries) {
      const props = country.properties;
      
      console.log(`📥 Загружаем: ${props.name} (${props.start_year}-${props.end_year})`);
      
      try {
        const { data: newCountry, error: countryError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: props.name,
            name_en: props.name_en,
            border_precision: 10, // МАКСИМАЛЬНАЯ точность для настоящих исторических данных
            color: generateHistoricalColor(props.name),
            subjecto: `Настоящие исторические границы ${props.start_year}-${props.end_year}. Источник: ${sourceName}`
          })
          .select('id')
          .single();
        
        if (countryError) {
          console.error(`❌ ${props.name}: ${countryError.message}`);
          continue;
        }
        
        const { error: geoError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: newCountry.id,
            geometry_type: country.geometry.type,
            coordinates: country.geometry.coordinates
          });
        
        if (geoError) {
          console.error(`❌ Геометрия ${props.name}: ${geoError.message}`);
        } else {
          console.log(`✅ ${props.name} - ИСТОРИЧЕСКИЕ границы загружены`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ ${props.name}: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 НАСТОЯЩИЕ ИСТОРИЧЕСКИЕ ДАННЫЕ ЗАГРУЖЕНЫ!`);
    console.log(`✅ Успешно: ${successCount} стран`);
    console.log(`🎯 Точность: 10 (максимальная для исторических данных)`);
    console.log(`📍 Источник: ${sourceName}`);
    console.log(`📅 Период: 1914 год`);
    
  } catch (error) {
    console.error('💥 Ошибка загрузки:', error);
  }
}

function generateHistoricalColor(countryName) {
  // Исторические цвета основных держав 1914 года
  const colors = {
    'Russia': '#4A90E2',
    'Germany': '#2C3E50', 
    'Austria-Hungary': '#DC143C',
    'France': '#0055A4',
    'United Kingdom': '#C8102E',
    'Ottoman Empire': '#E30A17',
    'Italy': '#009246'
  };
  
  for (const [key, color] of Object.entries(colors)) {
    if (countryName.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  
  return '#95A5A6';
}

// Запускаем с VPN
downloadRealCShapes();