const fs = require('fs');

console.log('🔧 Добавление второй части СССР (Чукотка) из данных 1938...\n');

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
  
  console.log(`Найдено ${ussrParts.length} частей СССР в мировых данных 1938:`);
  
  ussrParts.forEach((part, i) => {
    const coords = part.geometry.coordinates.flat(2);
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    
    console.log(`  Часть ${i+1}: ${part.properties.PARTOF}`);
    console.log(`    Координат: ${coords.length}`);
    console.log(`    Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
    console.log(`    Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
    
    // Проверяем, это ли Чукотка
    if (minLat >= 36 && (maxLon > 170 || minLon < -170)) {
      console.log(`    🎯 Это может быть Чукотка!`);
    }
  });
  
  // Объединяем ВСЕ части СССР из 1938 года
  const allCoordinates = [];
  ussrParts.forEach(part => {
    if (part.geometry.type === 'MultiPolygon') {
      allCoordinates.push(...part.geometry.coordinates);
    } else if (part.geometry.type === 'Polygon') {
      allCoordinates.push(part.geometry.coordinates);
    }
  });
  
  console.log(`\nОбъединяем все ${ussrParts.length} частей СССР...`);
  
  // Обновляем СССР в европейской карте
  const ussrIndex = europeData.features.findIndex(f => 
    f.properties.name.toLowerCase().includes('ссср') ||
    f.properties.name.toLowerCase().includes('ussr')
  );
  
  if (ussrIndex !== -1) {
    europeData.features[ussrIndex].geometry = {
      type: 'MultiPolygon',
      coordinates: allCoordinates
    };
    
    // Сохраняем
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
    
    console.log('✅ СССР обновлен со всеми частями из 1938 года');
    
    // Проверяем результат
    const totalCoords = allCoordinates.flat(2);
    const minLat = Math.min(...totalCoords.map(c => c[1]));
    const maxLat = Math.max(...totalCoords.map(c => c[1]));
    const minLon = Math.min(...totalCoords.map(c => c[0]));
    const maxLon = Math.max(...totalCoords.map(c => c[0]));
    
    console.log(`\n📊 Результат:`);
    console.log(`   Всего координат: ${totalCoords.length}`);
    console.log(`   Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
    console.log(`   Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
    
    // Проверяем регионы
    const chukotka = totalCoords.filter(c => (c[0] > 170 || c[0] < -170) && c[1] > 60).length;
    const europe = totalCoords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50).length;
    const siberia = totalCoords.filter(c => c[0] >= 60 && c[0] <= 120).length;
    
    console.log(`\n🗺️ Проверка регионов:`);
    console.log(`   🌊 Чукотка/Берингов пролив: ${chukotka} точек ${chukotka > 0 ? '✅' : '❌'}`);
    console.log(`   🏛️ Европейская часть: ${europe} точек ${europe > 0 ? '✅' : '❌'}`);
    console.log(`   ❄️ Сибирь: ${siberia} точек ${siberia > 0 ? '✅' : '❌'}`);
    
    if (minLat < 36) {
      console.log(`\n⚠️ СССР заходит в Турцию (${minLat.toFixed(1)}°)`);
    } else {
      console.log(`\n✅ СССР не заходит в Турцию (${minLat.toFixed(1)}°)`);
    }
    
  } else {
    console.log('❌ СССР не найден в европейской карте');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Объединение частей завершено!');