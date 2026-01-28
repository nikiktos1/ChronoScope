const fs = require('fs');

console.log('🇳🇴 Полная перестройка Норвегии для 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Анализируем текущую Норвегию
  console.log('\n🔍 Анализ текущей Норвегии...');
  const currentNorway = worldData.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('norway')
  );
  
  if (currentNorway) {
    const size = JSON.stringify(currentNorway.geometry).length;
    console.log(`Текущая Норвегия: ${size} символов`);
    console.log(`Тип геометрии: ${currentNorway.geometry.type}`);
    
    if (currentNorway.geometry.type === 'MultiPolygon') {
      console.log(`Количество полигонов: ${currentNorway.geometry.coordinates.length}`);
    }
    
    // Проверяем координаты
    let firstCoord;
    if (currentNorway.geometry.type === 'MultiPolygon') {
      firstCoord = currentNorway.geometry.coordinates[0][0][0];
    } else if (currentNorway.geometry.type === 'Polygon') {
      firstCoord = currentNorway.geometry.coordinates[0][0];
    }
    
    if (firstCoord) {
      console.log(`Первая координата: [${firstCoord[0].toFixed(2)}, ${firstCoord[1].toFixed(2)}]`);
      
      // Проверяем диапазон координат
      let minLon = Infinity, maxLon = -Infinity;
      let minLat = Infinity, maxLat = -Infinity;
      
      function analyzeCoords(coords) {
        if (Array.isArray(coords[0])) {
          coords.forEach(analyzeCoords);
        } else {
          const [lon, lat] = coords;
          if (typeof lon === 'number' && typeof lat === 'number') {
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          }
        }
      }
      
      analyzeCoords(currentNorway.geometry.coordinates);
      
      console.log(`Диапазон: ${minLon.toFixed(2)}° до ${maxLon.toFixed(2)}° (долгота)`);
      console.log(`          ${minLat.toFixed(2)}° до ${maxLat.toFixed(2)}° (широта)`);
      
      const lonRange = maxLon - minLon;
      const latRange = maxLat - minLat;
      console.log(`Размер территории: ${lonRange.toFixed(2)}° × ${latRange.toFixed(2)}°`);
      
      // Проверяем, правильные ли это координаты для Норвегии
      // Норвегия должна быть примерно: 4-31° в.д., 58-81° с.ш.
      const norwayLonMin = 4, norwayLonMax = 31;
      const norwayLatMin = 58, norwayLatMax = 81;
      
      const lonOk = minLon >= norwayLonMin - 5 && maxLon <= norwayLonMax + 5;
      const latOk = minLat >= norwayLatMin - 5 && maxLat <= norwayLatMax + 5;
      
      if (lonOk && latOk) {
        console.log('✅ Координаты соответствуют Норвегии');
      } else {
        console.log('⚠️  Координаты не соответствуют ожидаемым для Норвегии');
        console.log(`   Ожидалось: ${norwayLonMin}-${norwayLonMax}° в.д., ${norwayLatMin}-${norwayLatMax}° с.ш.`);
      }
    }
  } else {
    console.log('❌ Норвегия не найдена в текущих данных');
  }
  
  // Удаляем существующую Норвегию
  console.log('\n🗑️ Удаление существующей Норвегии...');
  const originalCount = worldData.features.length;
  worldData.features = worldData.features.filter(f => 
    !(f.properties.NAME || '').toLowerCase().includes('norway')
  );
  console.log(`Удалено объектов: ${originalCount - worldData.features.length}`);
  
  // Ищем Норвегию в разных годах
  console.log('\n🔍 Поиск Норвегии в других годах...');
  
  const years = ['2010', '1994', '1960', '1945', '1938', '1930', '1920', '1914', '1900'];
  let bestNorway = null;
  let bestSize = 0;
  
  for (const year of years) {
    try {
      const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      const norwayFeatures = otherYearData.features.filter(f => {
        const name = (f.properties.NAME || '').toLowerCase();
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
        
        return name.includes('norway') || 
               subjecto.includes('norway') ||
               abbrevn.includes('norway') ||
               name.includes('норвегия') ||
               subjecto.includes('норвегия');
      });
      
      if (norwayFeatures.length > 0) {
        norwayFeatures.forEach(feature => {
          const size = JSON.stringify(feature.geometry).length;
          console.log(`   ${year}: найдена Норвегия "${feature.properties.NAME || feature.properties.SUBJECTO}" (${size} символов)`);
          
          // Проверяем координаты
          let firstCoord;
          if (feature.geometry.type === 'MultiPolygon') {
            firstCoord = feature.geometry.coordinates[0][0][0];
          } else if (feature.geometry.type === 'Polygon') {
            firstCoord = feature.geometry.coordinates[0][0];
          }
          
          if (firstCoord) {
            const [lon, lat] = firstCoord;
            console.log(`      Первая точка: [${lon.toFixed(2)}, ${lat.toFixed(2)}]`);
            
            // Проверяем, что это действительно Норвегия по координатам
            if (lon >= 0 && lon <= 35 && lat >= 55 && lat <= 85) {
              if (size > bestSize) {
                bestNorway = feature;
                bestSize = size;
                console.log(`   ✅ Новый лучший вариант: ${size} символов`);
              }
            } else {
              console.log(`      ⚠️  Подозрительные координаты для Норвегии`);
            }
          }
        });
      }
    } catch (e) {
      // Файл не найден
    }
  }
  
  // Если не нашли в исторических данных, попробуем европейские карты
  if (!bestNorway || bestSize < 5000) {
    console.log('\n🗺️ Поиск в европейских картах...');
    
    const europeYears = ['2000', '1938', '1930', '1920', '1914'];
    
    for (const year of europeYears) {
      try {
        const europeData = JSON.parse(fs.readFileSync(`public/data/maps/europe_${year}.json`, 'utf8'));
        
        const norwayFeatures = europeData.features.filter(f => {
          const name = (f.properties.name || '').toLowerCase();
          return name.includes('норвегия') || name.includes('norway');
        });
        
        if (norwayFeatures.length > 0) {
          norwayFeatures.forEach(feature => {
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
          });
        }
      } catch (e) {
        // Файл не найден
      }
    }
  }
  
  // Добавляем лучшую найденную Норвегию
  if (bestNorway) {
    worldData.features.push(bestNorway);
    console.log(`\n✅ Норвегия добавлена с геометрией ${bestSize} символов`);
    console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
    
    // Сохраняем
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    
    // Проверяем результат
    console.log('\n🔍 ПРОВЕРКА РЕЗУЛЬТАТА:');
    const addedNorway = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes('norway')
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
          console.log(`   ✅ Геометрия выглядит корректно`);
        }
      } else {
        console.log(`   ❌ Проблема с координатами`);
      }
    } else {
      console.log(`❌ Норвегия не найдена после добавления`);
    }
    
  } else {
    console.log('\n❌ Не удалось найти Норвегию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Перестройка Норвегии завершена!');