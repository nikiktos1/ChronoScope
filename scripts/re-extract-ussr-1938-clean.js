const fs = require('fs');

console.log('🔄 Переизвлечение СССР 1938 из оригинальных данных...\n');

// Функция для извлечения всех частей СССР из мировых данных
function extractAllUSSRParts(year) {
  try {
    const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
    
    console.log(`📊 Анализ мировых данных ${year}:`);
    console.log(`   Всего объектов: ${worldData.features.length}`);
    
    // Ищем все части СССР с детальным анализом
    const ussrFeatures = [];
    
    worldData.features.forEach((feature, i) => {
      const subjecto = (feature.properties.SUBJECTO || '').toLowerCase();
      const name = (feature.properties.NAME || '').toLowerCase();
      const partof = (feature.properties.PARTOF || '').toLowerCase();
      
      if (subjecto.includes('ussr') || name.includes('ussr') ||
          subjecto.includes('soviet') || name.includes('soviet')) {
        
        ussrFeatures.push(feature);
        
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
        if (bounds.maxLon > 170 || bounds.minLon < -170) {
          region = '🌊 ЧУКОТКА/ДАЛЬНИЙ ВОСТОК';
        } else if (bounds.minLon >= 40 && bounds.maxLon <= 50 && bounds.minLat >= 37 && bounds.maxLat <= 45) {
          region = '🏔️ КАВКАЗ';
        } else if (bounds.minLon > 60) {
          region = '❄️ СИБИРЬ';
        } else if (bounds.maxLon < 60) {
          region = '🏛️ ЕВРОПЕЙСКАЯ РОССИЯ';
        } else {
          region = '🗺️ СМЕШАННЫЙ РЕГИОН';
        }
        
        console.log(`   Часть ${ussrFeatures.length}: ${feature.properties.SUBJECTO || feature.properties.NAME}`);
        console.log(`      PARTOF: ${feature.properties.PARTOF || 'не указано'}`);
        console.log(`      Регион: ${region}`);
        console.log(`      Координаты: ${bounds.minLon.toFixed(1)}°-${bounds.maxLon.toFixed(1)}°E, ${bounds.minLat.toFixed(1)}°-${bounds.maxLat.toFixed(1)}°N`);
        console.log(`      Точек: ${coordCount}`);
        
        if (bounds.minLat < 36) {
          console.log(`      ⚠️ ЗАХОДИТ В ТУРЦИЮ (${bounds.minLat.toFixed(1)}°)`);
        }
      }
    });
    
    if (ussrFeatures.length > 0) {
      console.log(`\n✅ Найдено ${ussrFeatures.length} частей СССР`);
      
      // Объединяем все части
      const allCoordinates = [];
      ussrFeatures.forEach(feature => {
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

// Переизвлекаем СССР для 1938 года
console.log('🔧 Обновление карты 1938 года...\n');

try {
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  // Ищем СССР
  const ussrIndex = europeData.features.findIndex(f => {
    const name = f.properties.name.toLowerCase();
    return name.includes('ссср') || name.includes('ussr');
  });
  
  if (ussrIndex !== -1) {
    const ussrFeature = europeData.features[ussrIndex];
    console.log(`📍 Найден СССР: "${ussrFeature.properties.name}"`);
    
    // Извлекаем полную геометрию
    const completeGeometry = extractAllUSSRParts(1938);
    
    if (completeGeometry) {
      // Создаем новый СССР с полной геометрией
      const newUSSRFeature = {
        ...ussrFeature,
        geometry: completeGeometry
      };
      
      // Заменяем старый СССР на новый
      europeData.features[ussrIndex] = newUSSRFeature;
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
      
      console.log('\n✅ СССР полностью переизвлечен из оригинальных данных 1938');
      
      // Финальная проверка
      const allCoords = completeGeometry.coordinates.flat(2);
      const minLon = Math.min(...allCoords.map(c => c[0]));
      const maxLon = Math.max(...allCoords.map(c => c[0]));
      const minLat = Math.min(...allCoords.map(c => c[1]));
      const maxLat = Math.max(...allCoords.map(c => c[1]));
      
      console.log(`\n📏 Итоговый охват СССР:`);
      console.log(`   Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
      console.log(`   Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
      console.log(`   Всего точек: ${allCoords.length}`);
      
      // Проверяем регионы
      const regions = {
        chukotka: allCoords.filter(c => (c[0] > 170 || c[0] < -170) && c[1] > 60).length,
        caucasus: allCoords.filter(c => c[0] >= 40 && c[0] <= 50 && c[1] >= 37 && c[1] <= 45).length,
        europe: allCoords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50 && c[1] <= 70).length,
        siberia: allCoords.filter(c => c[0] >= 60 && c[0] <= 120).length,
        turkey: allCoords.filter(c => c[1] < 36).length
      };
      
      console.log(`\n🗺️ Проверка регионов:`);
      console.log(`   🌊 Чукотка/Дальний Восток: ${regions.chukotka} точек ${regions.chukotka > 0 ? '✅' : '❌'}`);
      console.log(`   🏔️ Кавказ: ${regions.caucasus} точек ${regions.caucasus > 0 ? '✅' : '❌'}`);
      console.log(`   🏛️ Европейская Россия: ${regions.europe} точек ${regions.europe > 0 ? '✅' : '❌'}`);
      console.log(`   ❄️ Сибирь: ${regions.siberia} точек ${regions.siberia > 0 ? '✅' : '❌'}`);
      console.log(`   🇹🇷 Заход в Турцию: ${regions.turkey} точек ${regions.turkey > 0 ? '⚠️' : '✅'}`);
      
    } else {
      console.log('❌ Не удалось извлечь геометрию из оригинальных данных');
    }
  } else {
    console.log('❌ СССР не найден в карте 1938');
  }
} catch (error) {
  console.log('❌ Ошибка обработки карты 1938:', error.message);
}

console.log('\n🎯 Полное переизвлечение завершено!');