const fs = require('fs');

console.log('🔬 Глубокий анализ данных 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}\n`);
  
  // Анализируем каждую целевую страну детально
  const targetCountries = [
    { names: ['russia'], label: '🇷🇺 РОССИЯ' },
    { names: ['switzerland'], label: '🇨🇭 ШВЕЙЦАРИЯ' },
    { names: ['norway'], label: '🇳🇴 НОРВЕГИЯ' },
    { names: ['denmark'], label: '🇩🇰 ДАНИЯ' },
    { names: ['greenland'], label: '🇬🇱 ГРЕНЛАНДИЯ' }
  ];
  
  targetCountries.forEach(target => {
    console.log(`${target.label}:`);
    
    const countries = worldData.features.filter(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      
      return target.names.some(targetName => 
        name.includes(targetName.toLowerCase()) || 
        subjecto.includes(targetName.toLowerCase())
      );
    });
    
    if (countries.length === 0) {
      console.log('   ❌ НЕ НАЙДЕНА\n');
      return;
    }
    
    countries.forEach((country, index) => {
      console.log(`   ${index + 1}. NAME: "${country.properties.NAME}"`);
      console.log(`      SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`      ABBREVN: "${country.properties.ABBREVN}"`);
      console.log(`      PARTOF: "${country.properties.PARTOF}"`);
      console.log(`      Тип геометрии: ${country.geometry.type}`);
      
      // Анализируем координаты
      const coordsStr = JSON.stringify(country.geometry.coordinates);
      console.log(`      Размер координат: ${coordsStr.length} символов`);
      
      // Проверяем, есть ли реальные координаты
      if (country.geometry.type === 'MultiPolygon') {
        const polygonCount = country.geometry.coordinates.length;
        console.log(`      Количество полигонов: ${polygonCount}`);
        
        if (polygonCount > 0) {
          const firstPolygon = country.geometry.coordinates[0];
          if (firstPolygon && firstPolygon[0] && firstPolygon[0].length > 0) {
            const firstPoint = firstPolygon[0][0];
            console.log(`      Первая точка: [${firstPoint[0]}, ${firstPoint[1]}]`);
            
            // Проверяем диапазон координат
            let minLon = Infinity, maxLon = -Infinity;
            let minLat = Infinity, maxLat = -Infinity;
            
            function analyzeCoords(coords) {
              if (Array.isArray(coords[0])) {
                coords.forEach(analyzeCoords);
              } else {
                const [lon, lat] = coords;
                if (typeof lon === 'number' && typeof lat === 'number') {
                  minLon = Math.min(minLon, lon);
                  maxLon = Math.max(maxLon, lon);
                  minLat = Math.min(minLat, lat);
                  maxLat = Math.max(maxLat, lat);
                }
              }
            }
            
            analyzeCoords(country.geometry.coordinates);
            
            console.log(`      Диапазон долготы: ${minLon.toFixed(2)} до ${maxLon.toFixed(2)}`);
            console.log(`      Диапазон широты: ${minLat.toFixed(2)} до ${maxLat.toFixed(2)}`);
            
            // Проверяем, не слишком ли маленькая территория
            const lonRange = maxLon - minLon;
            const latRange = maxLat - minLat;
            console.log(`      Размер территории: ${lonRange.toFixed(2)}° × ${latRange.toFixed(2)}°`);
            
            if (lonRange < 0.1 && latRange < 0.1) {
              console.log(`      ⚠️  ОЧЕНЬ МАЛЕНЬКАЯ ТЕРРИТОРИЯ!`);
            } else if (lonRange > 100 || latRange > 50) {
              console.log(`      ✅ БОЛЬШАЯ ТЕРРИТОРИЯ (нормально для России)`);
            } else {
              console.log(`      ✅ Нормальный размер территории`);
            }
          } else {
            console.log(`      ❌ ПУСТЫЕ КООРДИНАТЫ!`);
          }
        } else {
          console.log(`      ❌ НЕТ ПОЛИГОНОВ!`);
        }
      } else if (country.geometry.type === 'Polygon') {
        const ringCount = country.geometry.coordinates.length;
        console.log(`      Количество колец: ${ringCount}`);
        
        if (ringCount > 0 && country.geometry.coordinates[0].length > 0) {
          const firstPoint = country.geometry.coordinates[0][0];
          console.log(`      Первая точка: [${firstPoint[0]}, ${firstPoint[1]}]`);
        }
      }
      
      console.log('');
    });
  });
  
  // Проверяем общую статистику по размерам территорий
  console.log('📈 СТАТИСТИКА ПО РАЗМЕРАМ ТЕРРИТОРИЙ:');
  
  const sizes = worldData.features.map(f => {
    const coordsStr = JSON.stringify(f.geometry.coordinates);
    return {
      name: f.properties.NAME || f.properties.SUBJECTO || 'Unnamed',
      size: coordsStr.length
    };
  }).sort((a, b) => b.size - a.size);
  
  console.log('\nТОП-10 самых больших территорий:');
  sizes.slice(0, 10).forEach((item, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${item.name}: ${item.size} символов`);
  });
  
  console.log('\nТОП-10 самых маленьких территорий:');
  sizes.slice(-10).forEach((item, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${item.name}: ${item.size} символов`);
  });
  
  // Ищем территории с подозрительно маленькими размерами
  const tinyTerritories = sizes.filter(item => item.size < 200);
  if (tinyTerritories.length > 0) {
    console.log(`\n⚠️  ПОДОЗРИТЕЛЬНО МАЛЕНЬКИЕ ТЕРРИТОРИИ (< 200 символов):`);
    tinyTerritories.forEach(item => {
      console.log(`   - ${item.name}: ${item.size} символов`);
    });
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Глубокий анализ завершен!');