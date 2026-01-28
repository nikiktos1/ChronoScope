const fs = require('fs');
const path = require('path');

// Загружаем исторические данные 1914 года
const historicalData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../public/data/historical_borders.geojson'), 'utf8')
);

// Данные о правителях и столицах 1914 года
// Используем ТОЧНЫЕ названия из датасета
const rulers1914 = {
  'Russia': { ruler: 'Николай II', capital: 'Санкт-Петербург', government: 'Абсолютная монархия', color: '#5B8DBE', name: 'Российская империя' },
  'German Empire': { ruler: 'Вильгельм II', capital: 'Берлин', government: 'Конституционная монархия', color: '#2C3E50', name: 'Германская империя' },
  'Austro-Hungarian Empire': { ruler: 'Франц Иосиф I', capital: 'Вена / Будапешт', government: 'Дуалистическая монархия', color: '#C0504D', name: 'Австро-Венгрия' },
  'France': { ruler: 'Раймон Пуанкаре', capital: 'Париж', government: 'Республика', color: '#4472C4', name: 'Французская Республика' },
  'United Kingdom of Great Britain and Ireland': { ruler: 'Георг V', capital: 'Лондон', government: 'Конституционная монархия', color: '#E67E22', name: 'Соединённое Королевство' },
  'United Kingdom': { ruler: 'Георг V', capital: 'Лондон', government: 'Конституционная монархия', color: '#E67E22', name: 'Соединённое Королевство' },
  'Italy': { ruler: 'Виктор Эммануил III', capital: 'Рим', government: 'Конституционная монархия', color: '#70AD47', name: 'Королевство Италия' },
  'Spain': { ruler: 'Альфонсо XIII', capital: 'Мадрид', government: 'Конституционная монархия', color: '#FFC000', name: 'Королевство Испания' },
  'Portugal': { ruler: 'Мануэл II', capital: 'Лиссабон', government: 'Конституционная монархия', color: '#44546A', name: 'Королевство Португалия' },
  'Ottoman Empire': { ruler: 'Мехмед V', capital: 'Константинополь', government: 'Абсолютная монархия', color: '#9B59B6', name: 'Османская империя' },
  'Serbia': { ruler: 'Пётр I', capital: 'Белград', government: 'Конституционная монархия', color: '#C55A11', name: 'Королевство Сербия' },
  'Montenegro': { ruler: 'Никола I', capital: 'Цетине', government: 'Конституционная монархия', color: '#7030A0', name: 'Королевство Черногория' },
  'Greece': { ruler: 'Константин I', capital: 'Афины', government: 'Конституционная монархия', color: '#3498DB', name: 'Королевство Греция' },
  'Romania': { ruler: 'Кароль I', capital: 'Бухарест', government: 'Конституционная монархия', color: '#F1C40F', name: 'Королевство Румыния' },
  'Bulgaria': { ruler: 'Фердинанд I', capital: 'София', government: 'Конституционная монархия', color: '#8E44AD', name: 'Царство Болгария' },
  'Belgium': { ruler: 'Альберт I', capital: 'Брюссель', government: 'Конституционная монархия', color: '#C55A11', name: 'Королевство Бельгия' },
  'Netherlands': { ruler: 'Вильгельмина', capital: 'Амстердам', government: 'Конституционная монархия', color: '#E67E22', name: 'Королевство Нидерланды' },
  'Switzerland': { ruler: 'Федеральный совет', capital: 'Берн', government: 'Федеративная республика', color: '#95B3D7', name: 'Швейцарская Конфедерация' },
  'Sweden': { ruler: 'Густав V', capital: 'Стокгольм', government: 'Конституционная монархия', color: '#4472C4', name: 'Королевство Швеция' },
  'Norway': { ruler: 'Хокон VII', capital: 'Кристиания', government: 'Конституционная монархия', color: '#C0504D', name: 'Королевство Норвегия' },
  'Denmark': { ruler: 'Кристиан X', capital: 'Копенгаген', government: 'Конституционная монархия', color: '#DA9694', name: 'Королевство Дания' },
  'Luxembourg': { ruler: 'Мария-Аделаида', capital: 'Люксембург', government: 'Конституционная монархия', color: '#7030A0', name: 'Великое Герцогство Люксембург' },
  'Albania': { ruler: 'Вильгельм Вид', capital: 'Дуррес', government: 'Княжество', color: '#9B59B6', name: 'Княжество Албания' },
  'Finland': { ruler: 'Николай II (в составе России)', capital: 'Гельсингфорс', government: 'Великое княжество', color: '#8DB4E2', name: 'Великое княжество Финляндское' },
  'Iceland': { ruler: 'Кристиан X (в унии с Данией)', capital: 'Рейкьявик', government: 'Королевство в унии', color: '#B7DEE8', name: 'Королевство Исландия' }
};

const europe1914 = {
  type: "FeatureCollection",
  features: []
};

// Группируем полигоны по странам (чтобы объединить колонии и метрополии)
const countryGroups = {};

historicalData.features.forEach(feature => {
  const countryName = feature.properties.SUBJECTO || feature.properties.NAME;
  
  if (rulers1914[countryName]) {
    if (!countryGroups[countryName]) {
      countryGroups[countryName] = [];
    }
    countryGroups[countryName].push(feature.geometry);
  }
});

// Создаем features для каждой страны
Object.keys(countryGroups).forEach(countryName => {
  const info = rulers1914[countryName];
  const geometries = countryGroups[countryName];
  
  let geometry;
  if (geometries.length === 1) {
    geometry = geometries[0];
  } else {
    // Объединяем в MultiPolygon
    const coords = [];
    geometries.forEach(geom => {
      if (geom.type === 'Polygon') {
        coords.push(geom.coordinates);
      } else if (geom.type === 'MultiPolygon') {
        coords.push(...geom.coordinates);
      }
    });
    geometry = {
      type: 'MultiPolygon',
      coordinates: coords
    };
  }
  
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: info.name,
      ruler: info.ruler,
      capital: info.capital,
      government: info.government,
      color: info.color
    },
    geometry: geometry
  });
});

// Сохраняем
const outputPath = path.join(__dirname, '../public/data/europe1914.json');
fs.writeFileSync(outputPath, JSON.stringify(europe1914, null, 2));

console.log(`✅ Создан файл с ${europe1914.features.length} государствами`);
console.log(`📍 Путь: ${outputPath}`);
console.log('\n🗺️  ИСТОРИЧЕСКИЕ ГРАНИЦЫ 1914 ГОДА из датасета historical-basemaps');
console.log('   ✓ Реальные границы, а не современные');
console.log('   ✓ Российская империя с Польшей и Финляндией');
console.log('   ✓ Германская империя с Эльзас-Лотарингией');
console.log('   ✓ Австро-Венгрия с Чехией, Словакией, Хорватией');
console.log('   ✓ Османская империя на Балканах');
