import fs from 'fs';

console.log('🔧 Исправление границ СССР в карте 1945 года...\n');

try {
  // Загружаем мировые данные 1945
  const worldData1945 = JSON.parse(fs.readFileSync('public/data/historical/world_1945.geojson', 'utf8'));
  
  // Загружаем европейскую карту 1945
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  console.log('Анализ территорий СССР в мировых данных...');
  
  // Находим все территории СССР в мировых данных 1945
  const ussrTerritories1945 = worldData1945.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    return subjecto === 'ussr';
  });
  
  console.log('Найденные территории СССР:');
  ussrTerritories1945.forEach(t => {
    console.log(`- ${t.properties.NAME} (${t.properties.PARTOF})`);
  });
  
  // Исключаем зоны оккупации и спорные территории
  const properUSSRTerritories = ussrTerritories1945.filter(f => {
    const name = f.properties.NAME.toLowerCase();
    const partof = f.properties.PARTOF.toLowerCase();
    
    // Исключаем зоны оккупации в Германии и Корее
    if (name.includes('germany') || name.includes('korea')) {
      console.log(`❌ Исключаем зону оккупации: ${f.properties.NAME}`);
      return false;
    }
    
    // Оставляем только основную территорию СССР
    if (name === 'ussr' || partof === 'ussr') {
      console.log(`✅ Включаем территорию СССР: ${f.properties.NAME}`);
      return true;
    }
    
    return false;
  });
  
  console.log(`\nОтобрано территорий для СССР: ${properUSSRTerritories.length}`);
  
  // Если основной территории СССР нет, попробуем взять из других лет
  if (properUSSRTerritories.length === 0) {
    console.log('Основная территория СССР не найдена, ищем в других годах...');
    
    const years = ['1938', '1930'];
    for (const year of years) {
      try {
        const otherData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        const ussrInOther = otherData.features.filter(f => {
          const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
          const name = f.properties.NAME.toLowerCase();
          return subjecto === 'ussr' && name === 'ussr';
        });
        
        if (ussrInOther.length > 0) {
          properUSSRTerritories.push(...ussrInOther);
          console.log(`✅ Найдена основная территория СССР в ${year}`);
          break;
        }
      } catch (e) {
        console.log(`Файл ${year} не найден`);
      }
    }
  }
  
  if (properUSSRTerritories.length > 0) {
    // Удаляем существующий СССР из карты
    const existingUSSRIndex = europeData.features.findIndex(f => 
      f.properties.name === 'СССР' || 
      f.properties.originalName === 'USSR' ||
      f.properties.name === 'USSR'
    );
    
    if (existingUSSRIndex !== -1) {
      europeData.features.splice(existingUSSRIndex, 1);
      console.log('Удален существующий СССР из карты');
    }
    
    // Собираем координаты только основной территории СССР
    const ussrCoordinates = [];
    properUSSRTerritories.forEach(territory => {
      if (territory.geometry && territory.geometry.coordinates) {
        if (territory.geometry.type === 'MultiPolygon') {
          ussrCoordinates.push(...territory.geometry.coordinates);
        } else if (territory.geometry.type === 'Polygon') {
          ussrCoordinates.push(territory.geometry.coordinates);
        }
      }
    });
    
    console.log(`Собрано ${ussrCoordinates.length} полигонов для основной территории СССР`);
    
    // Создаем новую территорию СССР с правильными границами
    const ussrFeature = {
      type: 'Feature',
      properties: {
        name: 'СССР',
        originalName: 'USSR',
        ruler: 'Иосиф Сталин',
        capital: 'Москва',
        government: 'Советская социалистическая республика',
        description: 'Союз Советских Социалистических Республик - победитель во Второй мировой войне, новая сверхдержава',
        year: 1945,
        period: 'Послевоенный период',
        color: '#dd3cdf'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: ussrCoordinates
      }
    };
    
    // Добавляем СССР в карту
    europeData.features.push(ussrFeature);
    console.log('✅ СССР добавлен в карту с исправленными границами');
    
    // Теперь добавим зоны оккупации как отдельные территории
    const occupationZones = ussrTerritories1945.filter(f => {
      const name = f.properties.NAME.toLowerCase();
      return name.includes('germany') || name.includes('korea');
    });
    
    occupationZones.forEach(zone => {
      const zoneName = zone.properties.NAME;
      let displayName, description;
      
      if (zoneName.includes('Germany')) {
        displayName = 'Германия (советская зона)';
        description = 'Советская зона оккупации Германии';
      } else if (zoneName.includes('Korea')) {
        displayName = 'Корея (советская зона)';
        description = 'Советская зона оккупации Кореи';
      }
      
      const zoneFeature = {
        type: 'Feature',
        properties: {
          name: displayName,
          originalName: zoneName,
          ruler: 'Советская военная администрация',
          capital: zoneName.includes('Germany') ? 'Берлин (советский сектор)' : 'Пхеньян',
          government: 'Военная оккупация',
          description: description,
          year: 1945,
          period: 'Послевоенный период',
          color: '#aa2a7f' // Более темный оттенок для зон оккупации
        },
        geometry: zone.geometry
      };
      
      europeData.features.push(zoneFeature);
      console.log(`✅ Добавлена зона оккупации: ${displayName}`);
    });
    
    // Сохраняем обновленную карту
    fs.writeFileSync('public/data/maps/europe_1945.json', JSON.stringify(europeData, null, 2));
    
    console.log('\n✅ Карта 1945 года обновлена с правильными границами СССР!');
    console.log(`📊 Всего территорий: ${europeData.features.length}`);
    
    // Проверяем результат
    const ussrInMap = europeData.features.find(f => f.properties.name === 'СССР');
    if (ussrInMap) {
      console.log('\n✅ Проверка: СССР найден в карте');
      console.log(`   Полигонов: ${ussrInMap.geometry.coordinates.length}`);
    }
    
    const occupationZonesInMap = europeData.features.filter(f => 
      f.properties.name.includes('советская зона')
    );
    console.log(`   Зон оккупации: ${occupationZonesInMap.length}`);
    
  } else {
    console.log('❌ Не найдено подходящих территорий СССР');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Исправление границ СССР завершено!');