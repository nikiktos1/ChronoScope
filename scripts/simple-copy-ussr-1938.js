const fs = require('fs');

console.log('📋 Простое копирование СССР из мировых данных 1938...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Поиск СССР в мировых данных...');
  
  // Находим все части СССР в мировых данных
  const ussrFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('ussr') || name.includes('ussr');
  });
  
  console.log(`Найдено ${ussrFeatures.length} частей СССР в мировых данных`);
  
  // Находим СССР в европейской карте
  const ussrIndex = europeData.features.findIndex(f => {
    const name = f.properties.name.toLowerCase();
    return name.includes('ссср') || name.includes('ussr');
  });
  
  if (ussrIndex !== -1 && ussrFeatures.length > 0) {
    console.log('Найден СССР в европейской карте');
    
    // Берем самую большую часть СССР из мировых данных (как делали для РИ)
    const mainUSSRFeature = ussrFeatures.reduce((largest, current) => {
      const currentSize = current.geometry.coordinates.flat(2).length;
      const largestSize = largest.geometry.coordinates.flat(2).length;
      return currentSize > largestSize ? current : largest;
    });
    
    console.log(`Выбрана самая большая часть СССР (${mainUSSRFeature.geometry.coordinates.flat(2).length} точек)`);
    
    console.log('Копируем геометрию СССР как есть...');
    
    // Просто копируем геометрию без изменений (как для РИ)
    europeData.features[ussrIndex].geometry = mainUSSRFeature.geometry;
    
    // Сохраняем
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
    
    console.log('✅ СССР скопирован из мировых данных');
    
    // Проверяем что получилось
    const coords = mainUSSRFeature.geometry.coordinates.flat(2);
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    
    console.log(`📏 Охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}° долготы`);
    console.log(`📏 Охват: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}° широты`);
    console.log(`📊 Всего точек: ${coords.length}`);
    
    // Проверяем регионы
    const chukotka = coords.filter(c => c[0] > 170 || c[0] < -170).length;
    const siberia = coords.filter(c => c[0] >= 60 && c[0] <= 120).length;
    const europe = coords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50).length;
    
    console.log(`\n🗺️ Проверка регионов:`);
    console.log(`   🌊 Чукотка/Дальний Восток: ${chukotka} точек ${chukotka > 0 ? '✅' : '❌'}`);
    console.log(`   ❄️ Сибирь: ${siberia} точек ${siberia > 0 ? '✅' : '❌'}`);
    console.log(`   🏛️ Европейская часть: ${europe} точек ${europe > 0 ? '✅' : '❌'}`);
    
    if (minLat < 36) {
      console.log(`\n⚠️ СССР заходит в Турцию (${minLat.toFixed(1)}°) - это ошибка исходных данных`);
    } else {
      console.log(`\n✅ СССР не заходит в Турцию (${minLat.toFixed(1)}°)`);
    }
    
  } else {
    console.log('❌ Не удалось найти СССР');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Копирование завершено!');