const axios = require('axios');
const fs = require('fs');

async function downloadCShapesZip() {
  try {
    console.log('📦 Скачиваем официальный CShapes ZIP файл...');
    
    const response = await axios.get('http://nils.weidmann.ws/projects/cshapes/cshapes.zip', {
      timeout: 60000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ CShapes ZIP успешно загружен!');
      console.log(`📊 Размер: ${response.data.byteLength} байт`);
      
      // Сохраняем ZIP файл
      fs.writeFileSync('data/cshapes-official.zip', response.data);
      console.log('💾 Сохранено как: data/cshapes-official.zip');
      
      console.log('\n🎯 Следующие шаги:');
      console.log('1. Распакуйте ZIP файл вручную');
      console.log('2. Найдите GeoJSON или Shapefile с данными 1914 года');
      console.log('3. Конвертируйте в GeoJSON если нужно');
      console.log('4. Загрузите в Supabase');
      
    } else {
      console.log(`❌ Ошибка загрузки: статус ${response.status}`);
    }
    
  } catch (error) {
    console.error('💥 Ошибка:', error.message);
  }
}

// Также попробуем найти правильные пути в historical-basemaps
async function exploreHistoricalBasemaps() {
  console.log('\n🔍 Исследуем репозиторий historical-basemaps...');
  
  // Попробуем разные возможные пути к файлам
  const possiblePaths = [
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/README.md',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/main/README.md',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/data/1914.geojson',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/main/data/1914.geojson',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/1914.geojson',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/main/geojson/1914.geojson',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/GeoJSON/1914.geojson',
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/main/GeoJSON/1914.geojson'
  ];
  
  for (const path of possiblePaths) {
    try {
      console.log(`📡 Проверяем: ${path}`);
      
      const response = await axios.get(path, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ НАЙДЕН! Размер: ${response.data.length} символов`);
        
        if (path.includes('README')) {
          console.log('📄 README содержимое (первые 500 символов):');
          console.log(response.data.substring(0, 500) + '...');
        } else if (path.includes('.geojson')) {
          try {
            const geoData = JSON.parse(response.data);
            if (geoData.type === 'FeatureCollection') {
              console.log(`🗺️  GeoJSON с ${geoData.features.length} объектами!`);
              
              // Сохраняем найденный файл
              const filename = `data/historical-basemaps-1914.json`;
              fs.writeFileSync(filename, JSON.stringify(geoData, null, 2));
              console.log(`💾 Сохранено: ${filename}`);
              
              // Показываем примеры стран
              console.log('📍 Примеры стран:');
              geoData.features.slice(0, 5).forEach(feature => {
                const props = feature.properties;
                const name = props.NAME || props.name || props.ADMIN || 'Неизвестно';
                console.log(`   • ${name}`);
              });
              
              return geoData; // Возвращаем найденные данные
            }
          } catch (parseError) {
            console.log('⚠️  Не удалось распарсить как JSON');
          }
        }
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ 404');
      } else {
        console.log(`❌ ${error.message}`);
      }
    }
  }
  
  return null;
}

async function main() {
  // Сначала пробуем найти готовые GeoJSON файлы
  const historicalData = await exploreHistoricalBasemaps();
  
  if (historicalData) {
    console.log('\n🎉 НАЙДЕНЫ ИСТОРИЧЕСКИЕ ДАННЫЕ!');
    return historicalData;
  }
  
  // Если не нашли, скачиваем CShapes ZIP
  await downloadCShapesZip();
}

main().catch(console.error);