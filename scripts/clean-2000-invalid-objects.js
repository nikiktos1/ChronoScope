const fs = require('fs');

console.log('🧹 Очистка файла 2000 года от некорректных объектов...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Исходное количество объектов: ${worldData.features.length}`);
  
  // Фильтруем только валидные объекты
  const validFeatures = worldData.features.filter((feature, index) => {
    const hasType = feature.type === 'Feature';
    const hasProperties = feature.properties && typeof feature.properties === 'object';
    const hasGeometry = feature.geometry && feature.geometry.type && feature.geometry.coordinates;
    const hasName = feature.properties.NAME || feature.properties.SUBJECTO;
    
    const isValid = hasType && hasProperties && hasGeometry && hasName;
    
    if (!isValid) {
      console.log(`❌ Удаляем объект ${index + 1}: ${feature.properties.NAME || feature.properties.SUBJECTO || 'без названия'}`);
    }
    
    return isValid;
  });
  
  console.log(`📊 Количество валидных объектов: ${validFeatures.length}`);
  console.log(`🗑️ Удалено объектов: ${worldData.features.length - validFeatures.length}`);
  
  // Обновляем данные
  worldData.features = validFeatures;
  
  // Проверяем, что наши целевые страны остались
  console.log('\n🎯 ПРОВЕРКА ЦЕЛЕВЫХ СТРАН ПОСЛЕ ОЧИСТКИ:');
  const targets = [
    { names: ['switzerland'], label: '🇨🇭 Швейцария' },
    { names: ['norway'], label: '🇳🇴 Норвегия' },
    { names: ['denmark'], label: '🇩🇰 Дания' },
    { names: ['greenland'], label: '🇬🇱 Гренландия' },
    { names: ['russia'], label: '🇷🇺 Россия' }
  ];
  
  let allTargetsPresent = true;
  
  targets.forEach(target => {
    const found = worldData.features.find(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      return target.names.some(targetName => name.includes(targetName));
    });
    
    if (found) {
      console.log(`   ✅ ${target.label}: ${found.properties.NAME}`);
    } else {
      console.log(`   ❌ ${target.label}: НЕ НАЙДЕНА`);
      allTargetsPresent = false;
    }
  });
  
  if (allTargetsPresent) {
    // Сохраняем очищенные данные
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log(`\n✅ Файл очищен и сохранен`);
    console.log(`📊 Итоговое количество объектов: ${worldData.features.length}`);
    
    // Создаем резервную копию
    const backupName = `public/data/historical/world_2000_backup_${Date.now()}.geojson`;
    fs.copyFileSync('public/data/historical/world_2000.geojson', backupName);
    console.log(`💾 Создана резервная копия: ${backupName}`);
    
  } else {
    console.log('\n❌ ВНИМАНИЕ: Некоторые целевые страны отсутствуют после очистки!');
    console.log('Файл НЕ сохранен для предотвращения потери данных.');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Очистка завершена!');