import fs from 'fs';

console.log('🔍 Анализ СССР в мировых данных 1945 года...\n');

try {
  // Загружаем мировые данные 1945
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1945.geojson', 'utf8'));
  
  console.log(`Всего территорий в мировых данных: ${worldData.features.length}`);
  
  // Ищем все территории, связанные с СССР
  const ussrRelated = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    const partof = (f.properties.PARTOF || '').toLowerCase();
    
    return subjecto.includes('ussr') || subjecto.includes('soviet') ||
           name.includes('ussr') || name.includes('soviet') ||
           partof.includes('ussr') || partof.includes('soviet') ||
           subjecto.includes('russia') || name.includes('russia');
  });
  
  console.log(`\nНайдено территорий, связанных с СССР/Россией: ${ussrRelated.length}`);
  
  if (ussrRelated.length > 0) {
    console.log('\nСписок найденных территорий:');
    ussrRelated.forEach((feature, index) => {
      console.log(`${index + 1}. NAME: "${feature.properties.NAME}"`);
      console.log(`   SUBJECTO: "${feature.properties.SUBJECTO}"`);
      console.log(`   PARTOF: "${feature.properties.PARTOF}"`);
      console.log(`   ABBREVN: "${feature.properties.ABBREVN}"`);
      console.log('');
    });
  }
  
  // Также поищем территории с координатами в области СССР (Восточная Европа/Азия)
  console.log('Поиск территорий в географической области СССР...');
  
  const easternEuropeanTerritories = worldData.features.filter(f => {
    if (!f.geometry || !f.geometry.coordinates) return false;
    
    // Проверяем координаты (примерно от 20° до 180° восточной долготы, от 40° до 80° северной широты)
    const coords = f.geometry.coordinates;
    let hasEasternCoords = false;
    
    const checkCoords = (coordArray) => {
      if (Array.isArray(coordArray[0])) {
        coordArray.forEach(checkCoords);
      } else {
        const [lon, lat] = coordArray;
        if (lon >= 20 && lon <= 180 && lat >= 40 && lat <= 80) {
          hasEasternCoords = true;
        }
      }
    };
    
    checkCoords(coords);
    return hasEasternCoords;
  });
  
  console.log(`\nТерриторий в географической области СССР: ${easternEuropeanTerritories.length}`);
  
  // Показываем первые 10 для анализа
  console.log('\nПервые 10 территорий в этой области:');
  easternEuropeanTerritories.slice(0, 10).forEach((feature, index) => {
    console.log(`${index + 1}. NAME: "${feature.properties.NAME}" | SUBJECTO: "${feature.properties.SUBJECTO}"`);
  });
  
  // Попробуем найти в других годах для сравнения
  console.log('\n🔍 Поиск СССР в других годах для сравнения...');
  
  const years = ['1938', '1930', '1920'];
  for (const year of years) {
    try {
      const otherData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      const ussrInOther = otherData.features.filter(f => {
        const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
        const name = (f.properties.NAME || '').toLowerCase();
        return subjecto.includes('ussr') || subjecto.includes('soviet') ||
               name.includes('ussr') || name.includes('soviet');
      });
      
      console.log(`${year}: найдено ${ussrInOther.length} территорий СССР`);
      if (ussrInOther.length > 0) {
        ussrInOther.forEach(f => {
          console.log(`  - ${f.properties.NAME} (${f.properties.SUBJECTO})`);
        });
      }
    } catch (e) {
      console.log(`${year}: файл не найден`);
    }
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Анализ завершен!');