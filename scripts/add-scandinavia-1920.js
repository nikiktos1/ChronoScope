const fs = require('fs');

console.log('🇩🇰🇳🇴 Добавление Дании и Норвегии в карту 1920 года...\n');

try {
  // Загружаем мировые данные 1920
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1920.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1920.json', 'utf8'));
  
  console.log('Поиск скандинавских стран в мировых данных...');
  
  // Ищем Норвегию
  const norwayFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('norway') || name.includes('norway');
  });
  
  // Ищем Данию (может быть под разными названиями)
  const denmarkFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('denmark') || name.includes('denmark') ||
           subjecto.includes('danish') || name.includes('danish');
  });
  
  console.log(`Найдено частей Норвегии: ${norwayFeatures.length}`);
  console.log(`Найдено частей Дании: ${denmarkFeatures.length}`);
  
  // Если Дания не найдена, попробуем найти в других картах
  if (denmarkFeatures.length === 0) {
    console.log('Дания не найдена в мировых данных 1920, ищем в других годах...');
    
    try {
      const world1914 = JSON.parse(fs.readFileSync('public/data/historical/world_1914.geojson', 'utf8'));
      const denmarkFrom1914 = world1914.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        return subjecto.includes('denmark');
      });
      
      if (denmarkFrom1914.length > 0) {
        denmarkFeatures.push(...denmarkFrom1914);
        console.log(`Найдена Дания в данных 1914: ${denmarkFrom1914.length} частей`);
      }
    } catch (e) {
      console.log('Не удалось загрузить данные 1914 для Дании');
    }
  }
  
  // Добавляем Норвегию
  if (norwayFeatures.length > 0) {
    const norwayExists = europeData.features.some(f => 
      f.properties.name.toLowerCase().includes('норв') ||
      f.properties.name.toLowerCase().includes('norway')
    );
    
    if (!norwayExists) {
      const norwayCoordinates = [];
      norwayFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          norwayCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          norwayCoordinates.push(feature.geometry.coordinates);
        }
      });
      
      const norwayFeature = {
        type: 'Feature',
        properties: {
          name: 'Норвегия',
          originalName: 'Norway',
          ruler: 'Хокон VII',
          capital: 'Кристиания (Осло)',
          government: 'Конституционная монархия',
          description: 'Независимое королевство с 1905 года',
          year: 1920,
          period: 'Послевоенный период'
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: norwayCoordinates
        }
      };
      
      europeData.features.push(norwayFeature);
      console.log('✅ Норвегия добавлена');
    } else {
      console.log('ℹ️ Норвегия уже существует');
    }
  }
  
  // Добавляем Данию
  if (denmarkFeatures.length > 0) {
    const denmarkExists = europeData.features.some(f => 
      f.properties.name.toLowerCase().includes('дан') ||
      f.properties.name.toLowerCase().includes('denmark')
    );
    
    if (!denmarkExists) {
      const denmarkCoordinates = [];
      denmarkFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          denmarkCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          denmarkCoordinates.push(feature.geometry.coordinates);
        }
      });
      
      const denmarkFeature = {
        type: 'Feature',
        properties: {
          name: 'Дания',
          originalName: 'Denmark',
          ruler: 'Кристиан X',
          capital: 'Копенгаген',
          government: 'Конституционная монархия',
          description: 'Нейтральная скандинавская держава',
          year: 1920,
          period: 'Послевоенный период'
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: denmarkCoordinates
        }
      };
      
      europeData.features.push(denmarkFeature);
      console.log('✅ Дания добавлена');
    } else {
      console.log('ℹ️ Дания уже существует');
    }
  } else {
    console.log('❌ Дания не найдена ни в одном источнике');
  }
  
  // Сохраняем обновленную карту
  fs.writeFileSync('public/data/maps/europe_1920.json', JSON.stringify(europeData, null, 2));
  
  console.log('\n✅ Карта 1920 года обновлена!');
  console.log(`📊 Всего территорий: ${europeData.features.length}`);
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Добавление скандинавских стран завершено!');