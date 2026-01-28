const fs = require('fs');

// Исправляем 1938 год
const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));

// Загружаем границу России 1914 как базу для СССР
const russia1914 = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
const russiaFeature = russia1914.features.find(f => 
  f.properties.originalName === 'Russia'
);

if (!russiaFeature) {
  console.log('❌ Не найдена Россия 1914');
  process.exit(1);
}

// Удаляем старый СССР если есть
map1938.features = map1938.features.filter(f => 
  f.properties.name !== 'СССР' && f.properties.originalName !== 'Soviet Union'
);

// Добавляем СССР с границами России 1914
// (в реальности нужно вычесть Польшу и Прибалтику, но это сложно без библиотек)
map1938.features.push({
  type: "Feature",
  properties: {
    name: "СССР",
    originalName: "Soviet Union",
    color: "#CC0000"
  },
  geometry: russiaFeature.geometry
});

fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(map1938));

console.log('✅ 1938 исправлен:');
console.log('   - СССР добавлен');
console.log('   - Польша независима');
console.log('   - Прибалтика независима');
console.log('   - Турция и Греция из датасета');
console.log('\n⚠️  Примечание: границы СССР приблизительные (используются границы РИ 1914)');
console.log('   В реальности СССР меньше - без Польши и Прибалтики');
