const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/historical/world_bc323.geojson', 'utf8'));

console.log('✅ Проверка перевода world_bc323.geojson\n');

const withNames = data.features.filter(f => f.properties.name);
const withOriginalNames = data.features.filter(f => f.properties.originalName);

console.log(`Всего объектов: ${data.features.length}`);
console.log(`С переведенными названиями: ${withNames.length}`);
console.log(`С оригинальными названиями: ${withOriginalNames.length}`);

console.log('\n📋 Примеры переведенных названий:\n');

const examples = withNames.slice(0, 20);
examples.forEach((f, i) => {
  console.log(`${i + 1}. ${f.properties.name}`);
  console.log(`   (${f.properties.originalName})`);
});

// Проверяем, есть ли непереведенные английские названия
console.log('\n🔍 Проверка на английские названия в поле name:\n');

let englishFound = 0;
data.features.forEach((f, i) => {
  if (f.properties.name && /[A-Za-z]/.test(f.properties.name) && !/[А-Яа-я]/.test(f.properties.name)) {
    console.log(`⚠️  ${i + 1}. ${f.properties.name}`);
    englishFound++;
  }
});

if (englishFound === 0) {
  console.log('✅ Все названия переведены на русский!');
}
