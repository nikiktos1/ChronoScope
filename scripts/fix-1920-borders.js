const fs = require('fs');

console.log('🔧 Исправление границ 1920 года...\n');

try {
  // Загружаем мировые данные 1920
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1920.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1920.json', 'utf8'));
  
  console.log('Анализ мировых данных 1920...');
  
  // Находим правильные границы СССР (только Закавказье, исключаем неправильную часть)
  const ussrFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const partof = (f.properties.PARTOF || '').toLowerCase();
    return subjecto === 'ussr' && (
      partof.includes('armenia') || 
      partof.includes('azerbaijan')
      // Исключаем Georgia и общий USSR - они заходят в Турцию
    );
  });
  
  console.log(`Найдено ${ussrFeatures.length} частей СССР в Закавказье`);
  
  // Находим Османский султанат
  const ottomanFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    return subjecto.includes('ottoman sultanate');
  });
  
  console.log(`Найдено ${ottomanFeatures.length} частей Османского султаната`);
  
  if (ussrFeatures.length > 0) {
    // Объединяем части СССР
    const ussrCoordinates = [];
    ussrFeatures.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        ussrCoordinates.push(...feature.geometry.coordinates);
      } else if (feature.geometry.type === 'Polygon') {
        ussrCoordinates.push(feature.geometry.coordinates);
      }
    });
    
    // Обновляем СССР в европейской карте
    const ussrIndex = europeData.features.findIndex(f => f.properties.name === 'USSR');
    if (ussrIndex !== -1) {
      europeData.features[ussrIndex].geometry = {
        type: 'MultiPolygon',
        coordinates: ussrCoordinates
      };
      console.log('✅ СССР обновлен - только Закавказье');
    }
  }
  
  if (ottomanFeatures.length > 0) {
    // Добавляем Османский султанат если его нет
    const ottomanExists = europeData.features.some(f => 
      f.properties.name.toLowerCase().includes('ottoman') ||
      f.properties.name.toLowerCase().includes('османск')
    );
    
    if (!ottomanExists) {
      const ottomanCoordinates = [];
      ottomanFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          ottomanCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          ottomanCoordinates.push(feature.geometry.coordinates);
        }
      });
      
      const ottomanFeature = {
        type: 'Feature',
        properties: {
          name: 'Османский султанат',
          originalName: 'Ottoman Sultanate',
          ruler: 'Мехмед VI',
          capital: 'Константинополь',
          government: 'Султанат',
          description: 'Остатки Османской империи после поражения в WWI',
          year: 1920,
          period: 'Послевоенный период'
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: ottomanCoordinates
        }
      };
      
      europeData.features.push(ottomanFeature);
      console.log('✅ Добавлен Османский султанат');
    }
  }
  
  // Сохраняем исправленную карту
  fs.writeFileSync('public/data/maps/europe_1920.json', JSON.stringify(europeData, null, 2));
  
  console.log('\n✅ Карта 1920 года исправлена!');
  console.log('🏔️ СССР теперь только в Закавказье');
  console.log('🇹🇷 Анатолия принадлежит Османскому султанату');
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Исправление завершено!');