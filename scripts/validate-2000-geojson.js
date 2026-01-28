const fs = require('fs');

console.log('✅ Валидация GeoJSON файла 2000 года...\n');

try {
  // Загружаем и проверяем структуру файла
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log('📊 ОБЩАЯ ИНФОРМАЦИЯ:');
  console.log(`   Тип: ${worldData.type}`);
  console.log(`   Название: ${worldData.name}`);
  console.log(`   CRS: ${worldData.crs ? JSON.stringify(worldData.crs) : 'не указан'}`);
  console.log(`   Количество объектов: ${worldData.features.length}\n`);
  
  // Проверяем структуру каждого объекта
  let validFeatures = 0;
  let invalidFeatures = 0;
  const problemCountries = [];
  
  console.log('🔍 ПРОВЕРКА СТРУКТУРЫ ОБЪЕКТОВ:');
  
  worldData.features.forEach((feature, index) => {
    const name = feature.properties.NAME || feature.properties.SUBJECTO || `Объект ${index + 1}`;
    
    // Проверяем обязательные поля
    const hasType = feature.type === 'Feature';
    const hasProperties = feature.properties && typeof feature.properties === 'object';
    const hasGeometry = feature.geometry && feature.geometry.type && feature.geometry.coordinates;
    const hasName = feature.properties.NAME || feature.properties.SUBJECTO;
    
    if (hasType && hasProperties && hasGeometry && hasName) {
      validFeatures++;
      
      // Дополнительная проверка для наших целевых стран
      const targetCountries = ['switzerland', 'norway', 'denmark', 'greenland', 'russia'];
      const countryName = name.toLowerCase();
      
      if (targetCountries.some(target => countryName.includes(target))) {
        console.log(`   ✅ ${name}: структура корректна`);
        
        // Проверяем геометрию
        const coordsStr = JSON.stringify(feature.geometry.coordinates);
        if (coordsStr.includes('null') || coordsStr.includes('undefined')) {
          console.log(`   ⚠️  ${name}: найдены null/undefined в координатах`);
          problemCountries.push(name);
        } else if (feature.geometry.coordinates.length === 0) {
          console.log(`   ⚠️  ${name}: пустые координаты`);
          problemCountries.push(name);
        } else {
          console.log(`   ✅ ${name}: геометрия валидна (${feature.geometry.type})`);
        }
      }
    } else {
      invalidFeatures++;
      problemCountries.push(name);
      console.log(`   ❌ ${name}: проблемы со структурой`);
      if (!hasType) console.log(`      - отсутствует type`);
      if (!hasProperties) console.log(`      - отсутствуют properties`);
      if (!hasGeometry) console.log(`      - отсутствует geometry`);
      if (!hasName) console.log(`      - отсутствует NAME/SUBJECTO`);
    }
  });
  
  console.log(`\n📈 СТАТИСТИКА ВАЛИДАЦИИ:`);
  console.log(`   Валидных объектов: ${validFeatures}`);
  console.log(`   Проблемных объектов: ${invalidFeatures}`);
  console.log(`   Процент валидности: ${((validFeatures / worldData.features.length) * 100).toFixed(1)}%`);
  
  if (problemCountries.length > 0) {
    console.log(`\n⚠️  ПРОБЛЕМНЫЕ ОБЪЕКТЫ:`);
    problemCountries.forEach(country => console.log(`   - ${country}`));
  }
  
  // Проверяем, что файл можно сериализовать обратно
  console.log(`\n💾 ПРОВЕРКА СЕРИАЛИЗАЦИИ:`);
  try {
    const serialized = JSON.stringify(worldData);
    console.log(`   ✅ Файл успешно сериализуется (${(serialized.length / 1024 / 1024).toFixed(2)} MB)`);
  } catch (e) {
    console.log(`   ❌ Ошибка сериализации: ${e.message}`);
  }
  
  // Финальная проверка наших целевых стран
  console.log(`\n🎯 ФИНАЛЬНАЯ ПРОВЕРКА ЦЕЛЕВЫХ СТРАН:`);
  const targets = [
    { names: ['switzerland'], label: '🇨🇭 Швейцария' },
    { names: ['norway'], label: '🇳🇴 Норвегия' },
    { names: ['denmark'], label: '🇩🇰 Дания' },
    { names: ['greenland'], label: '🇬🇱 Гренландия' },
    { names: ['russia'], label: '🇷🇺 Россия' }
  ];
  
  targets.forEach(target => {
    const found = worldData.features.filter(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      return target.names.some(targetName => name.includes(targetName));
    });
    
    if (found.length > 0) {
      found.forEach(country => {
        console.log(`   ✅ ${target.label}: ${country.properties.NAME}`);
        console.log(`      Properties: NAME="${country.properties.NAME}", SUBJECTO="${country.properties.SUBJECTO}"`);
        console.log(`      Geometry: ${country.geometry.type}, ${JSON.stringify(country.geometry).length} символов`);
      });
    } else {
      console.log(`   ❌ ${target.label}: НЕ НАЙДЕНА`);
    }
  });
  
} catch (error) {
  console.log('❌ Критическая ошибка при валидации:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Валидация завершена!');