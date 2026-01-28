const fs = require('fs');

console.log('🇸🇰 Добавление Словакии на карту 1939...\n');

// В марте 1939 Словакия стала независимым марионеточным государством
// под контролем Германии

// Загружаем карты
const map1939 = JSON.parse(fs.readFileSync('public/data/maps/europe_1939.json', 'utf8'));

// Загружаем Чехословакию из исходного датасета 1930 (до Мюнхена)
const source1930 = JSON.parse(fs.readFileSync('public/data/historical/world_1930.geojson', 'utf8'));
const czechoslovakiaFeatures = source1930.features.filter(f => 
  f.properties.SUBJECTO === 'Czechoslovakia'
);

if (czechoslovakiaFeatures.length === 0) {
  console.log('❌ Чехословакия не найдена в 1930');
  process.exit(1);
}

// Объединяем все части Чехословакии
const czechoslovakia = {
  type: 'Feature',
  properties: { name: 'Чехословакия' },
  geometry: {
    type: 'MultiPolygon',
    coordinates: []
  }
};

czechoslovakiaFeatures.forEach(f => {
  if (f.geometry.type === 'Polygon') {
    czechoslovakia.geometry.coordinates.push(f.geometry.coordinates);
  } else if (f.geometry.type === 'MultiPolygon') {
    czechoslovakia.geometry.coordinates.push(...f.geometry.coordinates);
  }
});

console.log('✓ Чехословакия загружена из 1930 (до Мюнхенского соглашения)');

// Чехословакия состояла из Чехии (запад) и Словакии (восток)
// Разделим по вертикальной линии примерно по 18.5° долготы
const DIVISION_LON = 18.5;
console.log(`📍 Линия раздела Чехия/Словакия: ${DIVISION_LON}° в.д.\n`);

// Разделяем полигон по вертикальной линии
const turf = require('@turf/turf');
const slovakiaParts = [];
const czechParts = [];

try {
  // Создаем bbox для разделения
  const bbox = turf.bbox(czechoslovakia);
  
  // Западная часть (Чехия): от западной границы до линии раздела
  const westBox = turf.bboxPolygon([bbox[0], bbox[1], DIVISION_LON, bbox[3]]);
  
  // Восточная часть (Словакия): от линии раздела до восточной границы
  const eastBox = turf.bboxPolygon([DIVISION_LON, bbox[1], bbox[2], bbox[3]]);
  
  // Пересекаем с боксами
  const czechIntersect = turf.intersect(turf.featureCollection([czechoslovakia, westBox]));
  const slovakIntersect = turf.intersect(turf.featureCollection([czechoslovakia, eastBox]));
  
  if (czechIntersect) {
    if (czechIntersect.geometry.type === 'Polygon') {
      czechParts.push(czechIntersect.geometry.coordinates);
    } else if (czechIntersect.geometry.type === 'MultiPolygon') {
      czechParts.push(...czechIntersect.geometry.coordinates);
    }
  }
  
  if (slovakIntersect) {
    if (slovakIntersect.geometry.type === 'Polygon') {
      slovakiaParts.push(slovakIntersect.geometry.coordinates);
    } else if (slovakIntersect.geometry.type === 'MultiPolygon') {
      slovakiaParts.push(...slovakIntersect.geometry.coordinates);
    }
  }
} catch (error) {
  console.log('⚠️  Ошибка при разделении, используем простой метод по центроиду');
  
  // Fallback: простое разделение по центроиду
  if (czechoslovakia.geometry.type === 'Polygon') {
    let sumLon = 0, count = 0;
    czechoslovakia.geometry.coordinates[0].forEach(coord => {
      sumLon += coord[0];
      count++;
    });
    const centroidLon = sumLon / count;
    
    if (centroidLon >= DIVISION_LON) {
      slovakiaParts.push(czechoslovakia.geometry.coordinates);
    } else {
      czechParts.push(czechoslovakia.geometry.coordinates);
    }
  } else if (czechoslovakia.geometry.type === 'MultiPolygon') {
    czechoslovakia.geometry.coordinates.forEach(polygon => {
      let sumLon = 0, count = 0;
      polygon[0].forEach(coord => {
        sumLon += coord[0];
        count++;
      });
      const centroidLon = sumLon / count;
      
      if (centroidLon >= DIVISION_LON) {
        slovakiaParts.push(polygon);
      } else {
        czechParts.push(polygon);
      }
    });
  }
}

console.log(`✓ Словакия: ${slovakiaParts.length} полигонов`);
console.log(`✓ Чехия: ${czechParts.length} полигонов`);

// Если не удалось разделить, используем всю Чехословакию как Словакию
if (slovakiaParts.length === 0 && czechParts.length > 0) {
  console.log('⚠️  Не удалось разделить, используем всю Чехословакию как Словакию\n');
  slovakiaParts.push(...czechParts);
} else {
  console.log();
}

// Добавляем Словакию на карту 1939
if (slovakiaParts.length > 0) {
  map1939.features.push({
    type: "Feature",
    properties: {
      name: "Словакия",
      originalName: "Slovakia",
      color: "#87CEEB"
    },
    geometry: {
      type: slovakiaParts.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: slovakiaParts.length === 1 ? slovakiaParts[0] : slovakiaParts
    }
  });
  
  console.log('✓ Словакия добавлена на карту 1939');
  console.log('  (марионеточное государство под контролем Германии)');
}

// Добавляем Чехию на карту 1939 (будет аннексирована Германией)
if (czechParts.length > 0) {
  map1939.features.push({
    type: "Feature",
    properties: {
      name: "Чехия",
      originalName: "Czechia",
      color: "#4682B4"
    },
    geometry: {
      type: czechParts.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: czechParts.length === 1 ? czechParts[0] : czechParts
    }
  });
  
  console.log('✓ Чехия добавлена на карту 1939');
  console.log('  (будет аннексирована Германией в split-poland-real.js)');
}

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1939.json', JSON.stringify(map1939));

console.log('\n✅ Готово!');
console.log(`📊 Всего стран: ${map1939.features.length}`);
console.log('\n📜 Историческая справка:');
console.log('   14 марта 1939 - Словакия провозгласила независимость');
console.log('   15 марта 1939 - Германия оккупировала Чехию');
console.log('   Словакия стала марионеточным государством Германии');
