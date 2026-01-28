const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/historical/world_bc323.geojson', 'utf8'));

console.log('📋 Все уникальные названия в world_bc323.geojson:\n');

const names = new Set();

data.features.forEach(f => {
  if (f.properties.NAME && f.properties.NAME !== 'null') {
    names.add(f.properties.NAME);
  }
});

const sortedNames = Array.from(names).sort();

sortedNames.forEach((name, i) => {
  console.log(`${i + 1}. ${name}`);
});

console.log(`\nВсего уникальных названий: ${sortedNames.length}`);
