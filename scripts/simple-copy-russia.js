const fs = require('fs');

console.log('📋 Простое копирование России из мировых данных...\n');

try {
  // Загружаем мировые данные 1914
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1914.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
  
  console.log('Поиск России в мировых данных...');
  
  // Находим все части России в мировых данных
  const russianFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('russia') || name.includes('russia');
  });
  
  console.log(`Найдено ${russianFeatures.length} частей России в мировых данных`);
  
  // Находим Россию в европейской карте
  const russiaIndex = europeData.features.findIndex(f => {
    const name = f.properties.name.toLowerCase();
    return name.includes('росс') || name.includes('russian');
  });
  
  if (russiaIndex !== -1 && russianFeatures.length > 0) {
    console.log('Найдена Россия в европейской карте');
    
    // Берем самую большую часть России из мировых данных
    const mainRussianFeature = russianFeatures.reduce((largest, current) => {
      const currentSize = current.geometry.coordinates.flat(2).length;
      const largestSize = largest.geometry.coordinates.flat(2).length;
      return currentSize > largestSize ? current : largest;
    });
    
    console.log(`Выбрана самая большая часть России (${mainRussianFeature.geometry.coordinates.flat(2).length} точек)`);
    
    console.log('Копируем геометрию России как есть...');
    
    // Просто копируем геометрию без изменений
    europeData.features[russiaIndex].geometry = mainRussianFeature.geometry;
    
    // Сохраняем
    fs.writeFileSync('public/data/maps/europe_1914.json', JSON.stringify(europeData, null, 2));
    
    console.log('✅ Россия скопирована из мировых данных');
    
    // Проверяем что получилось
    const coords = mainRussianFeature.geometry.coordinates.flat(2);
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    
    console.log(`📏 Охват: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}° долготы`);
    console.log(`📏 Охват: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}° широты`);
    console.log(`📊 Всего точек: ${coords.length}`);
    
  } else {
    console.log('❌ Не удалось найти Россию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Копирование завершено!');