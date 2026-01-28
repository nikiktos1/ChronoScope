const fs = require('fs');

console.log('🌍 Извлечение правильной геометрии России из мировых данных...\n');

// Функция для извлечения России из мировых данных
function extractRussiaFromWorldData(year) {
  try {
    const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
    
    // Ищем Российскую империю
    const russianFeatures = worldData.features.filter(f => {
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      const name = (f.properties.NAME || '').toLowerCase();
      return subjecto.includes('russian empire') || 
             name.includes('russian empire') ||
             subjecto.includes('russia') ||
             name.includes('russia');
    });
    
    if (russianFeatures.length > 0) {
      console.log(`📍 Найдено ${russianFeatures.length} частей России в мировых данных ${year}`);
      
      // Объединяем все части России в одну геометрию
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

// Карты для обновления
const mapsToUpdate = [
  { file: 'europe_1815.json', worldYear: 1815 },
  { file: 'europe_1880.json', worldYear: 1880 },
  { file: 'europe_1900.json', worldYear: 1900 },
  { file: 'europe_1914.json', worldYear: 1914 },
  { file: 'europe_1920.json', worldYear: 1920 },
  { file: 'europe_1938.json', worldYear: 1938 }
];

// Обновляем каждую карту
mapsToUpdate.forEach(({ file, worldYear }) => {
  console.log(`\n🔧 Обновление ${file}...`);
  
  try {
    // Загружаем европейскую карту
    const europeData = JSON.parse(fs.readFileSync(`public/data/maps/${file}`, 'utf8'));
    
    // Ищем Россию в европейской карте
    const russiaFeature = europeData.features.find(f => {
      const name = f.properties.name.toLowerCase();
      return name.includes('росс') || name.includes('russian') || 
             name.includes('soviet') || name.includes('ссср') ||
             name.includes('московск');
    });
    
    if (russiaFeature) {
      console.log(`   Найдена Россия: "${russiaFeature.properties.name}"`);
      
      // Извлекаем правильную геометрию из мировых данных
      const correctGeometry = extractRussiaFromWorldData(worldYear);
      
      if (correctGeometry) {
        // Обновляем геометрию
        russiaFeature.geometry = correctGeometry;
        
        // Сохраняем обновленную карту
        fs.writeFileSync(`public/data/maps/${file}`, JSON.stringify(europeData, null, 2));
        console.log(`   ✅ Геометрия России обновлена из мировых данных ${worldYear}`);
        
        // Проверяем охват координат
        const allCoords = correctGeometry.coordinates.flat(2);
        const minLon = Math.min(...allCoords.map(c => c[0]));
        const maxLon = Math.max(...allCoords.map(c => c[0]));
        const minLat = Math.min(...allCoords.map(c => c[1]));
        const maxLat = Math.max(...allCoords.map(c => c[1]));
        
        console.log(`   📏 Охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}° долготы, ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}° широты`);
        
        if (maxLon > 170) {
          console.log(`   🌊 Дальний Восток включен! (до ${maxLon.toFixed(1)}°)`);
        } else {
          console.log(`   ⚠️  Дальний Восток может отсутствовать (только до ${maxLon.toFixed(1)}°)`);
        }
      } else {
        console.log(`   ❌ Не удалось извлечь геометрию из мировых данных ${worldYear}`);
      }
    } else {
      console.log(`   ⚠️  Россия не найдена в ${file}`);
    }
  } catch (error) {
    console.log(`   ❌ Ошибка обработки ${file}:`, error.message);
  }
});

console.log('\n🎯 Обновление завершено!');
console.log('📍 Россия теперь должна включать все территории из исходных мировых данных');