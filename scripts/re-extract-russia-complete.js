const fs = require('fs');

console.log('🔄 Полное перевытаскивание России из мировых данных...\n');

// Функция для детального анализа и извлечения России
function extractCompleteRussia(year) {
  try {
    const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
    
    console.log(`📊 Анализ мировых данных ${year}:`);
    console.log(`   Всего объектов: ${worldData.features.length}`);
    
    // Ищем все части России с детальным анализом
    const russianFeatures = [];
    
    worldData.features.forEach((feature, i) => {
      const subjecto = (feature.properties.SUBJECTO || '').toLowerCase();
      const name = (feature.properties.NAME || '').toLowerCase();
      const partof = (feature.properties.PARTOF || '').toLowerCase();
      
      if (subjecto.includes('russia') || name.includes('russia') ||
          subjecto.includes('russian') || name.includes('russian') ||
          partof.includes('russia') || partof.includes('russian')) {
        
        russianFeatures.push(feature);
        
        // Анализируем каждую часть
        const coords = feature.geometry.coordinates;
        let coordCount = 0;
        let bounds = { minLon: 180, maxLon: -180, minLat: 90, maxLat: -90 };
        
        if (feature.geometry.type === 'MultiPolygon') {
          const flatCoords = coords.flat(2);
          coordCount = flatCoords.length;
          flatCoords.forEach(c => {
            bounds.minLon = Math.min(bounds.minLon, c[0]);
            bounds.maxLon = Math.max(bounds.maxLon, c[0]);
            bounds.minLat = Math.min(bounds.minLat, c[1]);
            bounds.maxLat = Math.max(bounds.maxLat, c[1]);
          });
        } else if (feature.geometry.type === 'Polygon') {
          const flatCoords = coords.flat(1);
          coordCount = flatCoords.length;
          flatCoords.forEach(c => {
            bounds.minLon = Math.min(bounds.minLon, c[0]);
            bounds.maxLon = Math.max(bounds.maxLon, c[0]);
            bounds.minLat = Math.min(bounds.minLat, c[1]);
            bounds.maxLat = Math.max(bounds.maxLat, c[1]);
          });
        }
        
        // Определяем регион по координатам
        let region = 'Неизвестно';
        if (bounds.minLon >= 40 && bounds.maxLon <= 50 && bounds.minLat >= 40 && bounds.maxLat <= 45) {
          region = '🏔️ КАВКАЗ';
        } else if (bounds.maxLon > 150) {
          region = '🌊 ДАЛЬНИЙ ВОСТОК';
        } else if (bounds.minLon > 60) {
          region = '❄️ СИБИРЬ';
        } else if (bounds.maxLon < 60) {
          region = '🏛️ ЕВРОПЕЙСКАЯ РОССИЯ';
        } else {
          region = '🗺️ СМЕШАННЫЙ РЕГИОН';
        }
        
        console.log(`   Часть ${russianFeatures.length}: ${feature.properties.SUBJECTO || feature.properties.NAME}`);
        console.log(`      Регион: ${region}`);
        console.log(`      Координаты: ${bounds.minLon.toFixed(1)}°-${bounds.maxLon.toFixed(1)}°E, ${bounds.minLat.toFixed(1)}°-${bounds.maxLat.toFixed(1)}°N`);
        console.log(`      Точек: ${coordCount}`);
      }
    });
    
    if (russianFeatures.length > 0) {
      console.log(`\n✅ Найдено ${russianFeatures.length} частей России`);
      
      // Объединяем все части
      const allCoordinates = [];
      russianFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          allCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          allCoordinates.push(feature.geometry.coordinates);
        }
      });
      
      console.log(`📦 Объединено в ${allCoordinates.length} полигонов`);
      
      return {
        type: 'MultiPolygon',
        coordinates: allCoordinates
      };
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Ошибка чтения мировых данных ${year}:`, error.message);
    return null;
  }
}

// Перевытаскиваем Россию для 1914 года
console.log('🔧 Обновление карты 1914 года...\n');

try {
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
  
  // Ищем Россию
  const russiaIndex = europeData.features.findIndex(f => {
    const name = f.properties.name.toLowerCase();
    return name.includes('росс') || name.includes('russian');
  });
  
  if (russiaIndex !== -1) {
    const russiaFeature = europeData.features[russiaIndex];
    console.log(`📍 Найдена Россия: "${russiaFeature.properties.name}"`);
    
    // Извлекаем полную геометрию
    const completeGeometry = extractCompleteRussia(1914);
    
    if (completeGeometry) {
      // Создаем новую Россию с полной геометрией
      const newRussiaFeature = {
        ...russiaFeature,
        geometry: completeGeometry
      };
      
      // Заменяем старую Россию на новую
      europeData.features[russiaIndex] = newRussiaFeature;
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1914.json', JSON.stringify(europeData, null, 2));
      
      console.log('\n✅ Россия полностью перевытащена из мировых данных');
      
      // Финальная проверка
      const allCoords = completeGeometry.coordinates.flat(2);
      const minLon = Math.min(...allCoords.map(c => c[0]));
      const maxLon = Math.max(...allCoords.map(c => c[0]));
      const minLat = Math.min(...allCoords.map(c => c[1]));
      const maxLat = Math.max(...allCoords.map(c => c[1]));
      
      console.log(`\n📏 Итоговый охват Российской империи:`);
      console.log(`   Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
      console.log(`   Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
      console.log(`   Всего точек: ${allCoords.length}`);
      
      // Проверяем регионы
      const regions = {
        caucasus: allCoords.filter(c => c[0] >= 40 && c[0] <= 50 && c[1] >= 40 && c[1] <= 45).length,
        europe: allCoords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50 && c[1] <= 70).length,
        siberia: allCoords.filter(c => c[0] >= 60 && c[0] <= 120).length,
        farEast: allCoords.filter(c => c[0] >= 120).length
      };
      
      console.log(`\n🗺️ Проверка регионов:`);
      console.log(`   🏔️ Кавказ: ${regions.caucasus} точек ${regions.caucasus > 0 ? '✅' : '❌'}`);
      console.log(`   🏛️ Европейская Россия: ${regions.europe} точек ${regions.europe > 0 ? '✅' : '❌'}`);
      console.log(`   ❄️ Сибирь: ${regions.siberia} точек ${regions.siberia > 0 ? '✅' : '❌'}`);
      console.log(`   🌊 Дальний Восток: ${regions.farEast} точек ${regions.farEast > 0 ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ Не удалось извлечь геометрию из мировых данных');
    }
  } else {
    console.log('❌ Россия не найдена в карте 1914');
  }
} catch (error) {
  console.log('❌ Ошибка обработки карты 1914:', error.message);
}

console.log('\n🎯 Полное перевытаскивание завершено!');