const fs = require('fs');

console.log('🗺️ Исправление СССР 1938 - убираем Турцию, добавляем Чукотку...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  // Находим все части СССР в мировых данных
  const ussrParts = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    return subjecto.includes('ussr');
  });
  
  console.log(`Анализ ${ussrParts.length} частей СССР:`);
  
  const validParts = [];
  
  ussrParts.forEach((part, i) => {
    const coords = part.geometry.coordinates.flat(2);
    const minLat = Math.min(...coords.map(c => c[1]));
    const maxLat = Math.max(...coords.map(c => c[1]));
    const minLon = Math.min(...coords.map(c => c[0]));
    const maxLon = Math.max(...coords.map(c => c[0]));
    
    console.log(`  Часть ${i+1}: ${part.properties.PARTOF}`);
    console.log(`    Координат: ${coords.length}`);
    console.log(`    Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
    console.log(`    Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
    
    // Определяем регион
    if (minLat < 36) {
      console.log(`    ❌ ИСКЛЮЧАЕМ: заходит в Турцию (${minLat.toFixed(1)}°)`);
    } else if (maxLon > 150 || minLon < -150) {
      console.log(`    ✅ ВКЛЮЧАЕМ: Дальний Восток/Чукотка`);
      validParts.push(part);
    } else if (maxLon > 60) {
      console.log(`    ✅ ВКЛЮЧАЕМ: Сибирь`);
      validParts.push(part);
    } else {
      console.log(`    ✅ ВКЛЮЧАЕМ: Европейская Россия`);
      validParts.push(part);
    }
  });
  
  console.log(`\nОтобрано ${validParts.length} корректных частей СССР`);
  
  // Если нет частей с Дальним Востоком, попробуем найти в других годах
  const hasChukotka = validParts.some(part => {
    const coords = part.geometry.coordinates.flat(2);
    return coords.some(c => c[0] > 170 || c[0] < -170);
  });
  
  if (!hasChukotka) {
    console.log('\n🔍 Чукотка не найдена, ищем в других годах...');
    
    const years = ['1914', '1920', '1930'];
    for (const year of years) {
      try {
        const otherWorldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        const otherUSSR = otherWorldData.features.filter(f => {
          const subj = (f.properties.SUBJECTO || '').toLowerCase();
          return subj.includes('ussr') || subj.includes('russia');
        });
        
        for (const part of otherUSSR) {
          const coords = part.geometry.coordinates.flat(2);
          const hasChukotkaCoords = coords.some(c => c[0] > 170 || c[0] < -170);
          
          if (hasChukotkaCoords) {
            console.log(`✅ Найдена Чукотка в данных ${year}`);
            validParts.push(part);
            break;
          }
        }
        
        if (hasChukotka) break;
      } catch (e) {
        // Файл не найден
      }
    }
  }
  
  if (validParts.length > 0) {
    // Объединяем корректные части
    const allCoordinates = [];
    validParts.forEach(part => {
      if (part.geometry.type === 'MultiPolygon') {
        allCoordinates.push(...part.geometry.coordinates);
      } else if (part.geometry.type === 'Polygon') {
        allCoordinates.push(part.geometry.coordinates);
      }
    });
    
    // Обновляем СССР в европейской карте
    const ussrIndex = europeData.features.findIndex(f => 
      f.properties.name.toLowerCase().includes('ссср') ||
      f.properties.name.toLowerCase().includes('ussr')
    );
    
    if (ussrIndex !== -1) {
      europeData.features[ussrIndex].geometry = {
        type: 'MultiPolygon',
        coordinates: allCoordinates
      };
      
      // Сохраняем
      fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
      
      console.log('\n✅ СССР исправлен');
      
      // Проверяем результат
      const totalCoords = allCoordinates.flat(2);
      const minLat = Math.min(...totalCoords.map(c => c[1]));
      const maxLon = Math.max(...totalCoords.map(c => c[0]));
      const minLon = Math.min(...totalCoords.map(c => c[0]));
      
      console.log(`📊 Всего координат: ${totalCoords.length}`);
      console.log(`📏 Широта: ${minLat.toFixed(1)}° - не заходит в Турцию: ${minLat >= 36 ? '✅' : '❌'}`);
      console.log(`📏 Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
      
      // Проверяем Чукотку
      const chukotkaCoords = totalCoords.filter(c => c[0] > 170 || c[0] < -170);
      console.log(`🌊 Чукотка/Берингов пролив: ${chukotkaCoords.length} точек ${chukotkaCoords.length > 0 ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ СССР не найден в европейской карте');
    }
  } else {
    console.log('❌ Корректные части СССР не найдены');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Исправление СССР завершено!');