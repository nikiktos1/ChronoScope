const fs = require('fs');

console.log('🔧 Исправление карты 1880 года...\n');

const map1880 = JSON.parse(fs.readFileSync('public/data/maps/europe_1880.json', 'utf8'));
const source = JSON.parse(fs.readFileSync('public/data/historical/world_1880.geojson', 'utf8'));

console.log('Текущая карта:', map1880.features.length, 'стран');

// Ищем нужные страны
const spain = source.features.filter(f => f.properties.SUBJECTO === 'Spain');
const britain = source.features.filter(f => 
  f.properties.SUBJECTO === 'United Kingdom of Great Britain and Ireland'
);
const ottoman = source.features.filter(f => f.properties.SUBJECTO === 'Ottoman Empire');

console.log('\nНайдено в исходнике:');
console.log('  - Испания:', spain.length, 'частей');
console.log('  - Британия:', britain.length, 'частей');
console.log('  - Османская империя:', ottoman.length, 'частей');

// Функция для добавления страны
function addCountry(features, name, originalName, color) {
  if (features.length === 0) return;
  
  const coords = [];
  features.forEach(f => {
    if (f.geometry.type === 'Polygon') {
      coords.push(f.geometry.coordinates);
    } else if (f.geometry.type === 'MultiPolygon') {
      coords.push(...f.geometry.coordinates);
    }
  });
  
  map1880.features.push({
    type: "Feature",
    properties: {
      name: name,
      originalName: originalName,
      color: color
    },
    geometry: {
      type: coords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: coords.length === 1 ? coords[0] : coords
    }
  });
  
  console.log('✓ Добавлена', name);
}

console.log();
addCountry(spain, 'Испания', 'Spain', '#FFD700');
addCountry(britain, 'Великобритания', 'United Kingdom of Great Britain and Ireland', '#C8102E');
addCountry(ottoman, 'Османская империя', 'Ottoman Empire', '#8B4513');

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1880.json', JSON.stringify(map1880));

console.log('\n✅ Карта 1880 исправлена!');
console.log('📊 Всего стран:', map1880.features.length);
