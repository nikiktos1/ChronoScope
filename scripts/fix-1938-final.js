const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление 1938 года...\n');

// Загружаем карту 1938
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));

// Загружаем исходные данные 1945 для правильных границ Турции и Греции
const source1945 = JSON.parse(fs.readFileSync('public/data/historical/world_1945.geojson', 'utf8'));

// Загружаем Россию 1914 как базу для СССР
const russia1914 = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
const russiaFeature = russia1914.features.find(f => f.properties.originalName === 'Russia');

if (!russiaFeature) {
  console.log('❌ Не найдена Россия 1914');
  process.exit(1);
}

// Удаляем старые Турцию, Грецию и СССР
map1938.features = map1938.features.filter(f => 
  f.properties.name !== 'Турция' && 
  f.properties.name !== 'Греция' &&
  f.properties.name !== 'СССР' &&
  f.properties.originalName !== 'Turkey' &&
  f.properties.originalName !== 'Greece' &&
  f.properties.originalName !== 'Soviet Union'
);

console.log('✓ Удалены старые Турция, Греция и СССР');

// Сначала добавляем СССР (он будет "под" Турцией и Грецией)
const source1938 = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
const ussr1938 = source1938.features.filter(f => 
  f.properties.SUBJECTO && f.properties.SUBJECTO.includes('USSR')
);

if (ussr1938.length > 0) {
  const ussrCoords = [];
  ussr1938.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      ussrCoords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      ussrCoords.push(...f.geometry.coordinates);
    }
  });
  
  map1938.features.push({
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
  console.log('✓ Добавлен СССР с правильными границами 1938');
}

// Теперь добавляем Турцию и Грецию (они будут "поверх" СССР)
const turkey1945 = source1945.features.filter(f => f.properties.SUBJECTO === 'Turkey');
const greece1945 = source1945.features.filter(f => f.properties.SUBJECTO === 'Greece');

// Обрабатываем Турцию
if (turkey1945.length > 0) {
  const turkeyCoords = [];
  turkey1945.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      turkeyCoords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      turkeyCoords.push(...f.geometry.coordinates);
    }
  });
  
  map1938.features.push({
    type: "Feature",
    properties: {
      name: "Турция",
      originalName: "Turkey",
      color: "#9B59B6"
    },
    geometry: {
      type: turkeyCoords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: turkeyCoords.length === 1 ? turkeyCoords[0] : turkeyCoords
    }
  });
  console.log('✓ Добавлена Турция с правильными границами (1923)');
}

// Обрабатываем Грецию
if (greece1945.length > 0) {
  const greeceCoords = [];
  greece1945.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      greeceCoords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      greeceCoords.push(...f.geometry.coordinates);
    }
  });
  
  map1938.features.push({
    type: "Feature",
    properties: {
      name: "Греция",
      originalName: "Greece",
      color: "#3498DB"
    },
    geometry: {
      type: greeceCoords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: greeceCoords.length === 1 ? greeceCoords[0] : greeceCoords
    }
  });
  console.log('✓ Добавлена Греция с правильными границами (1923)');
}

console.log('\n⚠️  Примечание: Турция и Греция добавлены последними');
console.log('   Они будут отображаться поверх СССР на Кавказе');

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(map1938));

console.log('\n✅ 1938 исправлен! Всего стран:', map1938.features.length);
