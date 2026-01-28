const fs = require('fs');

console.log('🔧 Исправление карты 1815 года...\n');

// Загружаем текущую карту и исходник
const map1815 = JSON.parse(fs.readFileSync('public/data/maps/europe_1815.json', 'utf8'));
const source = JSON.parse(fs.readFileSync('public/data/historical/world_1815.geojson', 'utf8'));

console.log('Текущая карта:', map1815.features.length, 'стран');

// Ищем Османскую империю
const ottoman = source.features.filter(f => 
  f.properties.SUBJECTO === 'Ottoman Empire'
);

// Ищем Королевство Обеих Сицилий
const sicily = source.features.filter(f => 
  f.properties.SUBJECTO === 'Kingdom of the Two Sicilies'
);

console.log('Найдено в исходнике:');
console.log('  - Османская империя:', ottoman.length, 'частей');
console.log('  - Королевство Обеих Сицилий:', sicily.length, 'частей');

// Добавляем Османскую империю
if (ottoman.length > 0) {
  const coords = [];
  ottoman.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      coords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      coords.push(...f.geometry.coordinates);
    }
  });
  
  map1815.features.push({
    type: "Feature",
    properties: {
      name: "Османская империя",
      originalName: "Ottoman Empire",
      color: "#8B4513"
    },
    geometry: {
      type: coords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: coords.length === 1 ? coords[0] : coords
    }
  });
  
  console.log('\n✓ Добавлена Османская империя');
}

// Добавляем Королевство Обеих Сицилий
if (sicily.length > 0) {
  const coords = [];
  sicily.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      coords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      coords.push(...f.geometry.coordinates);
    }
  });
  
  map1815.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Обеих Сицилий",
      originalName: "Kingdom of the Two Sicilies",
      color: "#FFD700"
    },
    geometry: {
      type: coords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: coords.length === 1 ? coords[0] : coords
    }
  });
  
  console.log('✓ Добавлено Королевство Обеих Сицилий');
}

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1815.json', JSON.stringify(map1815));

console.log('\n✅ Карта 1815 исправлена!');
console.log('📊 Всего стран:', map1815.features.length);
