const fs = require('fs');

console.log('🌊 Исправление Чукотки для СССР 1938...\n');

try {
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  // Ищем данные с полной Чукоткой в других годах
  const years = ['1914', '1920', '1930'];
  let chukotkaFound = false;
  
  for (const year of years) {
    try {
      console.log(`Проверяем ${year} год...`);
      const worldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      
      // Ищем части России/СССР с Чукоткой
      const russiaFeatures = worldData.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const name = (f.properties.NAME || '').toLowerCase();
        return subjecto.includes('ussr') || subjecto.includes('russia') || 
               name.includes('ussr') || name.includes('russia');
      });
      
      for (const feature of russiaFeatures) {
        const coords = feature.geometry.coordinates.flat(2);
        
        // Ищем координаты Чукотки (крайний северо-восток)
        const chukotkaCoords = coords.filter(c => 
          c[0] > 175 && c[1] > 65 // Чукотка: >175°E, >65°N
        );
        
        const beringCoords = coords.filter(c => 
          (c[0] > 179 || c[0] < -179) && c[1] > 60 // Берингов пролив
        );
        
        if (chukotkaCoords.length > 10 || beringCoords.length > 10) {
          console.log(`✅ Найдена Чукотка в ${year}:`);
          console.log(`   Чукотка: ${chukotkaCoords.length} точек`);
          console.log(`   Берингов пролив: ${beringCoords.length} точек`);
          console.log(`   Всего координат: ${coords.length}`);
          
          // Применяем к СССР 1938
          const ussrIndex = europeData.features.findIndex(f => 
            f.properties.name.toLowerCase().includes('ссср')
          );
          
          if (ussrIndex !== -1) {
            europeData.features[ussrIndex].geometry = feature.geometry;
            fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
            
            console.log(`🎯 СССР 1938 обновлен данными из ${year} с полной Чукоткой`);
            
            // Финальная проверка
            const finalCoords = feature.geometry.coordinates.flat(2);
            const finalChukotka = finalCoords.filter(c => c[0] > 175 && c[1] > 65).length;
            const finalBering = finalCoords.filter(c => (c[0] > 179 || c[0] < -179) && c[1] > 60).length;
            const minLat = Math.min(...finalCoords.map(c => c[1]));
            
            console.log(`\n📊 РЕЗУЛЬТАТ:`);
            console.log(`   Всего координат: ${finalCoords.length}`);
            console.log(`   Чукотка (>175°E, >65°N): ${finalChukotka} точек`);
            console.log(`   Берингов пролив: ${finalBering} точек`);
            console.log(`   Минимальная широта: ${minLat.toFixed(1)}°`);
            console.log(`   Заходит в Турцию: ${minLat < 36 ? 'ДА ⚠️' : 'НЕТ ✅'}`);
            
            chukotkaFound = true;
            break;
          }
        }
      }
      
      if (chukotkaFound) break;
      
    } catch (e) {
      console.log(`❌ Не удалось загрузить ${year}: ${e.message}`);
    }
  }
  
  if (!chukotkaFound) {
    console.log('\n❌ Полная Чукотка не найдена в других годах');
    console.log('💡 Возможно, нужно принять текущее состояние или искать другие источники');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Исправление Чукотки завершено!');