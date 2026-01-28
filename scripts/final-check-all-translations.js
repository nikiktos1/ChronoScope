const fs = require('fs');

console.log('🔍 ФИНАЛЬНАЯ ПРОВЕРКА ВСЕХ ПЕРЕВОДОВ\n');
console.log('='.repeat(70));

// Проверяем world_bc323.geojson
console.log('\n📄 Файл: world_bc323.geojson');
console.log('-'.repeat(70));

const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_bc323.geojson', 'utf8'));

const withNames = worldData.features.filter(f => f.properties.name);
const withEnglish = worldData.features.filter(f => {
  const name = f.properties.name;
  return name && /[A-Za-z]/.test(name) && !/[А-Яа-я]/.test(name);
});

console.log(`✅ Всего объектов: ${worldData.features.length}`);
console.log(`✅ С переведенными названиями: ${withNames.length}`);
console.log(`${withEnglish.length === 0 ? '✅' : '❌'} Непереведенных английских названий: ${withEnglish.length}`);

if (withEnglish.length > 0) {
  console.log('\n⚠️  Непереведенные названия:');
  withEnglish.forEach(f => {
    console.log(`   - ${f.properties.name}`);
  });
}

// Проверяем europe_-323.json
console.log('\n📄 Файл: europe_-323.json');
console.log('-'.repeat(70));

const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_-323.json', 'utf8'));

const europeWithNames = europeData.features.filter(f => f.properties.name);
const europeWithEnglish = europeData.features.filter(f => {
  const name = f.properties.name;
  return name && /[A-Za-z]/.test(name) && !/[А-Яа-я]/.test(name);
});

console.log(`✅ Всего объектов: ${europeData.features.length}`);
console.log(`✅ С переведенными названиями: ${europeWithNames.length}`);
console.log(`${europeWithEnglish.length === 0 ? '✅' : '❌'} Непереведенных английских названий: ${europeWithEnglish.length}`);

if (europeWithEnglish.length > 0) {
  console.log('\n⚠️  Непереведенные названия:');
  europeWithEnglish.forEach(f => {
    console.log(`   - ${f.properties.name}`);
  });
}

// Проверяем компонент Map1914.tsx
console.log('\n📄 Файл: components/Map1914.tsx');
console.log('-'.repeat(70));

const mapComponent = fs.readFileSync('components/Map1914.tsx', 'utf8');

if (mapComponent.includes('const countryName = name || NAME')) {
  console.log('✅ Приоритет отдается переведенному полю "name"');
} else if (mapComponent.includes('const countryName = NAME || name')) {
  console.log('⚠️  Приоритет отдается полю "NAME" (английское)');
} else {
  console.log('❓ Не удалось определить приоритет полей');
}

// Итоговый отчет
console.log('\n' + '='.repeat(70));
console.log('\n📊 ИТОГОВЫЙ РЕЗУЛЬТАТ:\n');

const allGood = withEnglish.length === 0 && 
                europeWithEnglish.length === 0 && 
                mapComponent.includes('const countryName = name || NAME');

if (allGood) {
  console.log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!');
  console.log('✅ Все названия переведены на русский язык');
  console.log('✅ Компонент карты настроен правильно');
  console.log('✅ Карта 323 до н.э. готова к использованию\n');
} else {
  console.log('⚠️  ОБНАРУЖЕНЫ ПРОБЛЕМЫ!');
  console.log('   Проверьте детали выше\n');
}
