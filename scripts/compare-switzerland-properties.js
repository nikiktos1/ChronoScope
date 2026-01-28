const fs = require('fs');

console.log('🔍 Сравнение свойств Швейцарии в разных годах...\n');

const years = ['2010', '1994', '1960', '1945', '1938', '1930', '1920', '1914', '1900'];

try {
  // Сначала проверим 2000 год
  console.log('🇨🇭 ШВЕЙЦАРИЯ В 2000 ГОДУ:');
  const world2000 = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  const switzerland2000 = world2000.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (switzerland2000) {
    console.log('   ✅ Найдена');
    console.log('   Свойства:');
    Object.keys(switzerland2000.properties).sort().forEach(key => {
      console.log(`      ${key}: "${switzerland2000.properties[key]}"`);
    });
  } else {
    console.log('   ❌ Не найдена');
  }
  
  // Теперь проверим другие годы
  for (const year of years) {
    try {
      console.log(`\n🇨🇭 ШВЕЙЦАРИЯ В ${year} ГОДУ:`);
      const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      const switzerlandFeatures = worldData.features.filter(f => {
        const name = (f.properties.NAME || '').toLowerCase();
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
        
        return name.includes('switzerland') || 
               subjecto.includes('switzerland') ||
               abbrevn.includes('switzerland');
      });
      
      if (switzerlandFeatures.length > 0) {
        console.log(`   ✅ Найдено объектов: ${switzerlandFeatures.length}`);
        
        switzerlandFeatures.forEach((feature, index) => {
          console.log(`   
   Объект #${index + 1}:`);
          console.log(`      NAME: "${feature.properties.NAME}"`);
          
          // Показываем все свойства
          const allProps = Object.keys(feature.properties).sort();
          console.log(`      Всего свойств: ${allProps.length}`);
          
          allProps.forEach(key => {
            console.log(`         ${key}: "${feature.properties[key]}"`);
          });
          
          // Проверяем размер геометрии
          const geoSize = JSON.stringify(feature.geometry).length;
          console.log(`      Размер геометрии: ${geoSize} символов`);
        });
        
        // Если это первый рабочий год, сохраним эталонные свойства
        if (year === '2010' && switzerlandFeatures.length > 0) {
          console.log('\n🔧 КОПИРОВАНИЕ ЭТАЛОННЫХ СВОЙСТВ ИЗ 2010 ГОДА...');
          
          const referenceFeature = switzerlandFeatures[0];
          
          // Обновляем Швейцарию в 2000 году
          if (switzerland2000) {
            const originalProps = { ...switzerland2000.properties };
            
            // Копируем все свойства, кроме геометрии
            switzerland2000.properties = {
              ...referenceFeature.properties,
              NAME: 'Switzerland',
              ABBREVN: 'Switzerland',
              SUBJECTO: 'Switzerland'
            };
            
            console.log('   Изменения:');
            Object.keys(switzerland2000.properties).sort().forEach(key => {
              if (switzerland2000.properties[key] !== originalProps[key]) {
                console.log(`      ${key}: "${originalProps[key] || 'undefined'}" → "${switzerland2000.properties[key]}"`);
              }
            });
            
            // Сохраняем
            fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(world2000, null, 2));
            console.log('   ✅ Обновленные данные сохранены!');
          }
          
          break; // Прекращаем поиск после первого успешного копирования
        }
        
      } else {
        console.log('   ❌ Не найдена');
      }
      
    } catch (e) {
      console.log(`   ❌ Файл world_${year}.geojson не найден`);
    }
  }
  
  // Финальная проверка
  console.log('\n🔍 ФИНАЛЬНАЯ ПРОВЕРКА 2000 ГОДА:');
  const finalWorld2000 = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  const finalSwitzerland = finalWorld2000.features.find(f => 
    (f.properties.NAME || '').toLowerCase().includes('switzerland')
  );
  
  if (finalSwitzerland) {
    console.log('✅ Швейцария найдена');
    console.log('   Финальные свойства:');
    Object.keys(finalSwitzerland.properties).sort().forEach(key => {
      console.log(`      ${key}: "${finalSwitzerland.properties[key]}"`);
    });
    
    const geoSize = JSON.stringify(finalSwitzerland.geometry).length;
    console.log(`   Размер геометрии: ${geoSize} символов`);
    console.log(`   Тип геометрии: ${finalSwitzerland.geometry.type}`);
  } else {
    console.log('❌ Швейцария не найдена');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Сравнение завершено!');