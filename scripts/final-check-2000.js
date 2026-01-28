const fs = require('fs');

console.log('🎯 Финальная проверка всех стран в данных 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}\n`);
  
  // Проверяем все запрошенные страны
  const targetCountries = [
    { names: ['switzerland'], label: '🇨🇭 ШВЕЙЦАРИЯ', minSize: 1000 },
    { names: ['norway'], label: '🇳🇴 НОРВЕГИЯ', minSize: 5000 },
    { names: ['denmark'], label: '🇩🇰 ДАНИЯ', minSize: 1000 },
    { names: ['greenland'], label: '🇬🇱 ГРЕНЛАНДИЯ', minSize: 10000 },
    { names: ['russia'], label: '🇷🇺 РОССИЯ', minSize: 50000 }
  ];
  
  let allGood = true;
  
  targetCountries.forEach(target => {
    console.log(`${target.label}:`);
    
    const countries = worldData.features.filter(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      
      return target.names.some(targetName => 
        name.includes(targetName.toLowerCase()) || 
        subjecto.includes(targetName.toLowerCase())
      );
    });
    
    if (countries.length === 0) {
      console.log('   ❌ НЕ НАЙДЕНА');
      allGood = false;
    } else {
      countries.forEach((country, index) => {
        const size = JSON.stringify(country.geometry).length;
        const sizeOk = size >= target.minSize;
        const status = sizeOk ? '✅' : '⚠️';
        
        console.log(`   ${status} ${country.properties.NAME}: ${size} символов`);
        
        if (!sizeOk) {
          console.log(`      Ожидалось минимум: ${target.minSize} символов`);
          allGood = false;
        }
        
        // Проверяем координаты
        if (country.geometry.coordinates && country.geometry.coordinates.length > 0) {
          console.log(`      Тип геометрии: ${country.geometry.type}`);
          
          // Получаем первую координату
          let firstCoord;
          if (country.geometry.type === 'Polygon') {
            firstCoord = country.geometry.coordinates[0][0];
          } else if (country.geometry.type === 'MultiPolygon') {
            firstCoord = country.geometry.coordinates[0][0][0];
          }
          
          if (firstCoord && firstCoord.length >= 2) {
            console.log(`      Первая точка: [${firstCoord[0].toFixed(2)}, ${firstCoord[1].toFixed(2)}]`);
            
            // Проверяем, что координаты в разумных пределах
            const [lon, lat] = firstCoord;
            if (lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90) {
              console.log(`      ✅ Координаты корректны`);
            } else {
              console.log(`      ❌ Координаты вне допустимых пределов`);
              allGood = false;
            }
          } else {
            console.log(`      ❌ Некорректная структура координат`);
            allGood = false;
          }
        } else {
          console.log(`      ❌ Отсутствуют координаты`);
          allGood = false;
        }
      });
    }
    console.log('');
  });
  
  // Общая статистика
  console.log('📈 ОБЩАЯ СТАТИСТИКА:');
  console.log(`   Всего территорий: ${worldData.features.length}`);
  
  const validFeatures = worldData.features.filter(f => 
    f.properties.NAME && f.geometry && f.geometry.coordinates
  );
  console.log(`   Валидных территорий: ${validFeatures.length}`);
  
  const largeFeatures = worldData.features.filter(f => 
    JSON.stringify(f.geometry).length > 1000
  );
  console.log(`   Крупных территорий (>1000 символов): ${largeFeatures.length}`);
  
  // Проверяем размер файла
  const fileStats = fs.statSync('public/data/historical/world_2000.geojson');
  const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
  console.log(`   Размер файла: ${fileSizeMB} MB`);
  
  // Итоговый статус
  console.log(`\n🎯 ИТОГОВЫЙ СТАТУС:`);
  if (allGood) {
    console.log('✅ ВСЕ СТРАНЫ ГОТОВЫ К ОТОБРАЖЕНИЮ!');
    console.log('   Все запрошенные страны присутствуют с корректной геометрией');
    console.log('   Файл готов для использования на сайте');
  } else {
    console.log('⚠️  ЕСТЬ ПРОБЛЕМЫ');
    console.log('   Некоторые страны требуют дополнительного внимания');
  }
  
  // Список всех стран для справки
  console.log('\n📋 ПОЛНЫЙ СПИСОК СТРАН:');
  const allCountries = worldData.features
    .map(f => f.properties.NAME || f.properties.SUBJECTO || 'Unnamed')
    .sort()
    .filter((name, index, arr) => arr.indexOf(name) === index);
  
  allCountries.forEach((name, i) => {
    const feature = worldData.features.find(f => 
      (f.properties.NAME || f.properties.SUBJECTO) === name
    );
    const size = feature ? JSON.stringify(feature.geometry).length : 0;
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${name} (${size} символов)`);
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Финальная проверка завершена!');