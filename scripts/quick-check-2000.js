const fs = require('fs');

console.log('🔍 Быстрая проверка всех запрошенных стран в 2000 году...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}\n`);
  
  // Проверяем все запрошенные страны
  const targetCountries = [
    { name: 'Switzerland', flag: '🇨🇭', label: 'ШВЕЙЦАРИЯ' },
    { name: 'Norway', flag: '🇳🇴', label: 'НОРВЕГИЯ' },
    { name: 'Denmark', flag: '🇩🇰', label: 'ДАНИЯ' },
    { name: 'Greenland', flag: '🇬🇱', label: 'ГРЕНЛАНДИЯ' },
    { name: 'Russia', flag: '🇷🇺', label: 'РОССИЯ' }
  ];
  
  let allFound = true;
  
  targetCountries.forEach(target => {
    const country = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase() === target.name.toLowerCase()
    );
    
    if (country) {
      const size = JSON.stringify(country.geometry).length;
      console.log(`✅ ${target.flag} ${target.label}: ${country.properties.NAME} (${size} символов)`);
      
      // Проверяем первую координату
      let firstCoord;
      if (country.geometry.type === 'MultiPolygon') {
        firstCoord = country.geometry.coordinates[0][0][0];
      } else if (country.geometry.type === 'Polygon') {
        firstCoord = country.geometry.coordinates[0][0];
      }
      
      if (firstCoord) {
        console.log(`   Первая точка: [${firstCoord[0].toFixed(2)}, ${firstCoord[1].toFixed(2)}]`);
      }
    } else {
      console.log(`❌ ${target.flag} ${target.label}: НЕ НАЙДЕНА`);
      allFound = false;
    }
  });
  
  // Проверяем, нет ли нежелательных объектов
  console.log('\n🔍 Проверка на нежелательные объекты:');
  
  const unwantedObjects = worldData.features.filter(f => {
    const name = (f.properties.NAME || '').toLowerCase();
    return name.includes('sweden–norway') || name.includes('sweden-norway');
  });
  
  if (unwantedObjects.length > 0) {
    console.log('⚠️  Найдены нежелательные объекты:');
    unwantedObjects.forEach(obj => {
      console.log(`   - ${obj.properties.NAME}`);
    });
  } else {
    console.log('✅ Нежелательных объектов не найдено');
  }
  
  // Итоговый статус
  console.log(`\n🎯 ИТОГОВЫЙ СТАТУС:`);
  if (allFound) {
    console.log('✅ ВСЕ ЗАПРОШЕННЫЕ СТРАНЫ НАЙДЕНЫ!');
    console.log('   Файл готов для отображения на сайте');
  } else {
    console.log('❌ НЕКОТОРЫЕ СТРАНЫ ОТСУТСТВУЮТ');
  }
  
  console.log(`📊 Размер файла: ${(fs.statSync('public/data/historical/world_2000.geojson').size / 1024 / 1024).toFixed(2)} MB`);
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Быстрая проверка завершена!');