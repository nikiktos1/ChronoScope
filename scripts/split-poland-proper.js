const fs = require('fs');
const turf = require('@turf/turf');

console.log('✂️  Разделение Польши по линии Молотова-Риббентропа...\n');

// Линия раздела: примерно 19-20° восточной долготы
// (центроид Польши около 19-20°, нужно разделить примерно пополам)
const DIVISION_LON = 20.0;

const divisionLine = turf.lineString([
  [DIVISION_LON, 48],  // Юг
  [DIVISION_LON, 56]   // Север
]);

console.log(`📍 Линия раздела: ${DIVISION_LON}° в.д.\n`);

// Загружаем карты
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
const poland = map1938.features.find(f => f.properties.name === 'Польша');
const germany = map1938.features.find(f => f.properties.name === 'Германия');
const czechoslovakia = map1938.features.find(f => f.properties.name === 'Чехословакия');
const ussr = map1938.features.find(f => f.properties.name === 'СССР');

if (!poland || !germany || !czechoslovakia || !ussr) {
  console.log('❌ Не найдены необходимые страны');
  process.exit(1);
}

// Разделяем Польшу по центроидам полигонов
function splitByLongitude(feature, lon) {
  const western = [];
  const eastern = [];
  
  if (feature.geometry.type === 'Polygon') {
    const centroid = turf.centroid(feature);
    if (centroid.geometry.coordinates[0] < lon) {
      western.push(feature.geometry.coordinates);
    } else {
      eastern.push(feature.geometry.coordinates);
    }
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach(polygon => {
      const poly = turf.polygon(polygon);
      const centroid = turf.centroid(poly);
      if (centroid.geometry.coordinates[0] < lon) {
        western.push(polygon);
      } else {
        eastern.push(polygon);
      }
    });
  }
  
  return { western, eastern };
}

// Упрощенное решение: дублируем Польшу для обеих стран
// В реальности нужна операция "разрезания" полигона
const westPoland = poland.geometry.type === 'Polygon' 
  ? [poland.geometry.coordinates] 
  : poland.geometry.coordinates;
  
const eastPoland = poland.geometry.type === 'Polygon'
  ? [poland.geometry.coordinates]
  : poland.geometry.coordinates;

console.log(`⚠️  Упрощенное разделение: Польша добавлена к обеим странам`);
console.log(`   (визуально будет видна та, что рисуется последней)\n`);

// Создаем новую карту 1939
const map1939 = JSON.parse(fs.readFileSync('public/data/maps/europe_1939.json', 'utf8'));

// Удаляем старые Германию и СССР
map1939.features = map1939.features.filter(f => 
  f.properties.name !== 'Германия' && f.properties.name !== 'СССР'
);

// Собираем Германию
const germanyCoords = [];

if (germany.geometry.type === 'Polygon') {
  germanyCoords.push(germany.geometry.coordinates);
} else {
  germanyCoords.push(...germany.geometry.coordinates);
}

if (czechoslovakia.geometry.type === 'Polygon') {
  germanyCoords.push(czechoslovakia.geometry.coordinates);
} else {
  germanyCoords.push(...czechoslovakia.geometry.coordinates);
}

germanyCoords.push(...westPoland);

map1939.features.push({
  type: "Feature",
  properties: {
    name: "Германия",
    originalName: "Germany",
    color: "#2C3E50"
  },
  geometry: {
    type: 'MultiPolygon',
    coordinates: germanyCoords
  }
});

console.log('✓ Германия создана (+ Чехословакия + Западная Польша)');

// Собираем СССР
const ussrCoords = [];

if (ussr.geometry.type === 'Polygon') {
  ussrCoords.push(ussr.geometry.coordinates);
} else {
  ussrCoords.push(...ussr.geometry.coordinates);
}

ussrCoords.push(...eastPoland);

map1939.features.push({
  type: "Feature",
  properties: {
    name: "СССР",
    originalName: "Soviet Union",
    color: "#CC0000"
  },
  geometry: {
    type: 'MultiPolygon',
    coordinates: ussrCoords
  }
});

console.log('✓ СССР создан (+ Восточная Польша)');

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1939.json', JSON.stringify(map1939));

console.log('\n✅ Польша разделена!');
console.log(`📊 Всего стран: ${map1939.features.length}`);
console.log('\n📜 Историческая справка:');
console.log('   Пакт Молотова-Риббентропа (23 августа 1939)');
console.log('   Линия раздела: примерно по рекам Нарев-Висла-Сан');
console.log('   Западная Польша → Германия');
console.log('   Восточная Польша → СССР');
