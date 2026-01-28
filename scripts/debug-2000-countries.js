const fs = require('fs');

console.log('🔍 Детальный анализ стран в данных 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Общее количество территорий: ${worldData.features.length}\n`);
  
  // Функция для поиска стран
  function findCountries(searchTerms) {
    return worldData.features.filter(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
      const partof = (f.properties.PARTOF || '').toLowerCase();
      
      return searchTerms.some(term => 
        name.includes(term.toLowerCase()) || 
        subjecto.includes(term.toLowerCase()) ||
        abbrevn.includes(term.toLowerCase()) ||
        partof.includes(term.toLowerCase())
      );
    });
  }
  
  // Проверяем каждую страну
  console.log('🇨🇭 ШВЕЙЦАРИЯ:');
  const switzerland = findCountries(['switzerland', 'швейцария']);
  if (switzerland.length > 0) {
    switzerland.forEach((country, i) => {
      console.log(`  ${i + 1}. NAME: "${country.properties.NAME}"`);
      console.log(`     SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`     ABBREVN: "${country.properties.ABBREVN}"`);
      console.log(`     PARTOF: "${country.properties.PARTOF}"`);
      console.log(`     Геометрия: ${country.geometry.type}, координат: ${JSON.stringify(country.geometry).length} символов`);
      console.log('');
    });
  } else {
    console.log('  ❌ НЕ НАЙДЕНА\n');
  }
  
  console.log('🇳🇴 НОРВЕГИЯ:');
  const norway = findCountries(['norway', 'норвегия']);
  if (norway.length > 0) {
    norway.forEach((country, i) => {
      console.log(`  ${i + 1}. NAME: "${country.properties.NAME}"`);
      console.log(`     SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`     ABBREVN: "${country.properties.ABBREVN}"`);
      console.log(`     PARTOF: "${country.properties.PARTOF}"`);
      console.log(`     Геометрия: ${country.geometry.type}, координат: ${JSON.stringify(country.geometry).length} символов`);
      console.log('');
    });
  } else {
    console.log('  ❌ НЕ НАЙДЕНА\n');
  }
  
  console.log('🇩🇰 ДАНИЯ И ГРЕНЛАНДИЯ:');
  const denmark = findCountries(['denmark', 'дания', 'greenland', 'гренландия']);
  if (denmark.length > 0) {
    denmark.forEach((country, i) => {
      console.log(`  ${i + 1}. NAME: "${country.properties.NAME}"`);
      console.log(`     SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`     ABBREVN: "${country.properties.ABBREVN}"`);
      console.log(`     PARTOF: "${country.properties.PARTOF}"`);
      console.log(`     Геометрия: ${country.geometry.type}, координат: ${JSON.stringify(country.geometry).length} символов`);
      console.log('');
    });
  } else {
    console.log('  ❌ НЕ НАЙДЕНА\n');
  }
  
  console.log('🇷🇺 РОССИЯ:');
  const russia = findCountries(['russia', 'russian', 'россия', 'рф']);
  if (russia.length > 0) {
    russia.forEach((country, i) => {
      console.log(`  ${i + 1}. NAME: "${country.properties.NAME}"`);
      console.log(`     SUBJECTO: "${country.properties.SUBJECTO}"`);
      console.log(`     ABBREVN: "${country.properties.ABBREVN}"`);
      console.log(`     PARTOF: "${country.properties.PARTOF}"`);
      console.log(`     Геометрия: ${country.geometry.type}, координат: ${JSON.stringify(country.geometry).length} символов`);
      console.log('');
    });
  } else {
    console.log('  ❌ НЕ НАЙДЕНА\n');
  }
  
  // Показываем все уникальные названия стран для справки
  console.log('📋 СПИСОК ВСЕХ СТРАН В ДАННЫХ 2000 ГОДА:');
  const allCountries = worldData.features
    .map(f => f.properties.NAME || f.properties.SUBJECTO || 'Unnamed')
    .sort()
    .filter((name, index, arr) => arr.indexOf(name) === index);
  
  allCountries.forEach((name, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${name}`);
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Анализ завершен!');