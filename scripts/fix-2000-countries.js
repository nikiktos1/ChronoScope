const fs = require('fs');

console.log('🔧 Исправление проблем со странами в данных 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Исходное количество территорий: ${worldData.features.length}`);
  
  // Функция для получения лучших данных из других лет
  function getBetterCountryData(countryNames, years = ['2010', '1994', '1960']) {
    for (const year of years) {
      try {
        const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        
        for (const countryName of countryNames) {
          const features = otherYearData.features.filter(f => {
            const name = (f.properties.NAME || '').toLowerCase();
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            
            return name.includes(countryName.toLowerCase()) || 
                   subjecto.includes(countryName.toLowerCase());
          });
          
          if (features.length > 0) {
            // Выбираем самую большую геометрию (больше координат = более детальная)
            const bestFeature = features.reduce((best, current) => {
              const bestSize = JSON.stringify(best.geometry).length;
              const currentSize = JSON.stringify(current.geometry).length;
              return currentSize > bestSize ? current : best;
            });
            
            console.log(`✅ Найдены лучшие данные для ${countryName} в ${year}: ${JSON.stringify(bestFeature.geometry).length} символов`);
            return bestFeature;
          }
        }
      } catch (e) {
        // Файл не найден или ошибка чтения
      }
    }
    return null;
  }
  
  let changesCount = 0;
  
  // 1. Исправляем Швейцарию (слишком маленькая геометрия)
  console.log('\n🇨🇭 Исправление Швейцарии...');
  const switzerlandIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (switzerlandIndex !== -1) {
    const currentSize = JSON.stringify(worldData.features[switzerlandIndex].geometry).length;
    console.log(`Текущий размер геометрии Швейцарии: ${currentSize} символов`);
    
    if (currentSize < 1000) { // Если геометрия слишком маленькая
      const betterSwitzerland = getBetterCountryData(['switzerland']);
      if (betterSwitzerland) {
        worldData.features[switzerlandIndex] = {
          type: 'Feature',
          properties: {
            NAME: 'Switzerland',
            ABBREVN: 'Switzerland',
            SUBJECTO: 'Switzerland',
            BORDERPRECISION: 3,
            PARTOF: 'Switzerland'
          },
          geometry: betterSwitzerland.geometry
        };
        changesCount++;
        console.log('✅ Швейцария обновлена с более детальной геометрией');
      }
    } else {
      console.log('✅ Геометрия Швейцарии достаточно детальная');
    }
  }
  
  // 2. Исправляем дублирование России
  console.log('\n🇷🇺 Исправление дублирования России...');
  const russiaFeatures = worldData.features.filter(f => 
    (f.properties.NAME || '').toLowerCase().includes('russia')
  );
  
  console.log(`Найдено объектов России: ${russiaFeatures.length}`);
  
  if (russiaFeatures.length > 1) {
    // Удаляем все объекты России
    worldData.features = worldData.features.filter(f => 
      !(f.properties.NAME || '').toLowerCase().includes('russia')
    );
    
    // Получаем лучшие данные России
    const betterRussia = getBetterCountryData(['russia', 'russian federation']);
    if (betterRussia) {
      const newRussia = {
        type: 'Feature',
        properties: {
          NAME: 'Russia',
          ABBREVN: 'Russia',
          SUBJECTO: 'Russia',
          BORDERPRECISION: 3,
          PARTOF: 'Russia'
        },
        geometry: betterRussia.geometry
      };
      worldData.features.push(newRussia);
      changesCount++;
      console.log('✅ Россия заменена единым объектом с лучшей геометрией');
    } else {
      // Если не нашли лучшие данные, оставляем самый большой из существующих
      const bestRussia = russiaFeatures.reduce((best, current) => {
        const bestSize = JSON.stringify(best.geometry).length;
        const currentSize = JSON.stringify(current.geometry).length;
        return currentSize > bestSize ? current : best;
      });
      worldData.features.push(bestRussia);
      console.log('✅ Оставлен самый детальный объект России');
    }
  }
  
  // 3. Проверяем и улучшаем Норвегию
  console.log('\n🇳🇴 Проверка Норвегии...');
  const norwayIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').toLowerCase().includes('norway')
  );
  
  if (norwayIndex !== -1) {
    const currentSize = JSON.stringify(worldData.features[norwayIndex].geometry).length;
    console.log(`Размер геометрии Норвегии: ${currentSize} символов`);
    
    if (currentSize < 10000) { // Если геометрия недостаточно детальная
      const betterNorway = getBetterCountryData(['norway']);
      if (betterNorway && JSON.stringify(betterNorway.geometry).length > currentSize) {
        worldData.features[norwayIndex] = {
          type: 'Feature',
          properties: {
            NAME: 'Norway',
            ABBREVN: 'Norway',
            SUBJECTO: 'Norway',
            BORDERPRECISION: 3,
            PARTOF: 'Norway'
          },
          geometry: betterNorway.geometry
        };
        changesCount++;
        console.log('✅ Норвегия обновлена с более детальной геометрией');
      } else {
        console.log('✅ Геометрия Норвегии достаточно хорошая');
      }
    } else {
      console.log('✅ Геометрия Норвегии достаточно детальная');
    }
  }
  
  // 4. Проверяем Данию и Гренландию
  console.log('\n🇩🇰 Проверка Дании и Гренландии...');
  const denmarkIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').toLowerCase().includes('denmark')
  );
  const greenlandIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').toLowerCase().includes('greenland')
  );
  
  if (denmarkIndex !== -1) {
    console.log(`✅ Дания найдена, размер геометрии: ${JSON.stringify(worldData.features[denmarkIndex].geometry).length} символов`);
  }
  
  if (greenlandIndex !== -1) {
    console.log(`✅ Гренландия найдена, размер геометрии: ${JSON.stringify(worldData.features[greenlandIndex].geometry).length} символов`);
  }
  
  // Сохраняем обновленные данные
  if (changesCount > 0) {
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log(`\n✅ Внесено изменений: ${changesCount}`);
    console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
  } else {
    console.log('\n📝 Изменения не требуются, все данные корректны');
  }
  
  // Финальная проверка
  console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
  const finalCheck = ['switzerland', 'norway', 'denmark', 'greenland', 'russia'];
  finalCheck.forEach(country => {
    const found = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes(country)
    );
    if (found) {
      console.log(`✅ ${country.toUpperCase()}: ${found.properties.NAME} (${JSON.stringify(found.geometry).length} символов)`);
    } else {
      console.log(`❌ ${country.toUpperCase()}: НЕ НАЙДЕНА`);
    }
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Исправление завершено!');