const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/maps/europe_-323.json', 'utf8'));

console.log('🔍 Поиск непереведенных названий...\n');

let found = 0;

data.features.forEach((f, i) => {
  const name = f.properties.name;
  
  // Проверяем, есть ли английские буквы и нет ли русских
  const hasEnglish = /[A-Za-z]/.test(name);
  const hasRussian = /[А-Яа-я]/.test(name);
  
  if (hasEnglish && !hasRussian) {
    console.log(`${i + 1}. "${name}"`);
    console.log(`   originalName: ${f.properties.originalName || 'не указан'}`);
    console.log('');
    found++;
  }
});

if (found === 0) {
  console.log('✅ Все названия переведены!');
} else {
  console.log(`⚠️  Найдено непереведенных: ${found}`);
}
