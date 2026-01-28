const fs = require('fs');

console.log('🔧 Исправление крошечных территорий в данных 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Исходное количество территорий: ${worldData.features.length}`);
  
  // Функция для получения полноценной геометрии из других лет
  function getFullGeometry(countryNames, years = ['2010', '1994', '1960', '1945']) {
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
            // Выбираем самую большую геометрию
            const bestFeature = features.reduce((best, current) => {
              const bestSize = JSON.stringify(best.geometry).length;
              const currentSize = JSON.stringify(current.geometry).length;
              return currentSize > bestSize ? current : best;
            });
            
            const coordsStr = JSON.stringify(bestFeature.geometry.coordinates);
            console.log(`✅ Найдена полная геометрия для ${countryName} в ${year}: ${coordsStr.length} символов`);
            return bestFeature;
          }
        }
      } catch (e) {
        // Файл не найден
      }
    }
    return null;
  }
  
  let fixedCount = 0;
  
  // Исправляем Швейцарию
  console.log('\n🇨🇭 Исправление Швейцарии...');
  const switzerlandIndex = worldData.features.findIndex(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (switzerlandIndex !== -1) {
    const currentSize = JSON.stringify(worldData.features[switzerlandIndex].geometry).length;
    console.log(`Текущий размер геометрии: ${currentSize} символов`);
    
    if (currentSize < 1000) {
      const fullSwitzerland = getFullGeometry(['switzerland']);
      if (fullSwitzerland) {
        worldData.features[switzerlandIndex] = {
          type: 'Feature',
          properties: {
            NAME: 'Switzerland',
            ABBREVN: 'Switzerland',
            SUBJECTO: 'Switzerland',
            BORDERPRECISION: 3,
            PARTOF: 'Switzerland'
          },
          geometry: fullSwitzerland.geometry
        };
        fixedCount++;
        console.log('✅ Швейцария исправлена с полной геометрией');
      } else {
        console.log('❌ Не удалось найти полную геометрию Швейцарии');
      }
    } else {
      console.log('✅ Геометрия Швейцарии уже достаточно большая');
    }
  }
  
  // Проверяем и исправляем другие подозрительно маленькие территории
  console.log('\n🔍 Поиск других проблемных территорий...');
  
  const problematicCountries = [
    { name: 'Italy', threshold: 200 },
    { name: 'United States', threshold: 1000 }
  ];
  
  problematicCountries.forEach(country => {
    const features = worldData.features.filter(f => 
      (f.properties.NAME || '').toLowerCase().includes(country.name.toLowerCase())
    );
    
    features.forEach((feature, index) => {
      const currentSize = JSON.stringify(feature.geometry).length;
      if (currentSize < country.threshold) {
        console.log(`⚠️  ${country.name} (объект ${index + 1}): ${currentSize} символов - слишком мало`);
        
        const fullGeometry = getFullGeometry([country.name.toLowerCase()]);
        if (fullGeometry && JSON.stringify(fullGeometry.geometry).length > currentSize) {
          const featureIndex = worldData.features.indexOf(feature);
          worldData.features[featureIndex].geometry = fullGeometry.geometry;
          fixedCount++;
          console.log(`✅ ${country.name} исправлена`);
        }
      }
    });
  });
  
  // Дополнительная проверка: убеждаемся, что у нас есть все основные европейские страны
  console.log('\n🌍 Проверка основных европейских стран...');
  
  const europeanCountries = [
    'Germany', 'France', 'United Kingdom', 'Spain', 'Italy', 
    'Poland', 'Netherlands', 'Belgium', 'Austria', 'Czech Republic',
    'Hungary', 'Portugal', 'Sweden', 'Finland', 'Romania'
  ];
  
  europeanCountries.forEach(countryName => {
    const exists = worldData.features.some(f => 
      (f.properties.NAME || '').toLowerCase().includes(countryName.toLowerCase())
    );
    
    if (!exists) {
      console.log(`❌ ${countryName} отсутствует, добавляем...`);
      
      const fullCountry = getFullGeometry([countryName.toLowerCase()]);
      if (fullCountry) {
        const newFeature = {
          type: 'Feature',
          properties: {
            NAME: countryName,
            ABBREVN: countryName,
            SUBJECTO: countryName,
            BORDERPRECISION: 3,
            PARTOF: countryName
          },
          geometry: fullCountry.geometry
        };
        worldData.features.push(newFeature);
        fixedCount++;
        console.log(`✅ ${countryName} добавлена`);
      }
    } else {
      console.log(`✅ ${countryName} присутствует`);
    }
  });
  
  // Сохраняем исправленные данные
  if (fixedCount > 0) {
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log(`\n🎉 ИСПРАВЛЕНО: ${fixedCount} территорий`);
    console.log(`📊 Итоговое количество территорий: ${worldData.features.length}`);
    
    // Финальная проверка размеров
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА РАЗМЕРОВ:');
    const targetCountries = ['Switzerland', 'Russia', 'Norway', 'Denmark', 'Greenland'];
    
    targetCountries.forEach(countryName => {
      const country = worldData.features.find(f => 
        (f.properties.NAME || '').toLowerCase().includes(countryName.toLowerCase())
      );
      
      if (country) {
        const size = JSON.stringify(country.geometry).length;
        const status = size > 1000 ? '✅' : '⚠️';
        console.log(`${status} ${countryName}: ${size} символов`);
      } else {
        console.log(`❌ ${countryName}: НЕ НАЙДЕНА`);
      }
    });
    
  } else {
    console.log('\n📝 Исправления не требуются');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Исправление завершено!');