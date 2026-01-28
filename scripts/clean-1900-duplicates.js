const fs = require('fs');

console.log('🧹 Удаление дублированных территорий из карты 1900 года...\n');

// Загружаем данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1900.json', 'utf8'));

console.log('Территорий до очистки:', data.features.length);

// Находим дубликаты
const duplicates = [];
const seen = new Set();

data.features.forEach((feature, index) => {
  const name = feature.properties.name;
  if (seen.has(name)) {
    duplicates.push({ index, name, originalName: feature.properties.originalName });
  } else {
    seen.add(name);
  }
});

console.log('Найдено дубликатов:', duplicates.length);
duplicates.forEach(dup => {
  console.log(`- ${dup.name} (${dup.originalName || 'без оригинала'}) на позиции ${dup.index}`);
});

// Удаляем дубликаты (оставляем первое вхождение)
const uniqueFeatures = [];
const namesSeen = new Set();

data.features.forEach(feature => {
  const name = feature.properties.name;
  if (!namesSeen.has(name)) {
    uniqueFeatures.push(feature);
    namesSeen.add(name);
  } else {
    console.log(`🗑️  Удален дубликат: ${name}`);
  }
});

// Обновляем данные
data.features = uniqueFeatures;

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1900.json', JSON.stringify(data, null, 2));

console.log('\n✅ Очистка завершена!');
console.log('Территорий после очистки:', data.features.length);
console.log('Удалено дубликатов:', duplicates.length);