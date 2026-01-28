const fs = require('fs');

console.log('🔍 Поиск недостающей Чукотки для СССР 1938...\n');

try {
  // Проверяем разные годы для поиска полной территории СССР
  const years = ['1914', '1920', '1930', '1945'];
  
  for (const year of years) {
    try {
      console.log(`\n📅 Проверяем ${year} год...`);
      const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      // Ищем СССР/Россию
      const russiaFeatures = worldData.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const name = (f.properties.NAME || '').toLowerCase();
        return subjecto.includes('ussr') || subjecto.includes('russia') || 
               name.includes('ussr') || name.includes('russia');
      });
      
      console.log(`   Найдено ${russiaFeatures.length} частей России/СССР`);
      
      russiaFeatures.forEach((feature, i) => {
        const coords = feature.geometry.coordinates.flat(2);
        const minLon = Math.min(...coords.map(c => c[0]));
        const maxLon = Math.max(...coords.map(c => c[0]));
        const minLat = Math.min(...coords.map(c => c[1]));
        const maxLat = Math.max(...coords.map(c => c[1]));
        
        // Проверяем, есть ли Чукотка (крайний северо-восток)
        const hasChukotka = coords.some(c => c[0] > 175 && c[1] > 65);
        const hasBeringStrait = coords.some(c => (c[0] > 179 || c[0] < -179) && c[1] > 60);
        
        console.log(`   Часть ${i+1}: ${feature.properties.SUBJECTO || feature.properties.NAME}`);
        console.log(`     Координат: ${coords.length}`);
        console.log(`     Долгота: ${minLon.toFixed(1)}° - ${maxLon.toFixed(1)}°`);
        console.log(`     Широта: ${minLat.toFixed(1)}° - ${maxLat.toFixed(1)}°`);
        console.log(`     Чукотка (>175°E, >65°N): ${hasChukotka ? '✅' : '❌'}`);
        console.log(`     Берингов пролив (±180°): ${hasBeringStrait ? '✅' : '❌'}`);
        
        // Если это полная территория с Чукоткой, сохраняем её
        if ((hasChukotka || hasBeringStrait) && coords.length > 1000) {
          console.log(`     🎯 НАЙДЕНА ПОЛНАЯ ТЕРРИТОРИЯ С ЧУКОТКОЙ!`);
          
          // Применяем к карте 1938
          const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
          const ussrIndex = europeData.features.findIndex(f => 
            f.properties.name.toLowerCase().includes('ссср') ||
            f.properties.name.toLowerCase().includes('ussr')
          );
          
          if (ussrIndex !== -1) {
            europeData.features[ussrIndex].geometry = feature.geometry;
            fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
            
            console.log(`     ✅ СССР 1938 обновлен данными из ${year} года`);
            
            // Финальная проверка
            const finalCoords = feature.geometry.coordinates.flat(2);
            const finalChukotka = finalCoords.filter(c => c[0] > 175 && c[1] > 65).length;
            const finalBering = finalCoords.filter(c => (c[0] > 179 || c[0] < -179)).length;
            
            console.log(`\n🎯 РЕЗУЛЬТАТ:`);
            console.log(`   Всего координат: ${finalCoords.length}`);
            console.log(`   Чукотка: ${finalChukotka} точек ${finalChukotka > 0 ? '✅' : '❌'}`);
            console.log(`   Берингов пролив: ${finalBering} точек ${finalBering > 0 ? '✅' : '❌'}`);
            
            return; // Выходим из всех циклов
          }
        }
      });
      
    } catch (e) {
      console.log(`   ❌ Не удалось загрузить данные ${year}: ${e.message}`);
    }
  }
  
  console.log('\n❌ Полная территория с Чукоткой не найдена');
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Поиск завершен!');