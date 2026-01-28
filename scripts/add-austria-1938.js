const fs = require('fs');

console.log('🇦🇹 Добавление Австрии на карту 1938 года...\n');

try {
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Поиск Австрии в других годах...');
  
  // Пробуем найти Австрию в других годах
  const years = ['1920', '1930', '1914'];
  let austriaFeature = null;
  
  for (const year of years) {
    try {
      const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      const austriaFeatures = worldData.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const name = (f.properties.NAME || '').toLowerCase();
        return subjecto.includes('austria') || name.includes('austria');
      });
      
      if (austriaFeatures.length > 0) {
        austriaFeature = austriaFeatures[0]; // Берем первую найденную
        console.log(`✅ Австрия найдена в данных ${year}: ${austriaFeature.properties.SUBJECTO || austriaFeature.properties.NAME}`);
        break;
      }
    } catch (e) {
      console.log(`⚠️ Не удалось загрузить данные ${year}`);
    }
  }
  
  // Если не найдена, попробуем европейские карты
  if (!austriaFeature) {
    console.log('Поиск Австрии в европейских картах...');
    
    for (const year of years) {
      try {
        const europeOtherYear = JSON.parse(fs.readFileSync(`public/data/maps/europe_${year}.json`, 'utf8'));
        
        const austria = europeOtherYear.features.find(f => {
          const name = f.properties.name.toLowerCase();
          return name.includes('австр') || name.includes('austria');
        });
        
        if (austria) {
          austriaFeature = austria;
          console.log(`✅ Австрия найдена в европейской карте ${year}: ${austria.properties.name}`);
          break;
        }
      } catch (e) {
        // Файл не найден
      }
    }
  }
  
  if (austriaFeature) {
    // Создаем новую Австрию для 1938 года
    const newAustria = {
      type: 'Feature',
      properties: {
        name: 'Австрия',
        originalName: austriaFeature.properties.SUBJECTO || austriaFeature.properties.name || 'Austria',
        ruler: 'Курт Шушниг (до аншлюса)',
        capital: 'Вена',
        government: 'Федеративная республика',
        description: 'Аннексирована Германией в марте 1938 (Аншлюс)',
        year: 1938,
        period: 'Накануне Второй мировой войны'
      },
      geometry: austriaFeature.geometry
    };
    
    // Добавляем Австрию
    europeData.features.push(newAustria);
    
    // Сохраняем
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
    
    console.log('✅ Австрия добавлена на карту 1938 года');
    console.log(`📊 Всего территорий: ${europeData.features.length}`);
    
    console.log('\n📜 Историческая справка:');
    console.log('   12 марта 1938 - Аншлюс (аннексия Австрии Германией)');
    console.log('   Австрия перестала существовать как независимое государство');
    console.log('   Стала частью Третьего рейха под названием "Остмарк"');
    
  } else {
    console.log('❌ Австрия не найдена ни в одном источнике');
    console.log('💡 Возможно, нужно создать Австрию вручную или расширить Германию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Добавление Австрии завершено!');