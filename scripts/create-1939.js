const fs = require('fs');
const path = require('path');

console.log('🗺️  Создание карты 1939 года...\n');

// 1939 - начало Второй мировой войны
// Ключевые события:
// - Март: Германия аннексировала Чехию (Протекторат Богемии и Моравии)
// - Сентябрь: Германия напала на Польшу
// - Сентябрь: СССР вошел в Восточную Польшу
// - Ноябрь: СССР напал на Финляндию (Зимняя война)

// Загружаем карту 1938 как базу
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));

// Создаем карту 1939
const map1939 = {
  type: "FeatureCollection",
  year: 1939,
  name: "Начало Второй мировой",
  features: []
};

// Копируем все страны из 1938, кроме тех, что изменились
const excludeCountries = ['Польша', 'Чехословакия', 'СССР', 'Германия'];

map1938.features.forEach(f => {
  if (!excludeCountries.includes(f.properties.name)) {
    map1939.features.push(f);
  }
});

console.log('✓ Скопированы неизменные страны из 1938');

// Загружаем исходные данные
const source1938 = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));

// Получаем все нужные страны
const germany1938 = map1938.features.find(f => f.properties.name === 'Германия');
const ussr1938 = map1938.features.find(f => f.properties.name === 'СССР');

// Германия уже включает Судеты (с 1938)
// В 1939 Германия аннексирует только ЧЕХИЮ (без Словакии)
// Словакия станет независимой (добавим отдельным скриптом)

// Германия - просто копируем из 1938 (Судеты уже включены)
if (germany1938) {
  map1939.features.push(germany1938);
  console.log('✓ Германия (с Судетами из 1938)');
}

// СССР - оставляем как в 1938
if (ussr1938) {
  map1939.features.push(ussr1938);
  console.log('✓ СССР (без изменений)');
}

console.log('\n⚠️  Примечание: Чехия и Польша будут добавлены отдельными скриптами');
console.log('   - Чехия → к Германии (скрипт split-poland-real.js)');
console.log('   - Польша → разделена между Германией и СССР (скрипт split-poland-real.js)');
console.log('   - Словакия → независимая (скрипт add-slovakia-1939.js)');

// Сохраняем
const outputPath = path.join(__dirname, '../public/data/maps/europe_1939.json');
fs.writeFileSync(outputPath, JSON.stringify(map1939));

console.log('\n✅ Карта 1939 создана!');
console.log(`📍 Путь: ${outputPath}`);
console.log(`📊 Всего стран: ${map1939.features.length}`);
console.log('\n📅 Ключевые изменения:');
console.log('   - Германия аннексировала Чехословакию');
console.log('   - Польша разделена между Германией и СССР');
console.log('   - СССР получил Восточную Польшу');
