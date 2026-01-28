const fs = require('fs');

console.log('🔍 Глубокая диагностика Швейцарии в 2000 году...\n');

try {
  // Проверяем файл напрямую
  console.log('📁 ПРОВЕРКА ФАЙЛА:');
  const filePath = 'public/data/historical/world_2000.geojson';
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ Файл world_2000.geojson не существует!');
    return;
  }
  
  const stats = fs.statSync(filePath);
  console.log(`   ✅ Файл существует`);
  console.log(`   Размер: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Последнее изменение: ${stats.mtime}`);
  
  // Загружаем и парсим данные
  console.log('\n📊 ЗАГРУЗКА ДАННЫХ:');
  const rawData = fs.readFileSync(filePath, 'utf8');
  console.log(`   Размер файла: ${rawData.length} символов`);
  
  let worldData;
  try {
    worldData = JSON.parse(rawData);
    console.log('   ✅ JSON корректно парсится');
  } catch (parseError) {
    console.log('   ❌ Ошибка парсинга JSON:', parseError.message);
    return;
  }
  
  console.log(`   Тип: ${worldData.type}`);
  console.log(`   Количество features: ${worldData.features ? worldData.features.length : 'undefined'}`);
  
  if (!worldData.features || !Array.isArray(worldData.features)) {
    console.log('   ❌ Features отсутствуют или не являются массивом');
    return;
  }
  
  // Ищем Швейцарию всеми возможными способами
  console.log('\n🔍 ПОИСК ШВЕЙЦАРИИ:');
  
  // Поиск по NAME
  const byName = worldData.features.filter(f => {
    const name = (f.properties?.NAME || '').toLowerCase();
    return name.includes('switzerland') || name.includes('швейцария');
  });
  console.log(`   По NAME: найдено ${byName.length} объектов`);
  
  // Поиск по SUBJECTO
  const bySubjecto = worldData.features.filter(f => {
    const subjecto = (f.properties?.SUBJECTO || '').toLowerCase();
    return subjecto.includes('switzerland') || subjecto.includes('швейцария');
  });
  console.log(`   По SUBJECTO: найдено ${bySubjecto.length} объектов`);
  
  // Поиск по ABBREVN
  const byAbbrevn = worldData.features.filter(f => {
    const abbrevn = (f.properties?.ABBREVN || '').toLowerCase();
    return abbrevn.includes('switzerland') || abbrevn.includes('швейцария');
  });
  console.log(`   По ABBREVN: найдено ${byAbbrevn.length} объектов`);
  
  // Поиск по всем свойствам
  const byAnyProperty = worldData.features.filter(f => {
    if (!f.properties) return false;
    
    const allProps = Object.values(f.properties).join(' ').toLowerCase();
    return allProps.includes('switzerland') || allProps.includes('швейцария');
  });
  console.log(`   По всем свойствам: найдено ${byAnyProperty.length} объектов`);
  
  // Объединяем все результаты
  const allSwiss = [...new Set([...byName, ...bySubjecto, ...byAbbrevn, ...byAnyProperty])];
  console.log(`   ИТОГО уникальных объектов: ${allSwiss.length}`);
  
  if (allSwiss.length === 0) {
    console.log('\n❌ ШВЕЙЦАРИЯ НЕ НАЙДЕНА!');
    
    // Проверяем несколько случайных объектов для понимания структуры
    console.log('\n📋 ПРИМЕРЫ ОБЪЕКТОВ В ФАЙЛЕ:');
    for (let i = 0; i < Math.min(5, worldData.features.length); i++) {
      const feature = worldData.features[i];
      console.log(`   ${i + 1}. NAME: "${feature.properties?.NAME || 'undefined'}"`);
      console.log(`      SUBJECTO: "${feature.properties?.SUBJECTO || 'undefined'}"`);
      console.log(`      Все свойства: ${Object.keys(feature.properties || {}).join(', ')}`);
    }
    
    // Попробуем добавить Швейцарию заново
    console.log('\n🔧 ДОБАВЛЕНИЕ ШВЕЙЦАРИИ ЗАНОВО:');
    
    // Ищем эталонную Швейцарию в других годах
    const referenceYears = ['2010', '1994', '1960', '1945'];
    let referenceSwiss = null;
    
    for (const year of referenceYears) {
      try {
        const refData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        const refSwiss = refData.features.find(f => 
          (f.properties?.NAME || '').toLowerCase().includes('switzerland')
        );
        
        if (refSwiss) {
          referenceSwiss = refSwiss;
          console.log(`   ✅ Найдена эталонная Швейцария в ${year} году`);
          console.log(`      Размер геометрии: ${JSON.stringify(refSwiss.geometry).length} символов`);
          break;
        }
      } catch (e) {
        // Файл не найден
      }
    }
    
    if (referenceSwiss) {
      // Создаем копию для 2000 года
      const newSwiss = {
        type: 'Feature',
        properties: {
          NAME: 'Switzerland',
          ABBREVN: 'Switzerland',
          SUBJECTO: 'Switzerland',
          BORDERPRECISION: 3,
          PARTOF: 'Switzerland'
        },
        geometry: JSON.parse(JSON.stringify(referenceSwiss.geometry))
      };
      
      // Добавляем в данные
      worldData.features.push(newSwiss);
      console.log('   ✅ Швейцария добавлена в данные');
      
      // Сохраняем
      fs.writeFileSync(filePath, JSON.stringify(worldData, null, 2));
      console.log('   ✅ Файл сохранен');
      
      // Проверяем результат
      const verifyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const verifySwiss = verifyData.features.find(f => 
        (f.properties?.NAME || '').toLowerCase().includes('switzerland')
      );
      
      if (verifySwiss) {
        console.log('   ✅ Швейцария найдена после добавления');
        console.log(`      Размер геометрии: ${JSON.stringify(verifySwiss.geometry).length} символов`);
      } else {
        console.log('   ❌ Швейцария не найдена после добавления');
      }
    } else {
      console.log('   ❌ Не найдена эталонная Швейцария в других годах');
    }
    
  } else {
    console.log('\n✅ ШВЕЙЦАРИЯ НАЙДЕНА!');
    
    allSwiss.forEach((swiss, index) => {
      console.log(`\n   ОБЪЕКТ #${index + 1}:`);
      console.log(`      NAME: "${swiss.properties?.NAME}"`);
      console.log(`      SUBJECTO: "${swiss.properties?.SUBJECTO}"`);
      console.log(`      ABBREVN: "${swiss.properties?.ABBREVN}"`);
      console.log(`      PARTOF: "${swiss.properties?.PARTOF}"`);
      
      // Проверяем геометрию
      if (swiss.geometry) {
        console.log(`      Тип геометрии: ${swiss.geometry.type}`);
        console.log(`      Размер геометрии: ${JSON.stringify(swiss.geometry).length} символов`);
        
        // Проверяем координаты
        let firstCoord = null;
        try {
          if (swiss.geometry.type === 'Polygon') {
            firstCoord = swiss.geometry.coordinates[0][0];
          } else if (swiss.geometry.type === 'MultiPolygon') {
            firstCoord = swiss.geometry.coordinates[0][0][0];
          }
          
          if (firstCoord && Array.isArray(firstCoord) && firstCoord.length >= 2) {
            console.log(`      Первая координата: [${firstCoord[0]}, ${firstCoord[1]}]`);
            
            // Проверяем, что координаты в разумных пределах
            const lon = firstCoord[0];
            const lat = firstCoord[1];
            
            if (typeof lon === 'number' && typeof lat === 'number') {
              if (lon >= 5.9 && lon <= 10.5 && lat >= 45.8 && lat <= 47.8) {
                console.log(`      ✅ Координаты в пределах Швейцарии`);
              } else {
                console.log(`      ⚠️ Координаты вне ожидаемых пределов Швейцарии`);
              }
            } else {
              console.log(`      ❌ Координаты не являются числами`);
            }
          } else {
            console.log(`      ❌ Не удалось извлечь первую координату`);
          }
        } catch (coordError) {
          console.log(`      ❌ Ошибка при проверке координат: ${coordError.message}`);
        }
      } else {
        console.log(`      ❌ Геометрия отсутствует`);
      }
      
      // Проверяем все свойства
      console.log(`      Все свойства:`);
      if (swiss.properties) {
        Object.keys(swiss.properties).forEach(key => {
          console.log(`         ${key}: "${swiss.properties[key]}"`);
        });
      } else {
        console.log(`         ❌ Свойства отсутствуют`);
      }
    });
  }
  
  // Проверяем общую структуру файла
  console.log('\n📊 ОБЩАЯ СТАТИСТИКА:');
  console.log(`   Всего объектов: ${worldData.features.length}`);
  
  const withNames = worldData.features.filter(f => f.properties?.NAME);
  console.log(`   Объектов с NAME: ${withNames.length}`);
  
  const withGeometry = worldData.features.filter(f => f.geometry && f.geometry.coordinates);
  console.log(`   Объектов с геометрией: ${withGeometry.length}`);
  
  // Показываем несколько соседних стран для сравнения
  console.log('\n🗺️ СОСЕДНИЕ СТРАНЫ ДЛЯ СРАВНЕНИЯ:');
  const neighbors = ['Germany', 'France', 'Austria', 'Italy'];
  
  neighbors.forEach(neighborName => {
    const neighbor = worldData.features.find(f => 
      (f.properties?.NAME || '').toLowerCase().includes(neighborName.toLowerCase())
    );
    
    if (neighbor) {
      console.log(`   ✅ ${neighborName}:`);
      console.log(`      NAME: "${neighbor.properties.NAME}"`);
      console.log(`      Размер геометрии: ${JSON.stringify(neighbor.geometry).length} символов`);
    } else {
      console.log(`   ❌ ${neighborName}: не найден`);
    }
  });
  
} catch (error) {
  console.log('❌ Критическая ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Глубокая диагностика завершена!');