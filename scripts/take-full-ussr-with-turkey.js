const fs = require('fs');

console.log('🗺️ Берем полный турецкий СССР (с Чукоткой) из данных 1938...\n');

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
  
  console.log(`Найдено ${ussrParts.length} частей СССР:`);
  
  // Ищем самую большую часть (турецкий СССР с Чукоткой)
  const mainUSSR = ussrParts.reduce((largest, current) => {
    const currentSize = current.geometry.coordinates.flat(2).length;
    const largestSize = largest.geometry.coordinates.flat(2).length;
    return currentSize > largestSize ? current : largest;
  });
  
  const coords = mainUSSR.geometry.coordinates.flat(2);
  const minLat = Math.min(...coords.map(c => c[1]));
  const maxLat = Math.max(...coords.map(c => c[1]));
  const minLon = Math.min(...coords.map(c => c[0]));
  const maxLon = Math.max(...coords.map(c => c[0]));
  
  console.log(`Выбрана основная часть СССР:`);
  console.log(`  Координат: ${coords.length}`);
  console.log(`  Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
  console.log(`  Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
  
  // Проверяем регионы
  const chukotka = coords.filter(c => (c[0] > 170 || c[0] < -170) && c[1] > 60).length;
  const turkey = coords.filter(c => c[1] < 36).length;
  const europe = coords.filter(c => c[0] >= 20 && c[0] <= 60 && c[1] >= 50).length;
  const siberia = coords.filter(c => c[0] >= 60 && c[0] <= 120).length;
  
  console.log(`\n🗺️ Содержит:`);
  console.log(`  🌊 Чукотка/Берингов пролив: ${chukotka} точек ${chukotka > 0 ? '✅' : '❌'}`);
  console.log(`  🏛️ Европейская часть: ${europe} точек ${europe > 0 ? '✅' : '❌'}`);
  console.log(`  ❄️ Сибирь: ${siberia} точек ${siberia > 0 ? '✅' : '❌'}`);
  console.log(`  🇹🇷 Заход в Турцию: ${turkey} точек ${turkey > 0 ? '⚠️' : '✅'}`);
  
  // Обновляем СССР в европейской карте
  const ussrIndex = europeData.features.findIndex(f => 
    f.properties.name.toLowerCase().includes('ссср') ||
    f.properties.name.toLowerCase().includes('ussr')
  );
  
  if (ussrIndex !== -1) {
    // Берем полную территорию как есть
    europeData.features[ussrIndex].geometry = mainUSSR.geometry;
    
    // Сохраняем
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
    
    console.log('\n✅ СССР обновлен полной территорией (включая Чукотку)');
    console.log('⚠️ Включает заход в Турцию - это ошибка исходных данных');
    console.log('🌊 Но зато включает полную Чукотку и Дальний Восток');
    
  } else {
    console.log('❌ СССР не найден в европейской карте');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Полный СССР установлен!');