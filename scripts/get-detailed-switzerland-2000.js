const fs = require('fs');

console.log('🔍 Поиск детальной геометрии Швейцарии...\n');

try {
  // Проверяем европейские карты
  console.log('🗺️ ПРОВЕРКА ЕВРОПЕЙСКИХ КАРТ:');
  
  const europeYears = ['2000', '1938', '1930', '1920', '1914'];
  let bestSwitzerland = null;
  let bestSize = 0;
  let bestSource = '';
  
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
            bestSource = `europe_${year}`;
            console.log(`   ✅ Новый лучший вариант: ${size} символов из ${bestSource}`);
          }
        });
      }
    } catch (e) {
      console.log(`   ❌ Файл europe_${year}.json не найден`);
    }
  }
  
  // Проверяем исторические данные с большей геометрией
  console.log('\n🏛️ ПРОВЕРКА ИСТОРИЧЕСКИХ ДАННЫХ:');
  
  const historicalYears = ['1960', '1945', '1938', '1930', '1920', '1914', '1900', '1815'];
  
  for (const year of historicalYears) {
    try {
      const historicalData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      const switzerlandFeatures = historicalData.features.filter(f => {
        const name = (f.properties.NAME || '').toLowerCase();
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        
        return name.includes('switzerland') || subjecto.includes('switzerland');
      });
      
      if (switzerlandFeatures.length > 0) {
        switzerlandFeatures.forEach(feature => {
          const size = JSON.stringify(feature.geometry).length;
          console.log(`   world_${year}: найдена "${feature.properties.NAME}" (${size} символов)`);
          
          if (size > bestSize) {
            bestSwitzerland = feature;
            bestSize = size;
            bestSource = `world_${year}`;
            console.log(`   ✅ Новый лучший вариант: ${size} символов из ${bestSource}`);
          }
        });
      }
    } catch (e) {
      console.log(`   ❌ Файл world_${year}.geojson не найден`);
    }
  }
  
  if (bestSwitzerland && bestSize > 1000) {
    console.log(`\n🎯 ЛУЧШИЙ ВАРИАНТ НАЙДЕН:`);
    console.log(`   Источник: ${bestSource}`);
    console.log(`   Размер: ${bestSize} символов`);
    console.log(`   Тип геометрии: ${bestSwitzerland.geometry.type}`);
    
    // Загружаем данные 2000 года
    const world2000 = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
    
    // Находим и заменяем Швейцарию
    const switzerlandIndex = world2000.features.findIndex(f => 
      (f.properties.NAME || '').toLowerCase().includes('switzerland')
    );
    
    if (switzerlandIndex !== -1) {
      console.log('\n🔧 ЗАМЕНА ГЕОМЕТРИИ:');
      console.log(`   Старый размер: ${JSON.stringify(world2000.features[switzerlandIndex].geometry).length} символов`);
      
      // Сохраняем свойства, заменяем только геометрию
      world2000.features[switzerlandIndex].geometry = bestSwitzerland.geometry;
      
      console.log(`   Новый размер: ${JSON.stringify(world2000.features[switzerlandIndex].geometry).length} символов`);
      
      // Сохраняем
      fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(world2000, null, 2));
      console.log('   ✅ Данные сохранены');
      
      // Проверяем результат
      console.log('\n🔍 ПРОВЕРКА РЕЗУЛЬТАТА:');
      const updatedWorld = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
      const updatedSwitzerland = updatedWorld.features.find(f => 
        (f.properties.NAME || '').toLowerCase().includes('switzerland')
      );
      
      if (updatedSwitzerland) {
        console.log('✅ Швейцария обновлена');
        console.log(`   Размер геометрии: ${JSON.stringify(updatedSwitzerland.geometry).length} символов`);
        console.log(`   Тип геометрии: ${updatedSwitzerland.geometry.type}`);
        
        // Проверяем координаты
        let firstCoord;
        if (updatedSwitzerland.geometry.type === 'Polygon') {
          firstCoord = updatedSwitzerland.geometry.coordinates[0][0];
        } else if (updatedSwitzerland.geometry.type === 'MultiPolygon') {
          firstCoord = updatedSwitzerland.geometry.coordinates[0][0][0];
        }
        
        if (firstCoord) {
          console.log(`   Первая координата: [${firstCoord[0]}, ${firstCoord[1]}]`);
          
          // Проверяем, что координаты в пределах Швейцарии
          const lon = firstCoord[0];
          const lat = firstCoord[1];
          
          if (lon >= 5.9 && lon <= 10.5 && lat >= 45.8 && lat <= 47.8) {
            console.log(`   ✅ Координаты корректны для Швейцарии`);
          } else {
            console.log(`   ⚠️ Координаты могут быть некорректными для Швейцарии`);
          }
        }
      } else {
        console.log('❌ Швейцария не найдена после обновления');
      }
      
    } else {
      console.log('❌ Швейцария не найдена в данных 2000 года');
    }
    
  } else {
    console.log('\n❌ Не найдено подходящей детальной геометрии Швейцарии');
    console.log(`   Лучший размер: ${bestSize} символов`);
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Поиск детальной геометрии завершен!');