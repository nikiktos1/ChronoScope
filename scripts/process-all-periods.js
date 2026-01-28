const fs = require('fs');
const path = require('path');

// Локализация названий
const countryNames = {
  'Russia': 'Российская империя',
  'Soviet Union': 'СССР',
  'Russian Federation': 'Российская Федерация',
  'German Empire': 'Германская империя',
  'Germany': 'Германия',
  'Austro-Hungarian Empire': 'Австро-Венгрия',
  'Austria': 'Австрия',
  'Hungary': 'Венгрия',
  'Ottoman Empire': 'Османская империя',
  'Turkey': 'Турция',
  'Roman Empire': 'Римская империя',
  'Byzantine Empire': 'Византийская империя',
  'Holy Roman Empire': 'Священная Римская империя',
  'France': 'Франция',
  'United Kingdom': 'Великобритания',
  'United Kingdom of Great Britain and Ireland': 'Соединённое Королевство',
  'Spain': 'Испания',
  'Portugal': 'Португалия',
  'Italy': 'Италия',
  'Belgium': 'Бельгия',
  'Netherlands': 'Нидерланды',
  'Luxembourg': 'Люксембург',
  'Switzerland': 'Швейцария',
  'Sweden': 'Швеция',
  'Norway': 'Норвегия',
  'Denmark': 'Дания',
  'Finland': 'Финляндия',
  'Iceland': 'Исландия',
  'Poland': 'Польша',
  'Czechoslovakia': 'Чехословакия',
  'Czech Republic': 'Чехия',
  'Slovakia': 'Словакия',
  'Ukraine': 'Украина',
  'Belarus': 'Беларусь',
  'Moldova': 'Молдова',
  'Lithuania': 'Литва',
  'Latvia': 'Латвия',
  'Estonia': 'Эстония',
  'Yugoslavia': 'Югославия',
  'Serbia': 'Сербия',
  'Croatia': 'Хорватия',
  'Bosnia and Herzegovina': 'Босния и Герцеговина',
  'Slovenia': 'Словения',
  'Montenegro': 'Черногория',
  'Albania': 'Албания',
  'Macedonia': 'Македония',
  'Greece': 'Греция',
  'Romania': 'Румыния',
  'Bulgaria': 'Болгария',
  'Prussia': 'Пруссия',
  'Bavaria': 'Бавария',
  'Saxony': 'Саксония',
  'Ireland': 'Ирландия',
  'Malta': 'Мальта',
  'Georgia': 'Грузия',
  'Armenia': 'Армения',
  'Azerbaijan': 'Азербайджан',
  'Persia': 'Персия',
  'Morocco': 'Марокко'
};

function getLocalizedName(name) {
  return countryNames[name] || name;
}

// Маппинг периодов
const periods = [
  { file: 'bc323', year: -323, name: 'Империя Александра' },
  { file: '100', year: 100, name: 'Римская империя' },
  { file: '800', year: 800, name: 'Империя Карла Великого' },
  { file: '1492', year: 1492, name: 'Открытие Америки' },
  { file: '1815', year: 1815, name: 'Венский конгресс' },
  { file: '1880', year: 1880, name: 'Колониальные империи' },
  { file: '1900', year: 1900, name: 'Belle Époque' },
  { file: '1914', year: 1914, name: 'Первая мировая' },
  { file: '1920', year: 1920, name: 'Версальский мир' },
  { file: '1938', year: 1938, name: 'Накануне войны' },
  { file: '1945', year: 1945, name: 'Конец войны' },
  { file: '2000', year: 2000, name: 'Современность' }
];

// Границы Европы для фильтрации
const europeBounds = {
  minLat: 35,
  maxLat: 72,
  minLon: -25,
  maxLon: 50
};

// Функция проверки, находится ли страна в Европе
function isInEurope(geometry) {
  if (!geometry || !geometry.coordinates) return false;
  
  try {
    let coords = [];
    if (geometry.type === 'Polygon') {
      coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates[0][0];
    }
    
    if (!coords || coords.length === 0) return false;
    
    // Проверяем первую координату
    const [lon, lat] = coords[0];
    return lat >= europeBounds.minLat && lat <= europeBounds.maxLat &&
           lon >= europeBounds.minLon && lon <= europeBounds.maxLon;
  } catch (e) {
    return false;
  }
}

