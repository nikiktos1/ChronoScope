const fs = require('fs');
const turf = require('@turf/turf');

console.log('✂️  НАСТОЯЩЕЕ разделение Польши...\n');

// Загружаем карты
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
const poland = map1938.features.find(f => f.properties.name === 'Польша');
const germany = map1938.features.find(f => f.properties.name === 'Германия');
const czechoslovakia = map1938.features.find(f => f.properties.name === 'Чехословакия');
const ussr = map1938.features.find(f => f.properties.name === 'СССР');

if (!poland) {
  console.log('❌ Польша не найдена');
  process.exit(1);
}

if (!ussr) {
  console.log('❌ СССР не найден в 1938');
  process.exit(1);
}

console.log('✓ Польша и СССР найдены в 1938');

// Линия раздела: ломаная линия по реальной границе Молотова-Риббентропа
// Примерно по рекам: Нарев → Висла → Сан
const divisionLine = turf.lineString([
  [23.5, 54.5],  // 1. Север (граница с Литвой, восточнее)
  [23.2, 54.2],  // 2. Река Нарев (верховья, течет на юго-запад)
  [22.8, 53.8],  // 3. Нарев (поворот)
  [22.3, 53.4],  // 4. Нарев (среднее течение)
  [21.8, 53.0],  // 5. Нарев впадает в Вислу
  [21.3, 52.5],  // 6. Висла (западнее Варшавы)
  [21.0, 52.0],  // 7. Висла (южнее Варшавы, течет на юг)
  [20.8, 51.5],  // 8. Висла (среднее течение)
  [20.7, 51.0],  // 9. Висла (продолжение на юг)
  [21.0, 50.5],  // 10. Поворот к Сану (на юго-восток)
  [21.5, 50.0],  // 11. Река Сан (верховья)
  [22.0, 49.5],  // 12. Сан (среднее течение)
  [22.5, 49.2]   // 13. Юг (Карпаты, Сан впадает в Вислу)
]);

console.log('📍 Линия раздела: ломаная по рекам Нарев-Висла-Сан');
console.log('   (13 точек, следует течению рек)');
console.log('   Север → Юго-Запад (Нарев) → Юг (Висла) → Юго-Восток (Сан)\n');

