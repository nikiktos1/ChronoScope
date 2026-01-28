const fs = require('fs');

console.log('🌍 Проверка world_bc323.geojson...\n');

const data = JSON.parse(fs.readFileSync('public/data/historical/world_bc323.geojson', 'utf8'));

console.log('Всего объектов:', data.features.length);
console.log('\nПервые 30 объектов:\n');

data.features.slice(0, 30).forEach((f, i) => {
  const props = f.properties;
  console.log(`${i + 1}. NAME: ${props.NAME || 'null'}`);
  console.log(`   name: ${props.name || 'нет'}`);
  console.log(`   CONTROL: ${props.CONTROL || 'null'}`);
  console.log('');
});
