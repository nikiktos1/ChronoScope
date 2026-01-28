const fs = require('fs');

console.log('🇳🇴 Исправление названия Норвегии для 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Ищем объект "Sweden–Norway"
  console.log('\n🔍 Поиск объекта "Sweden–Norway"...');
  const swedenNorwayIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').includes('Sweden–Norway') ||
    (f.properties.SUBJECTO || '').includes('Sweden–Norway')
  );
  
  if (swedenNorwayIndex !== -1) {
    const swedenNorway = worldData.features[swedenNorwayIndex];
    console.log(`✅ Найден объект: ${swedenNorway.properties.NAME}`);
    console.log(`   Размер геометрии: ${JSON.stringify(swedenNorway.geometry).length} символов`);
    
    // Удаляем объект "Sweden–Norway"
    worldData.features.splice(swedenNorwayIndex, 1);
    console.log('🗑️ Объект "Sweden–Norway" удален');
    
    // Теперь нам нужно найти отдельные Норвегию и Швецию
    console.log('\n🔍 Поиск отдельных Норвегии и Швеции...');
    
    // Ищем современную Норвегию (без Швеции)
    const years = ['2010', '1994', '1960', '1945'];
    let modernNorway = null;
    let modernSweden = null;
    
    for (const year of years) {
      try {
        const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        
        // Ищем Норвегию
        if (!modernNorway) {
          const norwayFeatures = otherYearData.features.filter(f => {
            const name = (f.properties.NAME || '').toLowerCase();
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            
            return (name === 'norway' || subjecto === 'norway') && 
                   !name.includes('sweden') && !subjecto.includes('sweden');
          });
          
          if (norwayFeatures.length > 0) {
            modernNorway = norwayFeatures[0];
            console.log(`✅ Найдена отдельная Норвегия в ${year}: ${JSON.stringify(modernNorway.geometry).length} символов`);
          }
        }
        
        // Ищем Швецию
        if (!modernSweden) {
          const swedenFeatures = otherYearData.features.filter(f => {
            const name = (f.properties.NAME || '').toLowerCase();
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            
            return (name === 'sweden' || subjecto === 'sweden') && 
                   !name.includes('norway') && !subjecto.includes('norway');
          });
          
          if (swedenFeatures.length > 0) {
            modernSweden = swedenFeatures[0];
            console.log(`✅ Найдена отдельная Швеция в ${year}: ${JSON.stringify(modernSweden.geometry).length} символов`);
          }
        }
        
        if (modernNorway && modernSweden) break;
        
      } catch (e) {
        // Файл не найден
      }
    }
    
    // Добавляем отдельные страны
    if (modernNorway) {
      const norwayFeature = {
        type: 'Feature',
        properties: {
          NAME: 'Norway',
          ABBREVN: 'Norway',
          SUBJECTO: 'Norway',
          BORDERPRECISION: 3,
          PARTOF: 'Norway'
        },
        geometry: modernNorway.geometry
      };
      worldData.features.push(norwayFeature);
      console.log('✅ Норвегия добавлена как отдельная страна');
    } else {
      console.log('❌ Не удалось найти отдельную Норвегию');
    }
    
    // Проверяем, есть ли уже Швеция
    const existingSweden = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase() === 'sweden'
    );
    
    if (!existingSweden && modernSweden) {
      const swedenFeature = {
        type: 'Feature',
        properties: {
          NAME: 'Sweden',
          ABBREVN: 'Sweden',
          SUBJECTO: 'Sweden',
          BORDERPRECISION: 3,
          PARTOF: 'Sweden'
        },
        geometry: modernSweden.geometry
      };
      worldData.features.push(swedenFeature);
      console.log('✅ Швеция добавлена как отдельная страна');
    } else if (existingSweden) {
      console.log('✅ Швеция уже существует');
    } else {
      console.log('❌ Не удалось найти отдельную Швецию');
    }
    
  } else {
    console.log('❌ Объект "Sweden–Norway" не найден');
    
    // Проверяем, есть ли просто "Norway"
    const norwayFeature = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase() === 'norway'
    );
    
    if (norwayFeature) {
      console.log(`✅ Найдена обычная Норвегия: ${JSON.stringify(norwayFeature.geometry).length} символов`);
    } else {
      console.log('❌ Норвегия вообще не найдена');
    }
  }
  
  // Сохраняем изменения
  fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
  console.log(`\n💾 Файл сохранен`);
  console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
  
  // Финальная проверка
  console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
  
  const norway = worldData.features.find(f => 
    (f.properties.NAME || '').toLowerCase() === 'norway'
  );
  
  const sweden = worldData.features.find(f => 
    (f.properties.NAME || '').toLowerCase() === 'sweden'
  );
  
  if (norway) {
    console.log(`✅ Норвегия: ${norway.properties.NAME} (${JSON.stringify(norway.geometry).length} символов)`);
  } else {
    console.log(`❌ Норвегия не найдена`);
  }
  
  if (sweden) {
    console.log(`✅ Швеция: ${sweden.properties.NAME} (${JSON.stringify(sweden.geometry).length} символов)`);
  } else {
    console.log(`❌ Швеция не найдена`);
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Исправление названия завершено!');