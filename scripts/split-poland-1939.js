const fs = require('fs');

console.log('✂️  Разделение Польши по линии Молотова-Риббентропа...\n');

// Загружаем карту 1938
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
const poland = map1938.features.find(f => f.properties.name === 'Польша');

if (!poland) {
  console.log('❌ Польша не найдена');
  process.exit(1);
}

// Линия раздела: примерно 21° восточной долготы
// Западнее 21° → Германия
// Восточнее 21° → СССР
const DIVISION_LINE = 21.0;

console.log(`📍 Линия раздела: ${DIVISION_LINE}° в.д.`);
console.log('   (примерно по рекам Нарев-Висла-Сан)\n');

// Функция для разделения полигона
function splitPolygon(coordinates, divisionLon) {
  const western = [];
  const eastern = [];
  
  coordinates.forEach(ring => {
    // Вычисляем центроид кольца
    let sumLon = 0;
    let count = 0;
    
    ring.forEach(coord => {
      sumLon += coord[0];
      count++;
    });
    
    const centroidLon = sumLon / count;
    
    // Определяем к какой части относится
    if (centroidLon < divisionLon) {
      western.push(ring);
    } else {
      eastern.push(ring);
    }
  });
  
  return { western, eastern };
}

// Разделяем Польшу
let westernPoland = null;
let easternPoland = null;

if (poland.geometry.type === 'Polygon') {
  const { western, eastern } = splitPolygon([poland.geometry.coordinates[0]], DIVISION_LINE);
  
  if (western.length > 0) {
    westernPoland = {
      type: 'Polygon',
      coordinates: western
    };
  }
  
  if (eastern.length > 0) {
    easternPoland = {
      type: 'Polygon',
      coordinates: eastern
    };
  }
} else if (poland.geometry.type === 'MultiPolygon') {
  const westernParts = [];
  const easternParts = [];
  
  poland.geometry.coordinates.forEach(polygon => {
    const { western, eastern } = splitPolygon(polygon, DIVISION_LINE);
    westernParts.push(...western);
    easternParts.push(...eastern);
  });
  
  if (westernParts.length > 0) {
    westernPoland = {
      type: 'MultiPolygon',
      coordinates: westernParts
    };
  }
  
  if (easternParts.length > 0) {
    easternPoland = {
      type: 'MultiPolygon',
      coordinates: easternParts
    };
  }
}

// Создаем карту 1939
const map1939 = JSON.parse(fs.readFileSync('public/data/maps/europe_1939.json', 'utf8'));

// Удаляем старые Германию и СССР
map1939.features = map1939.features.filter(f => 
  f.properties.name !== 'Германия' && f.properties.name !== 'СССР'
);

// Германия + Чехословакия + Западная Польша
const germany1938 = map1938.features.find(f => f.properties.name === 'Германия');
const czechoslovakia1938 = map1938.features.find(f => f.properties.name === 'Чехословакия');

if (germany1938 && czechoslovakia1938 && westernPoland) {
  const germanyCoords = [];
  
  // Германия
  if (germany1938.geometry.type === 'Polygon') {
    germanyCoords.push(germany1938.geometry.coordinates);
  } else {
    germanyCoords.push(...germany1938.geometry.coordinates);
  }
  
  // Чехословакия
  if (czechoslovakia1938.geometry.type === 'Polygon') {
    germanyCoords.push(czechoslovakia1938.geometry.coordinates);
  } else {
    germanyCoords.push(...czechoslovakia1938.geometry.coordinates);
  }
  
  // Западная Польша
  if (westernPoland.type === 'Polygon') {
    germanyCoords.push(westernPoland.coordinates);
  } else {
    germanyCoords.push(...westernPoland.coordinates);
  }
  
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
  
  console.log('✓ Германия: + Чехословакия + Западная Польша');
}

// СССР + Восточная Польша
const ussr1938 = map1938.features.find(f => f.properties.name === 'СССР');

if (ussr1938 && easternPoland) {
  const ussrCoords = [];
  
  // СССР
  if (ussr1938.geometry.type === 'Polygon') {
    ussrCoords.push(ussr1938.geometry.coordinates);
  } else {
    ussrCoords.push(...ussr1938.geometry.coordinates);
  }
  
  // Восточная Польша
  if (easternPoland.type === 'Polygon') {
    ussrCoords.push(easternPoland.coordinates);
  } else {
    ussrCoords.push(...easternPoland.coordinates);
  }
  
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
  
  console.log('✓ СССР: + Восточная Польша');
}

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1939.json', JSON.stringify(map1939));

console.log('\n✅ Польша разделена!');
console.log(`📊 Всего стран: ${map1939.features.length}`);
console.log('\n⚠️  Примечание: разделение приблизительное');
console.log('   Основано на центроидах полигонов, а не точной линии');
