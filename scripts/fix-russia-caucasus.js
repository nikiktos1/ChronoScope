const fs = require('fs');

console.log('🏔️ Исправление Кавказа в составе России...\n');

// Функция для извлечения всех частей России из мировых данных
function extractAllRussianTerritories(year) {
  try {
    const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
    
    // Ищем все части России
    const russianFeatures = worldData.features.filter(f => {
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      const name = (f.properties.NAME || '').toLowerCase();
      return subjecto.includes('russia') || name.includes('russia') ||
             subjecto.includes('russian') || name.includes('russian');
    });
    
    if (russianFeatures.length > 0) {
      console.log(`📍 Найдено ${russianFeatures.length} частей России в мировых данных ${year}`);
      
      // Показываем каждую часть
      russianFeatures.forEach((feature, i) => {
        const coords = feature.geometry.coordinates;
        let coordCount = 0;
        if (feature.geometry.type === 'MultiPolygon') {
          coordCount = coords.flat(2).length;
        } else if (feature.geometry.type === 'Polygon') {
          coordCount = coords.flat(1).length;
        }
        console.log(`   Часть ${i+1}: ${feature.properties.SUBJECTO || feature.properties.NAME} (${coordCount} точек)`);
      });
      
      // Объединяем все части в одну геометрию
      const allCoordinates = [];
      russianFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          allCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          allCoordinates.push(feature.geometry.coordinates);
        }
      });
      
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

// Исправляем карту 1914 года
console.log('🔧 Обновление карты 1914 года...');

try {
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
  
  // Ищем Россию
  const russiaFeature = europeData.features.find(f => {
    const name = f.properties.name.toLowerCase();
    return name.includes('росс') || name.includes('russian');
  });
  
  if (russiaFeature) {
    console.log(`Найдена Россия: "${russiaFeature.properties.name}"`);
    
    // Извлекаем полную геометрию из мировых данных
    const fullGeometry = extractAllRussianTerritories(1914);
    
    if (fullGeometry) {
      // Обновляем геометрию
      russiaFeature.geometry = fullGeometry;
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1914.json', JSON.stringify(europeData, null, 2));
      
      console.log('✅ Геометрия России обновлена с включением всех частей');
      
      // Проверяем охват
      const allCoords = fullGeometry.coordinates.flat(2);
      const minLon = Math.min(...allCoords.map(c => c[0]));
      const maxLon = Math.max(...allCoords.map(c => c[0]));
      const minLat = Math.min(...allCoords.map(c => c[1]));
      const maxLat = Math.max(...allCoords.map(c => c[1]));
      
      console.log(`📏 Охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}° долготы, ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}° широты`);
      
      // Проверяем Кавказ (примерно 40-45° с.ш., 40-50° в.д.)
      const caucasusCoords = allCoords.filter(c => 
        c[0] >= 40 && c[0] <= 50 && c[1] >= 40 && c[1] <= 45
      );
      
      if (caucasusCoords.length > 0) {
        console.log('🏔️ Кавказ включен в состав России ✅');
      } else {
        console.log('⚠️ Кавказ может отсутствовать');
      }
      
      // Проверяем Дальний Восток
      if (maxLon > 170) {
        console.log('🌊 Дальний Восток включен ✅');
      } else {
        console.log('⚠️ Дальний Восток может отсутствовать');
      }
      
    } else {
      console.log('❌ Не удалось извлечь геометрию из мировых данных');
    }
  } else {
    console.log('❌ Россия не найдена в карте 1914');
  }
} catch (error) {
  console.log('❌ Ошибка обработки карты 1914:', error.message);
}

console.log('\n🎯 Исправление завершено!');