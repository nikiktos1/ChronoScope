const fs = require('fs');

console.log('🔧 Исправление геометрии Швейцарии в 2000 году...\n');

try {
  // Загружаем данные 2000 и 2010 годов
  const world2000 = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  const world2010 = JSON.parse(fs.readFileSync('public/data/historical/world_2010.geojson', 'utf8'));
  
  // Находим Швейцарию в обоих файлах
  const switzerland2000 = world2000.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  const switzerland2010 = world2010.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (!switzerland2000) {
    console.log('❌ Швейцария не найдена в данных 2000 года');
    return;
  }
  
  if (!switzerland2010) {
    console.log('❌ Швейцария не найдена в данных 2010 года');
    return;
  }
  
  console.log('📊 СРАВНЕНИЕ ГЕОМЕТРИЙ:');
  console.log(`   2000 год: ${JSON.stringify(switzerland2000.geometry).length} символов, тип: ${switzerland2000.geometry.type}`);
  console.log(`   2010 год: ${JSON.stringify(switzerland2010.geometry).length} символов, тип: ${switzerland2010.geometry.type}`);
  
  // Проверяем координаты
  console.log('\n🔍 ПРОВЕРКА КООРДИНАТ:');
  
  function getFirstCoordinate(geometry) {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates[0][0];
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates[0][0][0];
    }
    return null;
  }
  
  const coord2000 = getFirstCoordinate(switzerland2000.geometry);
  const coord2010 = getFirstCoordinate(switzerland2010.geometry);
  
  console.log(`   2000 год: [${coord2000[0]}, ${coord2000[1]}]`);
  console.log(`   2010 год: [${coord2010[0]}, ${coord2010[1]}]`);
  
  // Проверяем валидность геометрии 2000 года
  console.log('\n🔍 ВАЛИДАЦИЯ ГЕОМЕТРИИ 2000 ГОДА:');
  
  function validateGeometry(geometry) {
    try {
      if (!geometry || !geometry.type || !geometry.coordinates) {
        return { valid: false, error: 'Отсутствует тип или координаты' };
      }
      
      if (geometry.type === 'MultiPolygon') {
        if (!Array.isArray(geometry.coordinates)) {
          return { valid: false, error: 'coordinates не является массивом' };
        }
        
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const polygon = geometry.coordinates[i];
          if (!Array.isArray(polygon)) {
            return { valid: false, error: `Полигон ${i} не является массивом` };
          }
          
          for (let j = 0; j < polygon.length; j++) {
            const ring = polygon[j];
            if (!Array.isArray(ring)) {
              return { valid: false, error: `Кольцо ${j} полигона ${i} не является массивом` };
            }
            
            if (ring.length < 4) {
              return { valid: false, error: `Кольцо ${j} полигона ${i} содержит менее 4 точек` };
            }
            
            for (let k = 0; k < ring.length; k++) {
              const point = ring[k];
              if (!Array.isArray(point) || point.length !== 2) {
                return { valid: false, error: `Точка ${k} кольца ${j} полигона ${i} некорректна` };
              }
              
              if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
                return { valid: false, error: `Координаты точки ${k} кольца ${j} полигона ${i} не числа` };
              }
              
              // Проверяем разумные пределы для Швейцарии
              if (point[0] < 5 || point[0] > 11 || point[1] < 45 || point[1] > 48) {
                return { valid: false, error: `Координаты точки ${k} кольца ${j} полигона ${i} вне пределов Швейцарии: [${point[0]}, ${point[1]}]` };
              }
            }
            
            // Проверяем, что первая и последняя точки совпадают
            const firstPoint = ring[0];
            const lastPoint = ring[ring.length - 1];
            if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
              return { valid: false, error: `Кольцо ${j} полигона ${i} не замкнуто` };
            }
          }
        }
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  const validation2000 = validateGeometry(switzerland2000.geometry);
  const validation2010 = validateGeometry(switzerland2010.geometry);
  
  console.log(`   2000 год: ${validation2000.valid ? '✅ Валидна' : '❌ ' + validation2000.error}`);
  console.log(`   2010 год: ${validation2010.valid ? '✅ Валидна' : '❌ ' + validation2010.error}`);
  
  // Если геометрия 2000 года невалидна, заменяем её на геометрию 2010 года
  if (!validation2000.valid) {
    console.log('\n🔧 ЗАМЕНА ГЕОМЕТРИИ...');
    console.log(`   Заменяем невалидную геометрию 2000 года на геометрию 2010 года`);
    
    switzerland2000.geometry = JSON.parse(JSON.stringify(switzerland2010.geometry));
    
    console.log(`   ✅ Геометрия заменена`);
    console.log(`   Новый размер: ${JSON.stringify(switzerland2000.geometry).length} символов`);
    
    // Сохраняем
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(world2000, null, 2));
    console.log('   ✅ Данные сохранены');
    
  } else if (validation2000.valid && validation2010.valid) {
    // Обе геометрии валидны, но возможно проблема в сложности
    console.log('\n🔧 УПРОЩЕНИЕ ГЕОМЕТРИИ...');
    console.log('   Обе геометрии валидны, но заменяем сложную на простую для лучшего отображения');
    
    switzerland2000.geometry = JSON.parse(JSON.stringify(switzerland2010.geometry));
    
    console.log(`   ✅ Геометрия упрощена`);
    console.log(`   Размер: ${JSON.stringify(switzerland2000.geometry).length} символов`);
    
    // Сохраняем
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(world2000, null, 2));
    console.log('   ✅ Данные сохранены');
  }
  
  // Финальная проверка
  console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
  const finalWorld = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  const finalSwitzerland = finalWorld.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (finalSwitzerland) {
    console.log('✅ Швейцария найдена');
    console.log(`   Размер геометрии: ${JSON.stringify(finalSwitzerland.geometry).length} символов`);
    console.log(`   Тип геометрии: ${finalSwitzerland.geometry.type}`);
    
    const finalCoord = getFirstCoordinate(finalSwitzerland.geometry);
    console.log(`   Первая координата: [${finalCoord[0]}, ${finalCoord[1]}]`);
    
    const finalValidation = validateGeometry(finalSwitzerland.geometry);
    console.log(`   Валидность: ${finalValidation.valid ? '✅ Валидна' : '❌ ' + finalValidation.error}`);
  } else {
    console.log('❌ Швейцария не найдена');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Исправление геометрии завершено!');