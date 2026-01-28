const fs = require('fs');

console.log('🔍 Диагностика отображения Швейцарии в 2000 году...\n');

try {
  // Загружаем данные 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}`);
  
  // Ищем Швейцарию
  const switzerlandFeatures = worldData.features.filter(f => {
    const name = (f.properties.NAME || '').toLowerCase();
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
    
    return name.includes('switzerland') || 
           subjecto.includes('switzerland') ||
           abbrevn.includes('switzerland');
  });
  
  console.log(`\n🇨🇭 Найдено объектов Швейцарии: ${switzerlandFeatures.length}`);
  
  if (switzerlandFeatures.length === 0) {
    console.log('❌ Швейцария не найдена в данных!');
    return;
  }
  
  // Анализируем каждый объект Швейцарии
  switzerlandFeatures.forEach((feature, index) => {
    console.log(`\n📋 ШВЕЙЦАРИЯ #${index + 1}:`);
    console.log(`   Название: "${feature.properties.NAME}"`);
    console.log(`   SUBJECTO: "${feature.properties.SUBJECTO}"`);
    console.log(`   ABBREVN: "${feature.properties.ABBREVN}"`);
    console.log(`   PARTOF: "${feature.properties.PARTOF}"`);
    console.log(`   BORDERPRECISION: ${feature.properties.BORDERPRECISION}`);
    
    // Проверяем все свойства
    console.log('\n   🔍 ВСЕ СВОЙСТВА:');
    Object.keys(feature.properties).forEach(key => {
      console.log(`      ${key}: "${feature.properties[key]}"`);
    });
    
    // Проверяем геометрию
    console.log(`\n   📐 ГЕОМЕТРИЯ:`);
    console.log(`      Тип: ${feature.geometry.type}`);
    console.log(`      Размер: ${JSON.stringify(feature.geometry).length} символов`);
    
    if (feature.geometry.coordinates && feature.geometry.coordinates.length > 0) {
      const coords = feature.geometry.coordinates;
      let firstCoord;
      
      if (feature.geometry.type === 'Polygon') {
        firstCoord = coords[0][0];
      } else if (feature.geometry.type === 'MultiPolygon') {
        firstCoord = coords[0][0][0];
      }
      
      if (firstCoord) {
        console.log(`      Первая координата: [${firstCoord[0]}, ${firstCoord[1]}]`);
        
        // Проверяем, что координаты в разумных пределах для Швейцарии
        const lon = firstCoord[0];
        const lat = firstCoord[1];
        
        if (lon >= 5.9 && lon <= 10.5 && lat >= 45.8 && lat <= 47.8) {
          console.log(`      ✅ Координаты в пределах Швейцарии`);
        } else {
          console.log(`      ❌ Координаты вне пределов Швейцарии!`);
        }
      }
    }
  });
  
  // Сравниваем с другими странами
  console.log('\n🔍 СРАВНЕНИЕ С ДРУГИМИ СТРАНАМИ:');
  
  const sampleCountries = ['Germany', 'France', 'Austria', 'Italy'];
  
  sampleCountries.forEach(countryName => {
    const country = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes(countryName.toLowerCase())
    );
    
    if (country) {
      console.log(`\n   🏳️ ${countryName.toUpperCase()}:`);
      console.log(`      NAME: "${country.properties.NAME}"`);
      console.log(`      SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`      PARTOF: "${country.properties.PARTOF}"`);
      console.log(`      BORDERPRECISION: ${country.properties.BORDERPRECISION}`);
      
      // Проверяем уникальные свойства
      const uniqueProps = Object.keys(country.properties).filter(key => 
        !['NAME', 'SUBJECTO', 'ABBREVN', 'PARTOF', 'BORDERPRECISION'].includes(key)
      );
      
      if (uniqueProps.length > 0) {
        console.log(`      Дополнительные свойства: ${uniqueProps.join(', ')}`);
        uniqueProps.forEach(prop => {
          console.log(`         ${prop}: "${country.properties[prop]}"`);
        });
      }
    }
  });
  
  // Попробуем исправить Швейцарию
  console.log('\n🔧 ПОПЫТКА ИСПРАВЛЕНИЯ...');
  
  let fixed = false;
  
  switzerlandFeatures.forEach((feature, index) => {
    console.log(`\n   Исправляем Швейцарию #${index + 1}...`);
    
    // Копируем свойства с успешной страны (например, Германии)
    const germany = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes('germany')
    );
    
    if (germany) {
      // Сохраняем оригинальные свойства Швейцарии
      const originalProps = { ...feature.properties };
      
      // Копируем структуру свойств с Германии, но оставляем данные Швейцарии
      feature.properties = {
        ...germany.properties,
        NAME: 'Switzerland',
        ABBREVN: 'Switzerland', 
        SUBJECTO: 'Switzerland',
        PARTOF: 'Switzerland'
      };
      
      console.log(`      ✅ Скопированы свойства с Германии`);
      console.log(`      Новые свойства:`);
      Object.keys(feature.properties).forEach(key => {
        if (feature.properties[key] !== originalProps[key]) {
          console.log(`         ${key}: "${originalProps[key]}" → "${feature.properties[key]}"`);
        }
      });
      
      fixed = true;
    }
  });
  
  if (fixed) {
    // Сохраняем исправленные данные
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log('\n✅ Данные сохранены!');
    
    // Финальная проверка
    console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА:');
    const updatedSwitzerland = worldData.features.find(f => 
      (f.properties.NAME || '').toLowerCase().includes('switzerland')
    );
    
    if (updatedSwitzerland) {
      console.log('✅ Швейцария найдена после исправления');
      console.log('   Все свойства:');
      Object.keys(updatedSwitzerland.properties).forEach(key => {
        console.log(`      ${key}: "${updatedSwitzerland.properties[key]}"`);
      });
    }
  } else {
    console.log('\n❌ Не удалось исправить Швейцарию');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Диагностика завершена!');