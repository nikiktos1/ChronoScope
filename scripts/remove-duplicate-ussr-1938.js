const fs = require('fs');

console.log('🗑️ Удаление дублированного СССР из карты 1938 года...\n');

try {
  // Загружаем карту 1938
  const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Поиск дублированных СССР...');
  
  // Находим все СССР
  const ussrFeatures = [];
  data.features.forEach((feature, index) => {
    const name = feature.properties.name.toLowerCase();
    if (name.includes('ссср') || name.includes('soviet') || name.includes('ussr')) {
      const coords = feature.geometry.coordinates.flat(2);
      ussrFeatures.push({
        index: index,
        name: feature.properties.name,
        coordCount: coords.length,
        feature: feature
      });
    }
  });
  
  console.log(`Найдено ${ussrFeatures.length} СССР:`);
  ussrFeatures.forEach((ussr, i) => {
    console.log(`  ${i+1}. "${ussr.name}" - ${ussr.coordCount} координат (позиция ${ussr.index + 1})`);
  });
  
  if (ussrFeatures.length > 1) {
    // Оставляем самый большой (с наибольшим количеством координат)
    const mainUSSR = ussrFeatures.reduce((largest, current) => 
      current.coordCount > largest.coordCount ? current : largest
    );
    
    console.log(`\nОставляем: "${mainUSSR.name}" с ${mainUSSR.coordCount} координатами`);
    
    // Удаляем остальные (в обратном порядке, чтобы не сбить индексы)
    const toRemove = ussrFeatures
      .filter(ussr => ussr.index !== mainUSSR.index)
      .sort((a, b) => b.index - a.index);
    
    toRemove.forEach(ussr => {
      console.log(`🗑️ Удаляем: "${ussr.name}" (позиция ${ussr.index + 1})`);
      data.features.splice(ussr.index, 1);
    });
    
    // Сохраняем обновленную карту
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(data, null, 2));
    
    console.log('\n✅ Дублированный СССР удален!');
    console.log(`📊 Осталось территорий: ${data.features.length}`);
    
  } else if (ussrFeatures.length === 1) {
    console.log('\nℹ️ Найден только один СССР, дубликатов нет');
  } else {
    console.log('\n⚠️ СССР не найден на карте');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Очистка завершена!');