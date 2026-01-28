const fs = require('fs');

console.log('🔧 Исправление карты 800 года...\n');

// Загружаем исходник
const source = JSON.parse(fs.readFileSync('public/data/historical/world_800.geojson', 'utf8'));

// Основные государства 800 года (эпоха Карла Великого)
const majorStates = [
  'Carolingian Empire',
  'Byzantine Empire', 
  'Abbasid Caliphate',
  'Emirate of Córdoba',
  'Asturias',
  'Bulgars',
  'Avars',
  'Khazars'
];

// Фильтруем только крупные государства
const filtered = source.features.filter(f => {
  const name = f.properties.SUBJECTO || f.properties.NAME;
  return majorStates.some(state => name && name.includes(state));
});

console.log('Исходных объектов:', source.features.length);
console.log('Отфильтровано:', filtered.length);

// Группируем по государствам
const grouped = {};
filtered.forEach(f => {
  const name = f.properties.SUBJECTO || f.properties.NAME;
  if (!grouped[name]) {
    grouped[name] = [];
  }
  
  if (f.geometry.type === 'Polygon') {
    grouped[name].push(f.geometry.coordinates);
  } else if (f.geometry.type === 'MultiPolygon') {
    grouped[name].push(...f.geometry.coordinates);
  }
});

// Переводы названий
const translations = {
  'Carolingian Empire': 'Франкская империя',
  'Byzantine Empire': 'Византийская империя',
  'Abbasid Caliphate': 'Аббасидский халифат',
  'Emirate of Córdoba': 'Кордовский эмират',
  'Asturias': 'Астурия',
  'Bulgars': 'Болгария',
  'Avars': 'Аварский каганат',
  'Khazars': 'Хазарский каганат'
};

// Цвета
const colors = {
  'Carolingian Empire': '#4169E1',
  'Byzantine Empire': '#9370DB',
  'Abbasid Caliphate': '#228B22',
  'Emirate of Córdoba': '#32CD32',
  'Asturias': '#FFD700',
  'Bulgars': '#DC143C',
  'Avars': '#8B4513',
  'Khazars': '#FF8C00'
};

// Создаем новую карту
const map800 = {
  type: "FeatureCollection",
  year: 800,
  name: "Империя Карла Великого",
  features: []
};

Object.keys(grouped).forEach(name => {
  const coords = grouped[name];
  const russianName = translations[name] || name;
  
  map800.features.push({
    type: "Feature",
    properties: {
      name: russianName,
      originalName: name,
      color: colors[name] || '#808080'
    },
    geometry: {
      type: coords.length === 1 ? 'Polygon' : 'MultiPolygon',
      coordinates: coords.length === 1 ? coords[0] : coords
    }
  });
});

// Сохраняем
fs.writeFileSync('public/data/maps/europe_800.json', JSON.stringify(map800));

console.log('\n✅ Карта 800 исправлена!');
console.log('📊 Государств:', map800.features.length);
console.log('\n🗺️  Основные империи:');
map800.features.forEach(f => console.log('  -', f.properties.name));
