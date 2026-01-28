const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/maps/europe_-323.json', 'utf8'));

console.log('📊 Проверка карты 323 до н.э.\n');
console.log('Всего стран:', data.features.length);
console.log('\n📋 Список стран:\n');

data.features.forEach((f, i) => {
  const props = f.properties;
  console.log(`${i+1}. ${props.name}`);
  console.log(`   Оригинал: ${props.originalName || 'не указан'}`);
  console.log(`   Правитель: ${props.ruler || 'не указан'}`);
  console.log(`   Столица: ${props.capital || 'не указана'}`);
  console.log(`   Форма правления: ${props.government || 'не указана'}`);
  console.log(`   Описание: ${props.description || 'нет'}`);
  console.log('');
});

console.log('\n✅ Проверка завершена!');
