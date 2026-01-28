const fs = require('fs');

console.log('🌐 Проверка данных Швейцарии для фронтенда...\n');

try {
  // Проверяем основной файл
  console.log('📁 ПРОВЕРКА ОСНОВНОГО ФАЙЛА:');
  const mainFile = 'public/data/historical/world_2000.geojson';
  
  if (fs.existsSync(mainFile)) {
    const mainData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
    const mainSwiss = mainData.features.find(f => 
      (f.properties?.NAME || '').toLowerCase().includes('switzerland')
    );
    
    console.log(`   ${mainFile}:`);
    if (mainSwiss) {
      console.log(`      ✅ Швейцария найдена`);
      console.log(`      Размер геометрии: ${JSON.stringify(mainSwiss.geometry).length} символов`);
    } else {
      console.log(`      ❌ Швейцария не найдена`);
    }
  }
  
  // Проверяем возможные альтернативные пути
  console.log('\n🔍 ПРОВЕРКА АЛЬТЕРНАТИВНЫХ ПУТЕЙ:');
  
  const possiblePaths = [
    'public/data/world_2000.geojson',
    'public/data/maps/world_2000.geojson',
    'public/data/2000.geojson',
    'data/historical/world_2000.geojson',
    'data/world_2000.geojson'
  ];
  
  possiblePaths.forEach(path => {
    if (fs.existsSync(path)) {
      try {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const swiss = data.features?.find(f => 
          (f.properties?.NAME || '').toLowerCase().includes('switzerland')
        );
        
        console.log(`   ${path}:`);
        if (swiss) {
          console.log(`      ✅ Швейцария найдена`);
          console.log(`      Размер геометрии: ${JSON.stringify(swiss.geometry).length} символов`);
        } else {
          console.log(`      ❌ Швейцария не найдена`);
        }
      } catch (e) {
        console.log(`   ${path}: ❌ Ошибка чтения`);
      }
    } else {
      console.log(`   ${path}: файл не существует`);
    }
  });
  
  // Создаем тестовый файл с минимальными данными для проверки
  console.log('\n🧪 СОЗДАНИЕ ТЕСТОВОГО ФАЙЛА:');
  
  const testData = {
    type: 'FeatureCollection',
    name: 'test_switzerland_2000',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: [
      {
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
      }
    ]
  };
  
  fs.writeFileSync('public/data/test_switzerland_2000.geojson', JSON.stringify(testData, null, 2));
  console.log('   ✅ Создан тестовый файл: public/data/test_switzerland_2000.geojson');
  console.log('   Попробуйте загрузить этот файл в приложении для проверки');
  
  // Проверяем, есть ли проблемы с кодировкой
  console.log('\n🔤 ПРОВЕРКА КОДИРОВКИ:');
  
  const rawContent = fs.readFileSync(mainFile, 'utf8');
  const swissMatch = rawContent.match(/"NAME":\s*"Switzerland"/g);
  
  if (swissMatch) {
    console.log(`   ✅ Найдено ${swissMatch.length} упоминаний "Switzerland" в файле`);
    
    // Проверяем контекст вокруг первого упоминания
    const firstMatch = rawContent.indexOf('"NAME": "Switzerland"');
    if (firstMatch !== -1) {
      const context = rawContent.substring(Math.max(0, firstMatch - 200), firstMatch + 200);
      console.log('   Контекст первого упоминания:');
      console.log('   ' + context.replace(/\n/g, '\\n'));
    }
  } else {
    console.log('   ❌ "Switzerland" не найдена в сыром содержимом файла');
  }
  
  // Создаем упрощенную версию основного файла только со Швейцарией
  console.log('\n🎯 СОЗДАНИЕ ФАЙЛА ТОЛЬКО СО ШВЕЙЦАРИЕЙ:');
  
  const mainData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
  const swissOnly = mainData.features.filter(f => 
    (f.properties?.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (swissOnly.length > 0) {
    const swissOnlyData = {
      ...mainData,
      features: swissOnly
    };
    
    fs.writeFileSync('public/data/switzerland_only_2000.geojson', JSON.stringify(swissOnlyData, null, 2));
    console.log('   ✅ Создан файл только со Швейцарией: public/data/switzerland_only_2000.geojson');
    console.log(`   Содержит ${swissOnly.length} объектов Швейцарии`);
  }
  
  // Проверяем размер файла и возможные проблемы с загрузкой
  console.log('\n📊 АНАЛИЗ РАЗМЕРА ФАЙЛА:');
  
  const stats = fs.statSync(mainFile);
  const sizeMB = stats.size / 1024 / 1024;
  
  console.log(`   Размер файла: ${sizeMB.toFixed(2)} MB`);
  
  if (sizeMB > 10) {
    console.log('   ⚠️ Файл очень большой, возможны проблемы с загрузкой в браузере');
  } else if (sizeMB > 5) {
    console.log('   ⚠️ Файл довольно большой, загрузка может занять время');
  } else {
    console.log('   ✅ Размер файла приемлемый');
  }
  
  // Проверяем валидность JSON
  console.log('\n✅ ФИНАЛЬНАЯ ПРОВЕРКА JSON:');
  
  try {
    const testParse = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
    console.log('   ✅ JSON валиден');
    console.log(`   ✅ Содержит ${testParse.features?.length || 0} объектов`);
    
    const swissCount = testParse.features?.filter(f => 
      (f.properties?.NAME || '').toLowerCase().includes('switzerland')
    ).length || 0;
    
    console.log(`   ✅ Содержит ${swissCount} объектов Швейцарии`);
    
  } catch (e) {
    console.log('   ❌ JSON невалиден:', e.message);
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Проверка для фронтенда завершена!');