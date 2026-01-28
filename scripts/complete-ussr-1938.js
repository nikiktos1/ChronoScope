const fs = require('fs');

console.log('🔧 Завершение СССР 1938 - добавление всех частей...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  // Находим все части СССР в мировых данных
  const ussrParts = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    return subjecto.includes('ussr');
  });
  
  console.log(`Найдено ${ussrParts.length} частей СССР в мировых данных:`);
  ussrParts.forEach((part, i) => {
    const coords = part.geometry.coordinates.flat(2);
    console.log(`  Часть ${i+1}: ${part.properties.PARTOF} (${coords.length} координат)`);
  });
  
  if (ussrParts.length > 0) {
    // Объединяем все части СССР
    const allCoordinates = [];
    ussrParts.forEach(part => {
      if (part.geometry.type === 'MultiPolygon') {
        allCoordinates.push(...part.geometry.coordinates);
      } else if (part.geometry.type === 'Polygon') {
        allCoordinates.push(part.geometry.coordinates);
      }
    });
    
    console.log(`Объединено в ${allCoordinates.length} полигонов`);
    
    // Находим СССР в европейской карте
    const ussrIndex = europeData.features.findIndex(f => 
      f.properties.name.toLowerCase().includes('ссср') ||
      f.properties.name.toLowerCase().includes('ussr')
    );
    
    if (ussrIndex !== -1) {
      // Обновляем геометрию СССР
      europeData.features[ussrIndex].geometry = {
        type: 'MultiPolygon',
        coordinates: allCoordinates
      };
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
      
      console.log('✅ СССР обновлен со всеми частями');
      
      // Проверяем результат
      const totalCoords = allCoordinates.flat(2);
      console.log(`📊 Всего координат: ${totalCoords.length}`);
      
      const minLat = Math.min(...totalCoords.map(c => c[1]));
      const maxLat = Math.max(...totalCoords.map(c => c[1]));
      const minLon = Math.min(...totalCoords.map(c => c[0]));
      const maxLon = Math.max(...totalCoords.map(c => c[0]));
      
      console.log(`📏 Охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}° долготы`);
      console.log(`📏 Охват: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}° широты`);
      
    } else {
      console.log('❌ СССР не найден в европейской карте');
    }
  } else {
    console.log('❌ Части СССР не найдены в мировых данных');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Завершение СССР завершено!');