const fs = require('fs');

console.log('🇳🇴 Добавление правильной современной Норвегии для 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Удаляем все объекты, связанные с Норвегией (включая Sweden-Norway)
  console.log('\n🗑️ Удаление всех объектов, связанных с Норвегией...');
  const originalCount = worldData.features.length;
  
  worldData.features = worldData.features.filter(f => {
    const name = (f.properties.NAME || '').toLowerCase();
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    
    const isNorwayRelated = name.includes('norway') || 
                           subjecto.includes('norway') ||
                           name.includes('норвегия') ||
                           subjecto.includes('норвегия');
    
    if (isNorwayRelated) {
      console.log(`   Удаляем: ${f.properties.NAME || f.properties.SUBJECTO}`);
    }
    
    return !isNorwayRelated;
  });
  
  console.log(`Удалено объектов: ${originalCount - worldData.features.length}`);
  
  // Теперь ищем современную Норвегию в других годах
  console.log('\n🔍 Поиск современной Норвегии...');
  
  const modernYears = ['2010', '1994', '1960', '1945'];
  let bestNorway = null;
  let bestSize = 0;
  
  for (const year of modernYears) {
    try {
      const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      // Ищем именно "Norway" (не Sweden-Norway)
      const norwayFeatures = otherYearData.features.filter(f => {
        const name = (f.properties.NAME || '').toLowerCase();
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        
        return (name === 'norway' || subjecto === 'norway') && 
               !name.includes('sweden') && !subjecto.includes('sweden');
      });
      
      if (norwayFeatures.length > 0) {
        const feature = norwayFeatures[0];
        const size = JSON.stringify(feature.geometry).length;
        
        console.log(`   ${year}: найдена Норвегия "${feature.properties.NAME}" (${size} символов)`);
        
        // Проверяем координаты - должны быть в районе Норвегии
        let firstCoord;
        if (feature.geometry.type === 'MultiPolygon') {
          firstCoord = feature.geometry.coordinates[0][0][0];
        } else if (feature.geometry.type === 'Polygon') {
          firstCoord = feature.geometry.coordinates[0][0];
        }
        
        if (firstCoord) {
          const [lon, lat] = firstCoord;
          console.log(`      Первая точка: [${lon.toFixed(2)}, ${lat.toFixed(2)}]`);
          
          // Норвегия должна быть примерно: 4-31° в.д., 58-81° с.ш.
          if (lon >= 4 && lon <= 31 && lat >= 58 && lat <= 81) {
            if (size > bestSize) {
              bestNorway = feature;
              bestSize = size;
              console.log(`   ✅ Новый лучший вариант: ${size} символов`);
            }
          } else {
            console.log(`      ⚠️  Координаты не соответствуют Норвегии`);
          }
        }
      }
    } catch (e) {
      // Файл не найден
    }
  }
  
  // Если не нашли в world файлах, попробуем европейские карты
  if (!bestNorway) {
    console.log('\n🗺️ Поиск в европейских картах...');
    
    const europeYears = ['2000', '1938', '1930', '1920'];
    
    for (const year of europeYears) {
      try {
        const europeData = JSON.parse(fs.readFileSync(`public/data/maps/europe_${year}.json`, 'utf8'));
        
        const norwayFeatures = europeData.features.filter(f => {
          const name = (f.properties.name || '').toLowerCase();
          return name.includes('норвегия') && !name.includes('швеция');
        });
        
        if (norwayFeatures.length > 0) {
          const feature = norwayFeatures[0];
          const size = JSON.stringify(feature.geometry).length;
          console.log(`   europe_${year}: найдена "${feature.properties.name}" (${size} символов)`);
          
          if (size > bestSize) {
            // Преобразуем формат европейской карты в формат world
            bestNorway = {
              type: 'Feature',
              properties: {
                NAME: 'Norway',
                ABBREVN: 'Norway',
                SUBJECTO: 'Norway',
                BORDERPRECISION: 3,
                PARTOF: 'Norway'
              },
              geometry: feature.geometry
            };
            bestSize = size;
            console.log(`   ✅ Новый лучший вариант из европейской карты: ${size} символов`);
          }
        }
      } catch (e) {
        // Файл не найден
      }
    }
  }
  
  // Если все еще не нашли, создаем базовую геометрию Норвегии
  if (!bestNorway) {
    console.log('\n🏗️ Создание базовой геометрии Норвегии...');
    
    // Примерные границы Норвегии (основные точки)
    bestNorway = {
      type: 'Feature',
      properties: {
        NAME: 'Norway',
        ABBREVN: 'Norway',
        SUBJECTO: 'Norway',
        BORDERPRECISION: 3,
        PARTOF: 'Norway'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Основная территория Норвегии
          [[
            [4.99, 58.86], // Юго-запад
            [5.73, 62.90], // Западное побережье
            [14.22, 68.72], // Северная Норвегия
            [29.75, 70.07], // Финнмарк
            [31.05, 70.21], // Восточная граница с Россией
            [28.16, 71.18], // Северный мыс
            [23.66, 71.03], // Северное побережье
            [16.11, 68.78], // Лофотенские острова
            [5.05, 61.06], // Западные фьорды
            [4.99, 58.86]  // Замыкаем
          ]],
          // Шпицберген (упрощенно)
          [[
            [10.5, 78.2],
            [33.5, 80.8],
            [10.5, 78.2]
          ]]
        ]
      }
    };
    bestSize = JSON.stringify(bestNorway.geometry).length;
    console.log(`   ✅ Создана базовая геометрия: ${bestSize} символов`);
  }
  
  // Добавляем Норвегию
  if (bestNorway) {
    worldData.features.push(bestNorway);
    console.log(`\n✅ Норвегия добавлена с геометрией ${bestSize} символов`);
    console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
    
    // Сохраняем
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    
    // Проверяем результат
    console.log('\n🔍 ПРОВЕРКА РЕЗУЛЬТАТА:');
    const addedNorway = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase() === 'norway'
    );
    
    if (addedNorway) {
      console.log(`✅ Норвегия найдена: ${addedNorway.properties.NAME}`);
      console.log(`   Размер геометрии: ${JSON.stringify(addedNorway.geometry).length} символов`);
      console.log(`   Тип геометрии: ${addedNorway.geometry.type}`);
      
      // Проверяем координаты
      if (addedNorway.geometry.coordinates && addedNorway.geometry.coordinates.length > 0) {
        let firstCoord;
        if (addedNorway.geometry.type === 'MultiPolygon') {
          firstCoord = addedNorway.geometry.coordinates[0][0][0];
        } else if (addedNorway.geometry.type === 'Polygon') {
          firstCoord = addedNorway.geometry.coordinates[0][0];
        }
        
        if (firstCoord) {
          console.log(`   Первая координата: [${firstCoord[0].toFixed(2)}, ${firstCoord[1].toFixed(2)}]`);
          
          // Проверяем, что это действительно Норвегия
          const [lon, lat] = firstCoord;
          if (lon >= 4 && lon <= 31 && lat >= 58 && lat <= 81) {
            console.log(`   ✅ Координаты соответствуют Норвегии`);
          } else {
            console.log(`   ⚠️  Координаты не соответствуют ожидаемым для Норвегии`);
          }
        }
      }
    } else {
      console.log(`❌ Норвегия не найдена после добавления`);
    }
    
    // Проверяем, что нет Sweden-Norway
    const swedenNorway = worldData.features.find(f => 
      (f.properties.NAME || '').includes('Sweden–Norway')
    );
    
    if (swedenNorway) {
      console.log(`⚠️  Все еще есть Sweden–Norway: ${swedenNorway.properties.NAME}`);
    } else {
      console.log(`✅ Sweden–Norway успешно удалена`);
    }
    
  } else {
    console.log('\n❌ Не удалось найти или создать Норвегию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Добавление правильной Норвегии завершено!');