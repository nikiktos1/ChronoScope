const fs = require('fs');

console.log('🚀 Принудительное добавление отсутствующих стран в 2000 год...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Функция для поиска стран в других годах
  function findCountryInMultipleYears(countryNames, years = ['2010', '1994', '1960', '1945', '1938', '1930']) {
    for (const year of years) {
      try {
        const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        
        for (const countryName of countryNames) {
          const features = otherYearData.features.filter(f => {
            const name = (f.properties.NAME || '').toLowerCase();
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
            
            return name.includes(countryName.toLowerCase()) || 
                   subjecto.includes(countryName.toLowerCase()) ||
                   abbrevn.includes(countryName.toLowerCase());
          });
          
          if (features.length > 0) {
            console.log(`✅ ${countryName} найдена в ${year}: ${features.length} объект(ов)`);
            return { features, year };
          }
        }
      } catch (e) {
        // Файл не найден
      }
    }
    return null;
  }
  
  // Проверяем, есть ли страна уже в данных
  function countryExists(countryNames) {
    return worldData.features.some(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      
      return countryNames.some(countryName => 
        name.includes(countryName.toLowerCase()) || 
        subjecto.includes(countryName.toLowerCase())
      );
    });
  }
  
  let addedCount = 0;
  
  // Список стран для добавления
  const countriesToAdd = [
    {
      names: ['russia', 'russian federation'],
      displayName: 'Russia',
      label: '🇷🇺 Россия'
    },
    {
      names: ['switzerland'],
      displayName: 'Switzerland', 
      label: '🇨🇭 Швейцария'
    },
    {
      names: ['norway'],
      displayName: 'Norway',
      label: '🇳🇴 Норвегия'
    },
    {
      names: ['denmark'],
      displayName: 'Denmark',
      label: '🇩🇰 Дания'
    },
    {
      names: ['greenland'],
      displayName: 'Greenland',
      label: '🇬🇱 Гренландия'
    }
  ];
  
  // Добавляем каждую страну
  for (const country of countriesToAdd) {
    console.log(`\n${country.label} - проверка...`);
    
    if (countryExists(country.names)) {
      console.log(`✅ ${country.label} уже существует`);
      continue;
    }
    
    console.log(`❌ ${country.label} отсутствует, ищем в других годах...`);
    
    const foundData = findCountryInMultipleYears(country.names);
    if (foundData && foundData.features.length > 0) {
      // Добавляем все найденные объекты этой страны
      foundData.features.forEach((feature, index) => {
        const newFeature = {
          type: 'Feature',
          properties: {
            NAME: feature.properties.NAME || country.displayName,
            ABBREVN: feature.properties.ABBREVN || country.displayName,
            SUBJECTO: feature.properties.SUBJECTO || country.displayName,
            BORDERPRECISION: feature.properties.BORDERPRECISION || 3,
            PARTOF: feature.properties.PARTOF || country.displayName
          },
          geometry: feature.geometry
        };
        
        worldData.features.push(newFeature);
        addedCount++;
        
        const suffix = foundData.features.length > 1 ? ` (часть ${index + 1})` : '';
        console.log(`✅ ${country.label}${suffix} добавлена из ${foundData.year}`);
      });
    } else {
      console.log(`❌ ${country.label} не найдена ни в одном году`);
    }
  }
  
  // Также попробуем добавить другие важные страны, которые могут отсутствовать
  const additionalCountries = [
    { names: ['sweden'], displayName: 'Sweden', label: '🇸🇪 Швеция' },
    { names: ['finland'], displayName: 'Finland', label: '🇫🇮 Финляндия' },
    { names: ['poland'], displayName: 'Poland', label: '🇵🇱 Польша' },
    { names: ['ukraine'], displayName: 'Ukraine', label: '🇺🇦 Украина' },
    { names: ['belarus', 'byelarus'], displayName: 'Belarus', label: '🇧🇾 Беларусь' },
    { names: ['kazakhstan'], displayName: 'Kazakhstan', label: '🇰🇿 Казахстан' }
  ];
  
  console.log('\n📋 Проверка дополнительных важных стран...');
  
  for (const country of additionalCountries) {
    if (!countryExists(country.names)) {
      console.log(`❌ ${country.label} отсутствует, добавляем...`);
      
      const foundData = findCountryInMultipleYears(country.names);
      if (foundData && foundData.features.length > 0) {
        foundData.features.forEach(feature => {
          const newFeature = {
            type: 'Feature',
            properties: {
              NAME: feature.properties.NAME || country.displayName,
              ABBREVN: feature.properties.ABBREVN || country.displayName,
              SUBJECTO: feature.properties.SUBJECTO || country.displayName,
              BORDERPRECISION: feature.properties.BORDERPRECISION || 3,
              PARTOF: feature.properties.PARTOF || country.displayName
            },
            geometry: feature.geometry
          };
          
          worldData.features.push(newFeature);
          addedCount++;
        });
        console.log(`✅ ${country.label} добавлена из ${foundData.year}`);
      }
    } else {
      console.log(`✅ ${country.label} уже существует`);
    }
  }
  
  // Сохраняем обновленные данные
  if (addedCount > 0) {
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log(`\n🎉 УСПЕШНО ДОБАВЛЕНО: ${addedCount} объектов`);
    console.log(`📊 Общее количество территорий: ${worldData.features.length}`);
    
    // Финальная проверка
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
    countriesToAdd.forEach(country => {
      const exists = countryExists(country.names);
      console.log(`${exists ? '✅' : '❌'} ${country.label}: ${exists ? 'НАЙДЕНА' : 'НЕ НАЙДЕНА'}`);
    });
    
  } else {
    console.log('\n📝 Все страны уже присутствуют в данных');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Принудительное добавление завершено!');