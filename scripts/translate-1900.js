const fs = require('fs');

console.log('🎩 Перевод карты 1900 года на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1900.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 1900 года (Belle Époque)
const translations = {
  'Luxembourg': {
    name: 'Люксембург',
    ruler: 'Адольф Нассауский',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Нейтральное государство между Францией и Германией'
  },
  'Люксембург': {
    name: 'Люксембург',
    ruler: 'Адольф Нассауский',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Нейтральное государство между Францией и Германией'
  },
  'Iceland': {
    name: 'Исландия',
    ruler: 'Кристиан IX Датский',
    capital: 'Рейкьявик',
    government: 'Автономия в составе Дании',
    description: 'Датская колония с растущей автономией'
  },
  'Исландия': {
    name: 'Исландия',
    ruler: 'Кристиан IX Датский',
    capital: 'Рейкьявик',
    government: 'Автономия в составе Дании',
    description: 'Датская колония с растущей автономией'
  },
  'Belgium': {
    name: 'Бельгия',
    ruler: 'Леопольд II',
    capital: 'Брюссель',
    government: 'Конституционная монархия',
    description: 'Промышленная держава с колониями в Африке'
  },
  'Бельгия': {
    name: 'Бельгия',
    ruler: 'Леопольд II',
    capital: 'Брюссель',
    government: 'Конституционная монархия',
    description: 'Промышленная держава с колониями в Африке'
  },
  'Portugal': {
    name: 'Португалия',
    ruler: 'Карлуш I',
    capital: 'Лиссабон',
    government: 'Конституционная монархия',
    description: 'Колониальная империя в упадке'
  },
  'Португалия': {
    name: 'Португалия',
    ruler: 'Карлуш I',
    capital: 'Лиссабон',
    government: 'Конституционная монархия',
    description: 'Колониальная империя в упадке'
  },
  'Netherlands': {
    name: 'Нидерланды',
    ruler: 'Вильгельмина',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Колониальная империя в Ост-Индии'
  },
  'Нидерланды': {
    name: 'Нидерланды',
    ruler: 'Вильгельмина',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Колониальная империя в Ост-Индии'
  },
  'France': {
    name: 'Франция',
    ruler: 'Эмиль Лубе (президент)',
    capital: 'Париж',
    government: 'Третья республика',
    description: 'Великая держава эпохи Belle Époque'
  },
  'Франция': {
    name: 'Франция',
    ruler: 'Эмиль Лубе (президент)',
    capital: 'Париж',
    government: 'Третья республика',
    description: 'Великая держава эпохи Belle Époque'
  },
  'Switzerland': {
    name: 'Швейцария',
    ruler: 'Федеральный совет',
    capital: 'Берн',
    government: 'Федеративная республика',
    description: 'Нейтральная конфедерация'
  },
  'Швейцария': {
    name: 'Швейцария',
    ruler: 'Федеральный совет',
    capital: 'Берн',
    government: 'Федеративная республика',
    description: 'Нейтральная конфедерация'
  },
  'Morocco': {
    name: 'Марокко',
    ruler: 'Абд аль-Азиз',
    capital: 'Фес',
    government: 'Султанат',
    description: 'Независимый султанат под европейским влиянием'
  },
  'Марокко': {
    name: 'Марокко',
    ruler: 'Абд аль-Азиз',
    capital: 'Фес',
    government: 'Султанат',
    description: 'Независимый султанат под европейским влиянием'
  },
  'Romania': {
    name: 'Румыния',
    ruler: 'Кароль I',
    capital: 'Бухарест',
    government: 'Королевство',
    description: 'Молодое балканское королевство'
  },
  'Румыния': {
    name: 'Румыния',
    ruler: 'Кароль I',
    capital: 'Бухарест',
    government: 'Королевство',
    description: 'Молодое балканское королевство'
  },
  'Serbia': {
    name: 'Сербия',
    ruler: 'Александр I Обренович',
    capital: 'Белград',
    government: 'Королевство',
    description: 'Независимое славянское королевство'
  },
  'Сербия': {
    name: 'Сербия',
    ruler: 'Александр I Обренович',
    capital: 'Белград',
    government: 'Королевство',
    description: 'Независимое славянское королевство'
  },
  'Montenegro': {
    name: 'Черногория',
    ruler: 'Никола I Петрович',
    capital: 'Цетинье',
    government: 'Княжество',
    description: 'Независимое горное княжество'
  },
  'Черногория': {
    name: 'Черногория',
    ruler: 'Никола I Петрович',
    capital: 'Цетинье',
    government: 'Княжество',
    description: 'Независимое горное княжество'
  },
  'Bosnia-Herzegovina': {
    name: 'Босния и Герцеговина',
    ruler: 'Франц Иосиф I (через наместника)',
    capital: 'Сараево',
    government: 'Австро-венгерский кондоминиум',
    description: 'Оккупированная Австро-Венгрией территория'
  },
  'Italy': {
    name: 'Италия',
    ruler: 'Умберто I',
    capital: 'Рим',
    government: 'Конституционная монархия',
    description: 'Объединённое королевство, стремится к колониям'
  },
  'Италия': {
    name: 'Италия',
    ruler: 'Умберто I',
    capital: 'Рим',
    government: 'Конституционная монархия',
    description: 'Объединённое королевство, стремится к колониям'
  },
  'Austria Hungary': {
    name: 'Австро-Венгрия',
    ruler: 'Франц Иосиф I',
    capital: 'Вена/Будапешт',
    government: 'Дуалистическая монархия',
    description: 'Многонациональная империя в кризисе'
  },
  'Bulgaria': {
    name: 'Болгария',
    ruler: 'Фердинанд I',
    capital: 'София',
    government: 'Княжество',
    description: 'Автономное княжество под османским сюзеренитетом'
  },
  'Болгария': {
    name: 'Болгария',
    ruler: 'Фердинанд I',
    capital: 'София',
    government: 'Княжество',
    description: 'Автономное княжество под османским сюзеренитетом'
  },
  'Ottoman Empire': {
    name: 'Османская империя',
    ruler: 'Абдул-Хамид II',
    capital: 'Константинополь',
    government: 'Абсолютная монархия',
    description: 'Больной человек Европы'
  },
  'Османская империя': {
    name: 'Османская империя',
    ruler: 'Абдул-Хамид II',
    capital: 'Константинополь',
    government: 'Абсолютная монархия',
    description: 'Больной человек Европы'
  },
  'Greece': {
    name: 'Греция',
    ruler: 'Георг I',
    capital: 'Афины',
    government: 'Конституционная монархия',
    description: 'Независимое королевство с ирредентистскими планами'
  },
  'Греция': {
    name: 'Греция',
    ruler: 'Георг I',
    capital: 'Афины',
    government: 'Конституционная монархия',
    description: 'Независимое королевство с ирредентистскими планами'
  },
  'Malta': {
    name: 'Мальта',
    ruler: 'Виктория (через губернатора)',
    capital: 'Валлетта',
    government: 'Британская колония',
    description: 'Стратегическая британская база в Средиземноморье'
  },
  'Мальта': {
    name: 'Мальта',
    ruler: 'Виктория (через губернатора)',
    capital: 'Валлетта',
    government: 'Британская колония',
    description: 'Стратегическая британская база в Средиземноморье'
  },
  'Sweden–Norway': {
    name: 'Швеция-Норвегия',
    ruler: 'Оскар II',
    capital: 'Стокгольм/Кристиания',
    government: 'Личная уния',
    description: 'Уния под угрозой распада'
  },
  'Denmark': {
    name: 'Дания',
    ruler: 'Кристиан IX',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Малая скандинавская держава'
  },
  'Дания': {
    name: 'Дания',
    ruler: 'Кристиан IX',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Малая скандинавская держава'
  },
  'Germany': {
    name: 'Германия',
    ruler: 'Вильгельм II',
    capital: 'Берлин',
    government: 'Империя',
    description: 'Новая великая держава Европы'
  },
  'Германия': {
    name: 'Германия',
    ruler: 'Вильгельм II',
    capital: 'Берлин',
    government: 'Империя',
    description: 'Новая великая держава Европы'
  }
};

// Обновляем данные
data.features.forEach((feature, index) => {
  const originalName = feature.properties.name;
  console.log(`${index + 1}. ${originalName}`);
  
  if (translations[originalName]) {
    const translation = translations[originalName];
    feature.properties = {
      ...feature.properties,
      name: translation.name,
      originalName: originalName,
      ruler: translation.ruler,
      capital: translation.capital,
      government: translation.government,
      description: translation.description,
      year: 1900,
      period: 'Belle Époque'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Добавляем недостающие страны
console.log('\n🔧 Добавляем недостающие страны...');

// Британская империя
const britain = {
  "type": "Feature",
  "properties": {
    "name": "Британская империя",
    "originalName": "British Empire",
    "ruler": "Виктория",
    "capital": "Лондон",
    "government": "Конституционная монархия",
    "description": "Крупнейшая империя в истории",
    "year": 1900,
    "period": "Belle Époque",
    "color": "#8B0000"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      // Британские острова (упрощенные координаты)
      [[
        [-10.5, 49.5], [-6.0, 49.5], [-5.0, 50.0], [-3.0, 50.5], 
        [-2.0, 51.0], [0.5, 51.0], [1.5, 51.5], [2.0, 52.0],
        [1.0, 53.0], [0.0, 54.0], [-1.0, 55.0], [-2.0, 56.0],
        [-3.0, 57.0], [-4.0, 58.0], [-5.0, 59.0], [-6.0, 60.0],
        [-7.0, 59.5], [-8.0, 58.5], [-9.0, 57.0], [-10.0, 55.0],
        [-10.5, 53.0], [-10.5, 49.5]
      ]]
    ]
  }
};

// Испания
const spain = {
  "type": "Feature",
  "properties": {
    "name": "Испания",
    "originalName": "Spain",
    "ruler": "Альфонсо XIII",
    "capital": "Мадрид",
    "government": "Конституционная монархия",
    "description": "Бывшая великая держава, потеряла последние колонии",
    "year": 1900,
    "period": "Belle Époque",
    "color": "#FFD700"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [-9.5, 42.0], [-7.0, 43.5], [-1.5, 43.5], [3.0, 42.5],
      [3.5, 40.0], [2.0, 36.5], [-1.0, 36.0], [-6.0, 36.0],
      [-9.5, 37.0], [-9.5, 42.0]
    ]]
  }
};

// Российская империя
const russia = {
  "type": "Feature",
  "properties": {
    "name": "Российская империя",
    "originalName": "Russian Empire",
    "ruler": "Николай II",
    "capital": "Санкт-Петербург",
    "government": "Абсолютная монархия",
    "description": "Крупнейшая страна мира, на пороге революции",
    "year": 1900,
    "period": "Belle Époque",
    "color": "#006400"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [20.0, 70.0], [30.0, 70.0], [40.0, 68.0], [50.0, 66.0],
      [60.0, 64.0], [70.0, 62.0], [70.0, 45.0], [65.0, 42.0],
      [60.0, 40.0], [50.0, 42.0], [40.0, 44.0], [30.0, 46.0],
      [25.0, 50.0], [22.0, 54.0], [20.0, 58.0], [20.0, 70.0]
    ]]
  }
};

// Добавляем новые страны
data.features.push(britain, spain, russia);
console.log('✅ Добавлены: Британская империя, Испания, Российская империя');

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_1900.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 1900 года переведена и обновлена!');
console.log('🎩 Belle Époque - золотой век Европы перед Первой мировой!');