// Цвета для стран (если нет в списке - генерируем)
const countryColors = {
  'Russia': '#5B8DBE',
  'Soviet Union': '#CC0000',
  'German Empire': '#2C3E50',
  'Germany': '#2C3E50',
  'Austro-Hungarian Empire': '#C0504D',
  'Austria': '#C0504D',
  'Hungary': '#70AD47',
  'France': '#4472C4',
  'United Kingdom': '#E67E22',
  'United Kingdom of Great Britain and Ireland': '#E67E22',
  'Italy': '#70AD47',
  'Spain': '#FFC000',
  'Portugal': '#44546A',
  'Ottoman Empire': '#9B59B6',
  'Turkey': '#9B59B6',
  'Roman Empire': '#8B0000',
  'Byzantine Empire': '#9B59B6',
  'Holy Roman Empire': '#FFD700',
  'Poland': '#DC143C',
  'Sweden': '#4472C4',
  'Norway': '#C0504D',
  'Denmark': '#DA9694',
  'Finland': '#8DB4E2',
  'Greece': '#3498DB',
  'Romania': '#F1C40F',
  'Bulgaria': '#8E44AD',
  'Serbia': '#C55A11',
  'Yugoslavia': '#4169E1',
  'Czechoslovakia': '#4682B4',
  'Czech Republic': '#4682B4',
  'Slovakia': '#87CEEB',
  'Belgium': '#C55A11',
  'Netherlands': '#E67E22',
  'Switzerland': '#95B3D7',
  'Albania': '#9B59B6',
  'Croatia': '#FF6347',
  'Bosnia and Herzegovina': '#8FBC8F',
  'Slovenia': '#90EE90',
  'Macedonia': '#FFD700',
  'Montenegro': '#7030A0',
  'Lithuania': '#FFB6C1',
  'Latvia': '#DDA0DD',
  'Estonia': '#B0C4DE',
  'Belarus': '#F0E68C',
  'Ukraine': '#FFD700',
  'Moldova': '#9370DB',
  'Iceland': '#B7DEE8',
  'Ireland': '#228B22',
  'Luxembourg': '#7030A0'
};

function getCountryColor(name) {
  return countryColors[name] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

console.log(`🗺️  Обработка ${periods.length} периодов...\n`);

periods.forEach(period => {
  const inputPath = path.join(__dirname, `../public/data/historical/world_${period.file}.geojson`);
  const outputPath = path.join(__dirname, `../public/data/maps/europe_${period.year}.json`);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Пропущен: ${period.name} (файл не найден)`);
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const europeMap = {
    type: "FeatureCollection",
    year: period.year,
    name: period.name,
    features: []
  };
  
  const countryGroups = {};
  
  data.features.forEach(feature => {
    const countryName = feature.properties.SUBJECTO || feature.properties.NAME;
    
    // Фильтруем только европейские страны по географии
    if (countryName && isInEurope(feature.geometry)) {
      if (!countryGroups[countryName]) {
        countryGroups[countryName] = [];
      }
      countryGroups[countryName].push(feature.geometry);
    }
  });
  
  Object.keys(countryGroups).forEach(countryName => {
    const geometries = countryGroups[countryName];
    
    let geometry;
    if (geometries.length === 1) {
      geometry = geometries[0];
    } else {
      const coords = [];
      geometries.forEach(geom => {
        if (geom.type === 'Polygon') {
          coords.push(geom.coordinates);
        } else if (geom.type === 'MultiPolygon') {
          coords.push(...geom.coordinates);
        }
      });
      geometry = { type: 'MultiPolygon', coordinates: coords };
    }
    
    europeMap.features.push({
      type: "Feature",
      properties: {
        name: getLocalizedName(countryName),
        originalName: countryName,
        color: getCountryColor(countryName)
      },
      geometry: geometry
    });
  });
  
  // Создаем папку если нет
  const mapsDir = path.join(__dirname, '../public/data/maps');
  if (!fs.existsSync(mapsDir)) {
    fs.mkdirSync(mapsDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(europeMap));
  console.log(`✅ ${period.year}: ${period.name} (${europeMap.features.length} стран)`);
});

console.log('\n✅ Обработка завершена!');
