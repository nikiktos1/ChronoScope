const fs = require('fs');
const turf = require('@turf/turf');

console.log('🏔️  Добавление Судет к Германии (1938)...\n');

// Мюнхенское соглашение (30 сентября 1938)
// Германия аннексировала Судеты - пограничные области Чехословакии

// Загружаем карту 1938
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
const germany = map1938.features.find(f => f.properties.name === 'Германия');
const czechoslovakia = map1938.features.find(f => f.properties.name === 'Чехословакия');

if (!germany || !czechoslovakia) {
  console.log('❌ Не найдены Германия или Чехословакия');
  process.exit(1);
}

console.log('✓ Германия и Чехословакия найдены');

// Судеты - это пограничная полоса Чехословакии шириной ~30-50 км
// Создаем буфер вокруг Германии и пересекаем с Чехословакией
try {
  // Создаем буфер 50 км вокруг Германии
  const germanyBuffer = turf.buffer(germany, 50, { units: 'kilometers' });
  
  // Пересекаем буфер с Чехословакией - это и есть Судеты
  const sudetenland = turf.intersect(turf.featureCollection([czechoslovakia, germanyBuffer]));
  
  if (sudetenland) {
    console.log('✓ Судеты выделены (пограничная область)');
    
    // Вычитаем Судеты из Чехословакии
    const czechoslovakiaWithoutSudeten = turf.difference(
      turf.featureCollection([czechoslovakia, sudetenland])
    );
    
    if (czechoslovakiaWithoutSudeten) {
      // Обновляем Чехословакию (без Судет)
      const csIndex = map1938.features.findIndex(f => f.properties.name === 'Чехословакия');
      map1938.features[csIndex] = {
        type: "Feature",
        properties: czechoslovakia.properties,
        geometry: czechoslovakiaWithoutSudeten.geometry
      };
      console.log('✓ Чехословакия уменьшена (Судеты удалены)');
    }
    
    // Добавляем Судеты к Германии
    const germanyCoords = [];
    
    if (germany.geometry.type === 'Polygon') {
      germanyCoords.push(germany.geometry.coordinates);
    } else {
      germanyCoords.push(...germany.geometry.coordinates);
    }
    
    if (sudetenland.geometry.type === 'Polygon') {
      germanyCoords.push(sudetenland.geometry.coordinates);
    } else if (sudetenland.geometry.type === 'MultiPolygon') {
      germanyCoords.push(...sudetenland.geometry.coordinates);
    }
    
    // Обновляем Германию
    const germanyIndex = map1938.features.findIndex(f => f.properties.name === 'Германия');
    map1938.features[germanyIndex] = {
      type: "Feature",
      properties: germany.properties,
      geometry: {
        type: 'MultiPolygon',
        coordinates: germanyCoords
      }
    };
    
    console.log('✓ Судеты добавлены к Германии');
    
  } else {
    console.log('⚠️  Не удалось выделить Судеты, используем упрощенный метод');
    throw new Error('Fallback');
  }
  
} catch (error) {
  console.log('\n⚠️  Используем упрощенный метод: берем западную часть Чехословакии\n');
  
  // Упрощенный метод: берем западную часть Чехословакии (долгота < 15°)
  const SUDETEN_BORDER = 15.0;
  
  const sudetenParts = [];
  const czechParts = [];
  
  if (czechoslovakia.geometry.type === 'Polygon') {
    // Проверяем есть ли точки западнее границы
    let hasWest = false;
    czechoslovakia.geometry.coordinates[0].forEach(coord => {
      if (coord[0] < SUDETEN_BORDER) hasWest = true;
    });
    
    if (hasWest) {
      sudetenParts.push(czechoslovakia.geometry.coordinates);
    } else {
      czechParts.push(czechoslovakia.geometry.coordinates);
    }
  } else if (czechoslovakia.geometry.type === 'MultiPolygon') {
    czechoslovakia.geometry.coordinates.forEach(polygon => {
      let hasWest = false;
      polygon[0].forEach(coord => {
        if (coord[0] < SUDETEN_BORDER) hasWest = true;
      });
      
      if (hasWest) {
        sudetenParts.push(polygon);
      } else {
        czechParts.push(polygon);
      }
    });
  }
  
  console.log(`✓ Судеты: ${sudetenParts.length} полигонов (западнее ${SUDETEN_BORDER}°)`);
  console.log(`✓ Чехословакия: ${czechParts.length} полигонов`);
  
  if (sudetenParts.length > 0) {
    // Добавляем Судеты к Германии
    const germanyCoords = [];
    
    if (germany.geometry.type === 'Polygon') {
      germanyCoords.push(germany.geometry.coordinates);
    } else {
      germanyCoords.push(...germany.geometry.coordinates);
    }
    
    germanyCoords.push(...sudetenParts);
    
    // Обновляем Германию
    const germanyIndex = map1938.features.findIndex(f => f.properties.name === 'Германия');
    map1938.features[germanyIndex] = {
      type: "Feature",
      properties: germany.properties,
      geometry: {
        type: 'MultiPolygon',
        coordinates: germanyCoords
      }
    };
    
    console.log('✓ Судеты добавлены к Германии');
  }
  
  if (czechParts.length > 0) {
    // Обновляем Чехословакию
    const csIndex = map1938.features.findIndex(f => f.properties.name === 'Чехословакия');
    map1938.features[csIndex] = {
      type: "Feature",
      properties: czechoslovakia.properties,
      geometry: {
        type: czechParts.length === 1 ? 'Polygon' : 'MultiPolygon',
        coordinates: czechParts.length === 1 ? czechParts[0] : czechParts
      }
    };
    
    console.log('✓ Чехословакия обновлена (без Судет)');
  }
}

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(map1938));

console.log('\n✅ Судеты добавлены к Германии!');
console.log(`📊 Всего стран: ${map1938.features.length}`);
console.log('\n📜 Мюнхенское соглашение (30.09.1938):');
console.log('   Судеты (пограничные области Чехословакии) → Германия');
console.log('   Великобритания и Франция согласились на аннексию');
