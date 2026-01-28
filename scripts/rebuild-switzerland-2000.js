const fs = require('fs');

console.log('🇨🇭 Полная перестройка Швейцарии для 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Удаляем существующую Швейцарию
  console.log('\n🗑️ Удаление существующей Швейцарии...');
  const originalCount = worldData.features.length;
  worldData.features = worldData.features.filter(f => 
    !(f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  console.log(`Удалено объектов: ${originalCount - worldData.features.length}`);
  
  // Ищем Швейцарию в разных годах
  console.log('\n🔍 Поиск Швейцарии в других годах...');
  
  const years = ['2010', '1994', '1960', '1945', '1938', '1930', '1920', '1914', '1900'];
  let bestSwitzerland = null;
  let bestSize = 0;
  
  for (const year of years) {
    try {
      const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      const switzerlandFeatures = otherYearData.features.filter(f => {
        const name = (f.properties.NAME || '').toLowerCase();
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
        
        return name.includes('switzerland') || 
               subjecto.includes('switzerland') ||
               abbrevn.includes('switzerland') ||
               name.includes('швейцария') ||
               subjecto.includes('швейцария');
      });
      
      if (switzerlandFeatures.length > 0) {
        switzerlandFeatures.forEach(feature => {
          const size = JSON.stringify(feature.geometry).length;
          console.log(`   ${year}: найдена Швейцария "${feature.properties.NAME || feature.properties.SUBJECTO}" (${size} символов)`);
          
          if (size > bestSize) {
            bestSwitzerland = feature;
            bestSize = size;
            console.log(`   ✅ Новый лучший вариант: ${size} символов`);
          }
        });
      }
    } catch (e) {
      // Файл не найден
    }
  }
  
  // Если не нашли в исторических данных, попробуем европейские карты
  if (!bestSwitzerland || bestSize < 1000) {
    console.log('\n🗺️ Поиск в европейских картах...');
    
    const europeYears = ['2000', '1938', '1930', '1920', '1914'];
    
    for (const year of europeYears) {
      try {
        const europeData = JSON.parse(fs.readFileSync(`public/data/maps/europe_${year}.json`, 'utf8'));
        
        const switzerlandFeatures = europeData.features.filter(f => {
          const name = (f.properties.name || '').toLowerCase();
          return name.includes('швейцария') || name.includes('switzerland');
        });
        
        if (switzerlandFeatures.length > 0) {
          switzerlandFeatures.forEach(feature => {
            const size = JSON.stringify(feature.geometry).length;
            console.log(`   europe_${year}: найдена "${feature.properties.name}" (${size} символов)`);
            
            if (size > bestSize) {
              // Преобразуем формат европейской карты в формат world
              bestSwitzerland = {
                type: 'Feature',
                properties: {
                  NAME: 'Switzerland',
                  ABBREVN: 'Switzerland',
                  SUBJECTO: 'Switzerland',
                  BORDERPRECISION: 3,
                  PARTOF: 'Switzerland'
                },
                geometry: feature.geometry
              };
              bestSize = size;
              console.log(`   ✅ Новый лучший вариант из европейской карты: ${size} символов`);
            }
          });
        }
      } catch (e) {
        // Файл не найден
      }
    }
  }
  
  // Если все еще не нашли хорошую Швейцарию, создаем базовую
  if (!bestSwitzerland || bestSize < 500) {
    console.log('\n🏗️ Создание базовой геометрии Швейцарии...');
    
    // Примерные границы Швейцарии
    bestSwitzerland = {
      type: 'Feature',
      properties: {
        NAME: 'Switzerland',
        ABBREVN: 'Switzerland',
        SUBJECTO: 'Switzerland',
        BORDERPRECISION: 3,
        PARTOF: 'Switzerland'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [5.96, 45.82], // Женева
          [6.14, 46.20], // Лозанна
          [7.44, 46.95], // Берн
          [8.23, 47.07], // Цюрих
          [9.53, 47.17], // Санкт-Галлен
          [10.49, 46.86], // Граубюнден
          [10.49, 46.40], // Энгадин
          [8.96, 45.83], // Тичино
          [8.20, 46.01], // Вале
          [7.02, 46.32], // Фрибур
          [5.96, 45.82]  // Замыкаем
        ]]
      }
    };
    bestSize = JSON.stringify(bestSwitzerland.geometry).length;
    console.log(`   ✅ Создана базовая геометрия: ${bestSize} символов`);
  }
  
  // Добавляем лучшую найденную Швейцарию
  if (bestSwitzerland) {
    worldData.features.push(bestSwitzerland);
    console.log(`\n✅ Швейцария добавлена с геометрией ${bestSize} символов`);
    console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
    
    // Сохраняем
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    
    // Проверяем результат
    console.log('\n🔍 ПРОВЕРКА РЕЗУЛЬТАТА:');
    const addedSwitzerland = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes('switzerland')
    );
    
    if (addedSwitzerland) {
      console.log(`✅ Швейцария найдена: ${addedSwitzerland.properties.NAME}`);
      console.log(`   Размер геометрии: ${JSON.stringify(addedSwitzerland.geometry).length} символов`);
      console.log(`   Тип геометрии: ${addedSwitzerland.geometry.type}`);
      
      // Проверяем координаты
      if (addedSwitzerland.geometry.coordinates && addedSwitzerland.geometry.coordinates.length > 0) {
        const coords = addedSwitzerland.geometry.coordinates;
        const firstCoord = addedSwitzerland.geometry.type === 'Polygon' ? coords[0][0] : coords[0][0][0];
        console.log(`   Первая координата: [${firstCoord[0]}, ${firstCoord[1]}]`);
        console.log(`   ✅ Геометрия выглядит корректно`);
      } else {
        console.log(`   ❌ Проблема с координатами`);
      }
    } else {
      console.log(`❌ Швейцария не найдена после добавления`);
    }
    
  } else {
    console.log('\n❌ Не удалось найти или создать Швейцарию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Перестройка Швейцарии завершена!');