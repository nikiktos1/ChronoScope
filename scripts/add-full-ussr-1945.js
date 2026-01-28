import fs from 'fs';

console.log('🇷🇺 Добавление полной территории СССР в карту 1945 года...\n');

try {
  // Загружаем мировые данные 1945
  const worldData1945 = JSON.parse(fs.readFileSync('public/data/historical/world_1945.geojson', 'utf8'));
  
  // Загружаем европейскую карту 1945
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  console.log('Поиск всех территорий СССР в 1945...');
  
  // Находим все территории СССР в мировых данных 1945
  const ussrTerritories1945 = worldData1945.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    return subjecto === 'ussr';
  });
  
  console.log(`Найдено территорий СССР в 1945: ${ussrTerritories1945.length}`);
  ussrTerritories1945.forEach(t => {
    console.log(`- ${t.properties.NAME}`);
  });
  
  // Если территорий мало, попробуем взять из 1938 года
  let ussrTerritories = [...ussrTerritories1945];
  
  if (ussrTerritories.length < 4) { // Если меньше 4 территорий, берем из 1938
    console.log('\nТерриторий СССР недостаточно, загружаем из 1938...');
    
    try {
      const worldData1938 = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
      const ussrTerritories1938 = worldData1938.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        return subjecto === 'ussr';
      });
      
      console.log(`Найдено территорий СССР в 1938: ${ussrTerritories1938.length}`);
      ussrTerritories1938.forEach(t => {
        console.log(`- ${t.properties.NAME}`);
      });
      
      // Добавляем территории из 1938, которых нет в 1945
      ussrTerritories1938.forEach(territory1938 => {
        const existsIn1945 = ussrTerritories.some(t => t.properties.NAME === territory1938.properties.NAME);
        if (!existsIn1945) {
          ussrTerritories.push(territory1938);
          console.log(`+ Добавлена территория из 1938: ${territory1938.properties.NAME}`);
        }
      });
      
    } catch (e) {
      console.log('Не удалось загрузить данные 1938 года');
    }
  }
  
  console.log(`\nИтого территорий СССР для добавления: ${ussrTerritories.length}`);
  
  if (ussrTerritories.length > 0) {
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
    
    // Собираем все координаты СССР
    const allCoordinates = [];
    ussrTerritories.forEach(territory => {
      if (territory.geometry && territory.geometry.coordinates) {
        if (territory.geometry.type === 'MultiPolygon') {
          allCoordinates.push(...territory.geometry.coordinates);
        } else if (territory.geometry.type === 'Polygon') {
          allCoordinates.push(territory.geometry.coordinates);
        }
      }
    });
    
    console.log(`Собрано ${allCoordinates.length} полигонов для СССР`);
    
    // Создаем новую территорию СССР
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
        coordinates: allCoordinates
      }
    };
    
    // Добавляем СССР в карту
    europeData.features.push(ussrFeature);
    console.log('✅ СССР добавлен в карту');
    
    // Сохраняем обновленную карту
    fs.writeFileSync('public/data/maps/europe_1945.json', JSON.stringify(europeData, null, 2));
    
    console.log('\n✅ Карта 1945 года обновлена с полной территорией СССР!');
    console.log(`📊 Всего территорий: ${europeData.features.length}`);
    
    // Проверяем, что СССР теперь есть в карте
    const ussrInMap = europeData.features.find(f => f.properties.name === 'СССР');
    if (ussrInMap) {
      console.log('\n✅ Проверка: СССР найден в карте');
      console.log(`   Полигонов: ${ussrInMap.geometry.coordinates.length}`);
      console.log(`   Правитель: ${ussrInMap.properties.ruler}`);
      console.log(`   Столица: ${ussrInMap.properties.capital}`);
    } else {
      console.log('\n❌ Проверка: СССР НЕ найден в карте');
    }
    
  } else {
    console.log('❌ Не найдено территорий СССР для добавления');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Добавление СССР завершено!');