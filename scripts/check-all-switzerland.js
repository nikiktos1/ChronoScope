const fs = require('fs');

console.log('🔍 Проверка Швейцарии во всех годах...\n');

const years = ['2010', '1994', '1960', '1945', '1938', '1930', '1920', '1914', '1900', '1815', '1492', '100'];

years.forEach(year => {
  try {
    const data = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
    const swiss = data.features.filter(f => (f.properties.NAME || '').toLowerCase().includes('switzerland'));
    
    if (swiss.length > 0) {
      const size = JSON.stringify(swiss[0].geometry).length;
      console.log(`${year}: ✅ ${swiss.length} объект(ов), размер геометрии: ${size} символов`);
    } else {
      console.log(`${year}: ❌ Швейцария не найдена`);
    }
  } catch(e) {
    console.log(`${year}: ⚠️ Файл не найден или ошибка чтения`);
  }
});

console.log('\n🎯 Проверка завершена!');
