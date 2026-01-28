const fs = require('fs');

console.log('🗺️ Исправление разделения России на карте...\n');

// Функция для нормализации координат (убираем разрыв на 180°)
function normalizeCoordinates(coordinates) {
  return coordinates.map(coord => {
    if (Array.isArray(coord[0])) {
      // Это массив координат
      return normalizeCoordinates(coord);
    } else {
      // Это отдельная координата [lon, lat]
      let [lon, lat] = coord;
      
      // Если долгота отрицательная (западная часть от 180°), 
      // сдвигаем её в положительную сторону
      if (lon < 0) {
        lon = lon + 360;
      }
      
      return [lon, lat];
    }
  });
}

// Функция для обработки геометрии России
function fixRussiaGeometry(geometry) {
  if (geometry.type === 'MultiPolygon') {
    // Нормализуем все координаты
    const normalizedCoordinates = normalizeCoordinates(geometry.coordinates);
    
    // Проверяем, есть ли части с долготой > 180
    const hasEasternParts = normalizedCoordinates.some(polygon => 
      polygon.some(ring => 
        ring.some(coord => coord[0] > 180)
      )
    );
    
    if (hasEasternParts) {
      console.log('   🔧 Найдены восточные части, нормализуем координаты...');
      
      // Объединяем все полигоны в один MultiPolygon с нормализованными координатами
      return {
        type: 'MultiPolygon',
        coordinates: normalizedCoordinates
      };
    }
  }
  
  return geometry;
}

// Карты для исправления
const mapsToFix = [
  'europe_1815.json',
  'europe_1880.json', 
  'europe_1900.json',
  'europe_1914.json'
];

mapsToFix.forEach(mapFile => {
  console.log(`\n🔧 Исправление ${mapFile}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(`public/data/maps/${mapFile}`, 'utf8'));
    
    // Ищем Россию
    const russiaFeature = data.features.find(f => {
      const name = f.properties.name.toLowerCase();
      return name.includes('росс') || name.includes('russian') || 
             name.includes('soviet') || name.includes('ссср');
    });
    
    if (russiaFeature) {
      console.log(`   Найдена Россия: "${russiaFeature.properties.name}"`);
      
      // Проверяем текущий охват
      const coords = russiaFeature.geometry.coordinates.flat(2);
      const minLon = Math.min(...coords.map(c => c[0]));
      const maxLon = Math.max(...coords.map(c => c[0]));
      
      console.log(`   Текущий охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
      
      if (minLon < -170 && maxLon > 170) {
        console.log('   ⚠️  Россия разделена на две части карты');
        
        // Исправляем геометрию
        const fixedGeometry = fixRussiaGeometry(russiaFeature.geometry);
        russiaFeature.geometry = fixedGeometry;
        
        // Проверяем новый охват
        const newCoords = fixedGeometry.coordinates.flat(2);
        const newMinLon = Math.min(...newCoords.map(c => c[0]));
        const newMaxLon = Math.max(...newCoords.map(c => c[0]));
        
        console.log(`   Новый охват: ${newMinLon.toFixed(1)}° - ${newMaxLon.toFixed(1)}°`);
        
        // Сохраняем
        fs.writeFileSync(`public/data/maps/${mapFile}`, JSON.stringify(data, null, 2));
        console.log('   ✅ Россия объединена на одной карте');
      } else {
        console.log('   ℹ️  Россия уже на одной карте');
      }
    } else {
      console.log('   ⚠️  Россия не найдена');
    }
  } catch (error) {
    console.log(`   ❌ Ошибка: ${error.message}`);
  }
});

console.log('\n🎯 Исправление завершено!');
console.log('🗺️ Россия теперь отображается как единая территория на каждой карте');