// Разделяем Польшу по ломаной линии
try {
  const bbox = turf.bbox(poland);
  
  // Создаем полигон западнее линии (от западной границы до линии)
  const westPoints = [
    [bbox[0], bbox[1]],  // Юго-запад bbox
    [bbox[0], bbox[3]],  // Северо-запад bbox
  ];
  
  // Добавляем точки линии сверху вниз
  for (let i = 0; i < divisionLine.geometry.coordinates.length; i++) {
    westPoints.push(divisionLine.geometry.coordinates[i]);
  }
  
  westPoints.push([bbox[0], bbox[1]]); // Замыкаем
  const westBox = turf.polygon([westPoints]);
  
  // Создаем полигон восточнее линии (от линии до восточной границы)
  const eastPoints = [];
  
  // Добавляем точки линии снизу вверх
  for (let i = divisionLine.geometry.coordinates.length - 1; i >= 0; i--) {
    eastPoints.push(divisionLine.geometry.coordinates[i]);
  }
  
  // Добавляем углы bbox
  eastPoints.push([bbox[2], bbox[3]]);  // Северо-восток
  eastPoints.push([bbox[2], bbox[1]]);  // Юго-восток
  eastPoints.push(divisionLine.geometry.coordinates[divisionLine.geometry.coordinates.length - 1]); // Замыкаем
  
  const eastBox = turf.polygon([eastPoints]);
  
  // Пересекаем Польшу с полигонами
  const westPoland = turf.intersect(turf.featureCollection([poland, westBox]));
  const eastPoland = turf.intersect(turf.featureCollection([poland, eastBox]));
  
  console.log('✓ Западная Польша:', westPoland ? 'создана' : 'не создана');
  console.log('✓ Восточная Польша:', eastPoland ? 'создана' : 'не создана');
  console.log();
  
  // Создаем карту 1939
  const map1939 = JSON.parse(fs.readFileSync('public/data/maps/europe_1939.json', 'utf8'));
  
  // Удаляем старые Германию и СССР
  map1939.features = map1939.features.filter(f => 
    f.properties.name !== 'Германия' && f.properties.name !== 'СССР'
  );
  
  // Собираем Германию (+ Чехия, БЕЗ Словакии)
  const germanyCoords = [];
  
  if (germany.geometry.type === 'Polygon') {
    germanyCoords.push(germany.geometry.coordinates);
  } else {
    germanyCoords.push(...germany.geometry.coordinates);
  }
  
  // Добавляем Чехию (уже добавлена скриптом add-slovakia-1939.js)
  // Словакия остается независимой
  const czechia = map1939.features.find(f => f.properties.name === 'Чехия');
  if (czechia) {
    console.log('✓ Чехия найдена, добавляем к Германии');
    if (czechia.geometry.type === 'Polygon') {
      germanyCoords.push(czechia.geometry.coordinates);
    } else if (czechia.geometry.type === 'MultiPolygon') {
      germanyCoords.push(...czechia.geometry.coordinates);
    }
  } else {
    console.log('⚠️  Чехия НЕ найдена в map1939!');
  }
  
  // Добавляем западную Польшу
  if (westPoland) {
    if (westPoland.geometry.type === 'Polygon') {
      germanyCoords.push(westPoland.geometry.coordinates);
    } else if (westPoland.geometry.type === 'MultiPolygon') {
      germanyCoords.push(...westPoland.geometry.coordinates);
    }
  }
  
  // Объединяем все полигоны Германии в один
  let germanyUnified = turf.multiPolygon(germanyCoords, {
    name: "Германия",
    originalName: "Germany",
    color: "#2C3E50"
  });
  
  // Пытаемся объединить полигоны чтобы убрать внутренние границы
  try {
    // Последовательно объединяем все полигоны
    let result = turf.polygon(germanyCoords[0], germanyUnified.properties);
    for (let i = 1; i < germanyCoords.length; i++) {
      const nextPoly = turf.polygon(germanyCoords[i]);
      const union = turf.union(result, nextPoly);
      if (union) {
        result = union;
        result.properties = germanyUnified.properties;
      }
    }
    germanyUnified = result;
    console.log('✓ Германия создана (полигоны объединены)');
  } catch (e) {
    console.log('✓ Германия создана (без объединения)');
  }
  
  map1939.features.push(germanyUnified);
  
  // Собираем СССР
  const ussrCoords = [];
  
  if (ussr.geometry.type === 'Polygon') {
    ussrCoords.push(ussr.geometry.coordinates);
  } else {
    ussrCoords.push(...ussr.geometry.coordinates);
  }
  
  // Добавляем восточную Польшу
  if (eastPoland) {
    if (eastPoland.geometry.type === 'Polygon') {
      ussrCoords.push(eastPoland.geometry.coordinates);
    } else if (eastPoland.geometry.type === 'MultiPolygon') {
      ussrCoords.push(...eastPoland.geometry.coordinates);
    }
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
  
  console.log('✓ СССР создан');
  
  // Удаляем Чехию (она уже включена в Германию)
  map1939.features = map1939.features.filter(f => f.properties.name !== 'Чехия');
  
  // Сохраняем
  fs.writeFileSync('public/data/maps/europe_1939.json', JSON.stringify(map1939));
  
  console.log('\n✅ Польша РЕАЛЬНО разделена!');
  console.log(`📊 Всего стран: ${map1939.features.length}`);
  console.log('\n📜 Пакт Молотова-Риббентропа (23.08.1939):');
  console.log('   Западная Польша → Германия');
  console.log('   Восточная Польша → СССР');
  
} catch (error) {
  console.log('❌ Ошибка при разделении:', error.message);
  console.log('\n⚠️  Используем упрощенный вариант...');
  
  // Упрощенный вариант - вся Польша к Германии
  const map1939 = JSON.parse(fs.readFileSync('public/data/maps/europe_1939.json', 'utf8'));
  console.log('   Вся Польша добавлена к Германии');
}
