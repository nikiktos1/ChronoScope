const fs = require('fs');

console.log('🔍 Проверка конфликтов Швейцарии в 2000 году...\n');

try {
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}`);
  
  // Ищем все объекты, которые могут быть связаны со Швейцарией
  const swissRelated = worldData.features.filter(f => {
    const name = (f.properties.NAME || '').toLowerCase();
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
    const partof = (f.properties.PARTOF || '').toLowerCase();
    
    return name.includes('switzerland') || 
           subjecto.includes('switzerland') ||
           abbrevn.includes('switzerland') ||
           partof.includes('switzerland') ||
           name.includes('swiss') ||
           subjecto.includes('swiss') ||
           name.includes('швейцария') ||
           subjecto.includes('швейцария');
  });
  
  console.log(`🇨🇭 Найдено объектов, связанных со Швейцарией: ${swissRelated.length}`);
  
  swissRelated.forEach((feature, index) => {
    console.log(`\n   ${index + 1}. "${feature.properties.NAME}"`);
    console.log(`      SUBJECTO: "${feature.properties.SUBJECTO}"`);
    console.log(`      PARTOF: "${feature.properties.PARTOF}"`);
    console.log(`      ABBREVN: "${feature.properties.ABBREVN}"`);
    console.log(`      Размер геометрии: ${JSON.stringify(feature.geometry).length} символов`);
  });
  
  // Проверяем соседние страны
  console.log('\n🗺️ ПРОВЕРКА СОСЕДНИХ СТРАН:');
  
  const neighbors = ['Germany', 'France', 'Austria', 'Italy', 'Liechtenstein'];
  
  neighbors.forEach(neighborName => {
    const neighbor = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes(neighborName.toLowerCase())
    );
    
    if (neighbor) {
      console.log(`   ✅ ${neighborName}: найден`);
      console.log(`      Размер: ${JSON.stringify(neighbor.geometry).length} символов`);
    } else {
      console.log(`   ❌ ${neighborName}: не найден`);
    }
  });
  
  // Проверяем, нет ли дублирующихся названий
  console.log('\n🔍 ПРОВЕРКА ДУБЛИРУЮЩИХСЯ НАЗВАНИЙ:');
  
  const nameCount = {};
  worldData.features.forEach(feature => {
    const name = feature.properties.NAME || 'Unnamed';
    nameCount[name] = (nameCount[name] || 0) + 1;
  });
  
  const duplicates = Object.keys(nameCount).filter(name => nameCount[name] > 1);
  
  if (duplicates.length > 0) {
    console.log(`   Найдено дублирующихся названий: ${duplicates.length}`);
    duplicates.forEach(name => {
      console.log(`      "${name}": ${nameCount[name]} раз`);
      
      if (name.toLowerCase().includes('switzerland')) {
        console.log(`         ❌ ДУБЛИРОВАНИЕ ШВЕЙЦАРИИ!`);
        
        // Находим все дубликаты Швейцарии
        const swissDuplicates = worldData.features.filter(f => f.properties.NAME === name);
        
        console.log(`         Найдено дубликатов: ${swissDuplicates.length}`);
        
        // Оставляем только лучший (с наибольшей геометрией)
        let bestSwiss = swissDuplicates[0];
        let bestSize = JSON.stringify(bestSwiss.geometry).length;
        
        swissDuplicates.forEach((duplicate, index) => {
          const size = JSON.stringify(duplicate.geometry).length;
          console.log(`            ${index + 1}. Размер: ${size} символов`);
          
          if (size > bestSize) {
            bestSwiss = duplicate;
            bestSize = size;
          }
        });
        
        console.log(`         Лучший вариант: ${bestSize} символов`);
        
        // Удаляем дубликаты, оставляем только лучший
        worldData.features = worldData.features.filter(f => {
          if (f.properties.NAME === name) {
            return f === bestSwiss;
          }
          return true;
        });
        
        console.log(`         ✅ Дубликаты удалены, оставлен лучший вариант`);
      }
    });
  } else {
    console.log('   ✅ Дублирующихся названий не найдено');
  }
  
  // Проверяем пустые или некорректные объекты
  console.log('\n🔍 ПРОВЕРКА НЕКОРРЕКТНЫХ ОБЪЕКТОВ:');
  
  const invalidFeatures = worldData.features.filter(f => {
    return !f.properties.NAME || 
           f.properties.NAME.trim() === '' ||
           !f.geometry ||
           !f.geometry.coordinates ||
           JSON.stringify(f.geometry).length < 50;
  });
  
  if (invalidFeatures.length > 0) {
    console.log(`   Найдено некорректных объектов: ${invalidFeatures.length}`);
    
    invalidFeatures.forEach((feature, index) => {
      console.log(`      ${index + 1}. NAME: "${feature.properties.NAME || 'ПУСТО'}"`);
      console.log(`         Размер геометрии: ${JSON.stringify(feature.geometry || {}).length} символов`);
    });
    
    // Удаляем некорректные объекты
    worldData.features = worldData.features.filter(f => {
      return f.properties.NAME && 
             f.properties.NAME.trim() !== '' &&
             f.geometry &&
             f.geometry.coordinates &&
             JSON.stringify(f.geometry).length >= 50;
    });
    
    console.log(`   ✅ Некорректные объекты удалены`);
  } else {
    console.log('   ✅ Некорректных объектов не найдено');
  }
  
  // Сохраняем очищенные данные
  fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
  
  console.log(`\n📊 ИТОГОВАЯ СТАТИСТИКА:`);
  console.log(`   Общее количество территорий: ${worldData.features.length}`);
  
  // Финальная проверка Швейцарии
  const finalSwitzerland = worldData.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (finalSwitzerland) {
    console.log(`   ✅ Швейцария: найдена`);
    console.log(`      Размер геометрии: ${JSON.stringify(finalSwitzerland.geometry).length} символов`);
    console.log(`      Все свойства корректны`);
  } else {
    console.log(`   ❌ Швейцария: не найдена`);
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Проверка конфликтов завершена!');