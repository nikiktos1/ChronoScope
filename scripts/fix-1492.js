const fs = require('fs');

console.log('🔧 Перевод карты 1492 года...\n');

const map = JSON.parse(fs.readFileSync('public/data/maps/europe_1492.json', 'utf8'));

// Переводы
const translations = {
  'Cyprus': 'Кипр',
  'Denmark-Norway': 'Дания-Норвегия',
  'England': 'Англия',
  'Scottland': 'Шотландия',
  'Scotland': 'Шотландия',
  'Papal States': 'Папская область',
  'Venice': 'Венеция',
  'Genoa': 'Генуя',
  'Milan': 'Милан',
  'Florence': 'Флоренция',
  'Naples': 'Неаполь',
  'Aragon': 'Арагон',
  'Aragón': 'Арагон',
  'Castile': 'Кастилия',
  'Castille': 'Кастилия',
  'Granada': 'Гранада',
  'Navarre': 'Наварра',
  'Holy Roman Empire': 'Священная Римская империя',
  'Poland-Lithuania': 'Польша-Литва',
  'Teutonic Order': 'Тевтонский орден',
  'Teutonic Knights': 'Тевтонский орден',
  'Livonian Order': 'Ливонский орден',
  'Hungary': 'Венгрия',
  'Imperial Hungary': 'Венгрия',
  'Bohemia': 'Богемия',
  'Ottoman Empire': 'Османская империя',
  'Mamluk Sultanate': 'Мамлюкский султанат',
  'Muscovy': 'Московия',
  'Grand Duchy of Moscow': 'Великое княжество Московское',
  'Golden Horde': 'Золотая Орда',
  'Crimean Khanate': 'Крымское ханство',
  'Kazan Khanate': 'Казанское ханство',
  'Astrakhan Khanate': 'Астраханское ханство',
  'Nogai Horde': 'Ногайская Орда',
  'Safavid Empire': 'Государство Сефевидов',
  'Timurid Empire': 'Империя Тимуридов',
  'White Horde': 'Белая Орда',
  'Khanate of Sibir': 'Сибирское ханство',
  'Ryazan': 'Рязанское княжество',
  'Pskov': 'Псковская республика',
  'Swiss Confederation': 'Швейцарская конфедерация',
  'Britany': 'Бретань',
  'Brittany': 'Бретань',
  'Wattasid Caliphate': 'Ваттасидский халифат',
  'Hafsid Caliphate': 'Хафсидский халифат',
  'Sámi': 'Саамы'
};

// Переводим названия
map.features.forEach(f => {
  const origName = f.properties.originalName || f.properties.name;
  if (translations[origName]) {
    f.properties.name = translations[origName];
    f.properties.originalName = origName;
  }
});

// Сохраняем
fs.writeFileSync('public/data/maps/europe_1492.json', JSON.stringify(map));

console.log('✅ Карта 1492 переведена!');
console.log('📊 Всего стран:', map.features.length);
console.log('\n🗺️  Основные государства:');
map.features.forEach(f => console.log('  -', f.properties.name));
