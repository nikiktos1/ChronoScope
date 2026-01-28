const fs = require('fs');

console.log('🔄 Восстановление полной территории СССР 1938...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Поиск полной территории СССР в мировых данных...');
  
  // Ищем все части СССР
  const ussrFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('ussr') || subjecto.includes('soviet') ||
           name.includes('ussr') || name.includes('soviet');
  });
  
  console.log(`Найдено ${ussrFeatures.length} частей СССР`);
  
  // Анализируем каждую часть
  ussrFeatures.forEach((feature, i) => {
    const coords = feature.geometry.coordinates.flat(2);
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    
    console.log(`  Часть ${i+1}: ${feature.properties.SUBJECTO || feature.properties.NAME}`);
    console.log(`    Координат: ${coords.length}`);
    console.log(`    Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
    console.log(`    Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
    
    // Определяем регион
    if (maxLon > 150) {
      console.log(`    Регион: 🌊 ДАЛЬНИЙ ВОСТОК`);
    } else if (minLon > 60) {
      console.log(`    Регион: ❄️ СИБИРЬ`);
    } else if (maxLon < 60 && minLat > 50) {
      console.log(`    Регион: 🏛️ ЕВРОПЕЙСКАЯ РОССИЯ`);
    } else if (minLat < 45 && maxLon < 50) {
      console.log(`    Регион: 🏔️ КАВКАЗ`);
    } else {
      console.log(`    Регион: 🗺️ СМЕШАННЫЙ`);
    }
  });
  
  if (ussrFeatures.length > 0) {
    // Берем самую большую часть (основную территорию)
    const mainUSSR = ussrFeatures.reduce((largest, current) => {
      const currentSize = current.geometry.coordinates.flat(2).length;
      const largestSize = largest.geometry.coordinates.flat(2).length;
      return currentSize > largestSize ? current : largest;
    });
    
    console.log(`\nВыбираем основную территорию СССР:`);
    console.log(`  Название: ${mainUSSR.properties.SUBJECTO || mainUSSR.properties.NAME}`);
    console.log(`  Координат: ${mainUSSR.geometry.coordinates.flat(2).length}`);
    
    // Обновляем СССР в европейской карте
    const ussrIndex = europeData.features.findIndex(f => 
      f.properties.name.toLowerCase().includes('ussr') ||
      f.properties.name.toLowerCase().includes('ссср')
    );
    
    if (ussrIndex !== -1) {
      // Просто копируем геометрию как есть
      europeData.features[ussrIndex].geometry = mainUSSR.geometry;
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
      
      console.log('✅ СССР восстановлен с полной территорией');
      
      // Проверяем результат
      const coords = mainUSSR.geometry.coordinates.flat(2);
      const minLat = Math.min(...coords.map(c => c[1]));
      const maxLat = Math.max(...coords.map(c => c[1]));
      const minLon = Math.min(...coords.map(c => c[0]));
      const maxLon = Math.max(...coords.map(c => c[0]));
      
      console.log(`\n📏 Восстановленные границы СССР:`);
      console.log(`   Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
      console.log(`   Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
      console.log(`   Всего координат: ${coords.length}`);
      
      // Проверяем регионы
      const regions = {
        europe: coords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50).length,
        caucasus: coords.filter(c => c[0] >= 40 && c[0] <= 50 && c[1] >= 40 && c[1] <= 45).length,
        siberia: coords.filter(c => c[0] >= 60 && c[0] <= 120).length,
        farEast: coords.filter(c => c[0] >= 120).length
      };
      
      console.log(`\n🗺️ Проверка регионов:`);
      console.log(`   🏛️ Европейская Россия: ${regions.europe} точек ${regions.europe > 0 ? '✅' : '❌'}`);
      console.log(`   🏔️ Кавказ: ${regions.caucasus} точек ${regions.caucasus > 0 ? '✅' : '❌'}`);
      console.log(`   ❄️ Сибирь: ${regions.siberia} точек ${regions.siberia > 0 ? '✅' : '❌'}`);
      console.log(`   🌊 Дальний Восток: ${regions.farEast} точек ${regions.farEast > 0 ? '✅' : '❌'}`);
      
      if (minLat < 36) {
        console.log(`\n⚠️ ВНИМАНИЕ: СССР все еще заходит в Турцию (${minLat.toFixed(1)}°)`);
        console.log(`   Это может быть ошибка в исходных данных`);
      }
      
    } else {
      console.log('❌ СССР не найден в европейской карте');
    }
  } else {
    console.log('❌ СССР не найден в мировых данных');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Восстановление завершено!');