const fs = require('fs');

console.log('🔧 Исправление границ СССР 1938 - убираем вторжение в Турцию...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Анализ мировых данных 1938...');
  
  // Ищем СССР в мировых данных
  const ussrFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('ussr') || subjecto.includes('soviet') ||
           name.includes('ussr') || name.includes('soviet');
  });
  
  console.log(`Найдено ${ussrFeatures.length} частей СССР в мировых данных`);
  
  // Анализируем каждую часть
  ussrFeatures.forEach((feature, i) => {
    const coords = feature.geometry.coordinates.flat(2);
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    
    console.log(`  Часть ${i+1}: ${feature.properties.SUBJECTO || feature.properties.NAME}`);
    console.log(`    Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
    console.log(`    Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
    console.log(`    Заходит в Турцию: ${minLat < 36 ? 'ДА ❌' : 'НЕТ ✅'}`);
  });
  
  // Фильтруем части СССР, исключая те, что заходят в Турцию
  const validUSSRFeatures = ussrFeatures.filter(feature => {
    const coords = feature.geometry.coordinates.flat(2);
    const minLat = Math.min(...coords.map(c => c[1]));
    return minLat >= 36; // Исключаем части южнее 36° с.ш.
  });
  
  console.log(`\nОтфильтровано: ${validUSSRFeatures.length} корректных частей СССР`);
  
  if (validUSSRFeatures.length > 0) {
    // Объединяем корректные части
    const ussrCoordinates = [];
    validUSSRFeatures.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        ussrCoordinates.push(...feature.geometry.coordinates);
      } else if (feature.geometry.type === 'Polygon') {
        ussrCoordinates.push(feature.geometry.coordinates);
      }
    });
    
    // Обновляем СССР в европейской карте
    const ussrIndex = europeData.features.findIndex(f => 
      f.properties.name.toLowerCase().includes('ussr') ||
      f.properties.name.toLowerCase().includes('ссср')
    );
    
    if (ussrIndex !== -1) {
      europeData.features[ussrIndex].geometry = {
        type: 'MultiPolygon',
        coordinates: ussrCoordinates
      };
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
      
      console.log('✅ СССР обновлен с корректными границами');
      
      // Проверяем результат
      const newCoords = ussrCoordinates.flat(2);
      const newMinLat = Math.min(...newCoords.map(c => c[1]));
      const newMaxLat = Math.max(...newCoords.map(c => c[1]));
      
      console.log(`\n📏 Новые границы СССР:`);
      console.log(`   Широта: ${newMinLat.toFixed(1)}° - ${newMaxLat.toFixed(1)}°`);
      console.log(`   Не заходит в Турцию: ${newMinLat >= 36 ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ СССР не найден в европейской карте');
    }
  } else {
    console.log('❌ Не найдено корректных частей СССР');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Исправление границ завершено!');