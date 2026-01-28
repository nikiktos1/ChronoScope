const axios = require('axios');

// Проверяем реальные источники исторических данных
const potentialSources = [
  // Проверяем разные варианты historical-basemaps
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/GeoJSON/World_1914.geojson',
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/main/GeoJSON/World_1914.geojson',
  'https://github.com/aourednik/historical-basemaps', // проверим сам репозиторий
  
  // CShapes варианты
  'https://raw.githubusercontent.com/nils-weidmann/cshapes/master/data/cshapes.geojson',
  'https://raw.githubusercontent.com/nils-weidmann/cshapes/main/data/cshapes.geojson',
  'https://github.com/nils-weidmann/cshapes', // проверим репозиторий
  
  // Другие исторические источники
  'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson',
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
  
  // Специализированные исторические проекты
  'https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/ALL/geoBoundariesCGAZ_ADM0.geojson',
  'https://raw.githubusercontent.com/eurostat/Nuts2json/master/pub/v2/2021/4326/20M/nuts0.json',
  
  // Альтернативные исторические источники
  'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json',
  'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson'
];

async function checkSources() {
  console.log('🔍 Проверяем реальные источники исторических данных...\n');
  
  for (const url of potentialSources) {
    try {
      console.log(`📡 Проверяем: ${url}`);
      
      const response = await axios.head(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ ДОСТУПЕН! Статус: ${response.status}`);
        console.log(`   Размер: ${response.headers['content-length'] || 'неизвестно'} байт`);
        console.log(`   Тип: ${response.headers['content-type'] || 'неизвестно'}\n`);
        
        // Если это JSON/GeoJSON файл, попробуем загрузить небольшую часть
        if (url.includes('.geojson') || url.includes('.json')) {
          try {
            const dataResponse = await axios.get(url, { 
              timeout: 15000,
              maxContentLength: 1024 * 1024 * 10, // 10MB лимит
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            if (dataResponse.data && dataResponse.data.features) {
              console.log(`   📊 Содержит ${dataResponse.data.features.length} географических объектов`);
              
              // Показываем первые несколько стран
              const firstFeatures = dataResponse.data.features.slice(0, 5);
              console.log(`   🗺️  Примеры стран:`);
              firstFeatures.forEach(feature => {
                const name = feature.properties?.NAME || 
                           feature.properties?.name || 
                           feature.properties?.ADMIN || 
                           'Неизвестно';
                console.log(`      • ${name}`);
              });
            }
            
          } catch (dataError) {
            console.log(`   ⚠️  Файл доступен, но ошибка загрузки данных: ${dataError.message}`);
          }
        }
        
      } else {
        console.log(`⚠️  Неожиданный статус: ${response.status}\n`);
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ НЕ НАЙДЕН (404)\n`);
      } else {
        console.log(`❌ ОШИБКА: ${error.message}\n`);
      }
    }
  }
  
  console.log('🎯 Рекомендации:');
  console.log('1. Используйте доступные источники выше');
  console.log('2. Проверьте актуальные ссылки на GitHub репозиториях');
  console.log('3. Рассмотрите альтернативные исторические проекты');
  console.log('4. Возможно, нужно искать данные в других форматах (Shapefile, KML)');
}

checkSources().catch(console.error);