const fs = require('fs');

console.log('🔧 Исправление карты 1914 года...\n');

const map1914 = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
const source = JSON.parse(fs.readFileSync('public/data/historical/world_1914.geojson', 'utf8'));

console.log('Текущая карта:', map1914.features.length, 'стран');

// Удаляем неправильные кавказские страны (в 1914 они часть России)
const toRemove = ['Азербайджан', 'Грузия', 'Армения'];
map1914.features = map1914.features.filter(f => 
  !toRemove.includes(f.properties.name)
);

console.log('Удалены кавказские страны (они часть России в 1914)');

// Ищем нужные страны в исходнике
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
  
  map1914.features.push({
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

// Ищем Данию и Норвегию
const denmark = source.features.filter(f => f.properties.SUBJECTO === 'Denmark');
const norway = source.features.filter(f => f.properties.SUBJECTO === 'Norway');

console.log('  - Дания:', denmark.length, 'частей');
console.log('  - Норвегия:', norway.length, 'частей');

console.log();
addCountry(spain, 'Испания', 'Spain', '#FFD700');
addCountry(britain, 'Великобритания', 'United Kingdom of Great Britain and Ireland', '#C8102E');
addCountry(ottoman, 'Османская империя', 'Ottoman Empire', '#8B4513');
addCountry(denmark, 'Дания', 'Denmark', '#C8102E');
addCountry(norway, 'Норвегия', 'Norway', '#EF2B2D');

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1914.json', JSON.stringify(map1914));

console.log('\n✅ Карта 1914 исправлена!');
console.log('📊 Всего стран:', map1914.features.length);
console.log('\n📝 Изменения:');
console.log('  + Добавлены: Испания, Великобритания, Османская империя, Дания, Норвегия');
console.log('  - Удалены: Азербайджан, Грузия, Армения (часть России в 1914)');