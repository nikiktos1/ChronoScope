const fs = require('fs');

console.log('🎭 Перевод карты 1815 года на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1815.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 1815 года (Венский конгресс)
const translations = {
  'Luxembourg': {
    name: 'Люксембург',
    ruler: 'Вильгельм I Нидерландский',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Личная уния с Нидерландами'
  },
  'Люксембург': {
    name: 'Люксембург',
    ruler: 'Вильгельм I Нидерландский',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Личная уния с Нидерландами'
  },
  'United Kingdom of Great Britain and Ireland': {
    name: 'Соединённое Королевство',
    ruler: 'Георг III',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Победитель Наполеона, морская держава'
  },
  'Соединённое Королевство': {
    name: 'Соединённое Королевство',
    ruler: 'Георг III',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Победитель Наполеона, морская держава'
  },
  'Spain': {
    name: 'Испания',
    ruler: 'Фердинанд VII',
    capital: 'Мадрид',
    government: 'Абсолютная монархия',
    description: 'Восстановленная монархия Бурбонов'
  },
  'Испания': {
    name: 'Испания',
    ruler: 'Фердинанд VII',
    capital: 'Мадрид',
    government: 'Абсолютная монархия',
    description: 'Восстановленная монархия Бурбонов'
  },
  'Portugal': {
    name: 'Португалия',
    ruler: 'Жуан VI',
    capital: 'Лиссабон',
    government: 'Абсолютная монархия',
    description: 'Король находится в Бразилии'
  },
  'Португалия': {
    name: 'Португалия',
    ruler: 'Жуан VI',
    capital: 'Лиссабон',
    government: 'Абсолютная монархия',
    description: 'Король находится в Бразилии'
  },
  'France': {
    name: 'Франция',
    ruler: 'Людовик XVIII',
    capital: 'Париж',
    government: 'Конституционная монархия',
    description: 'Реставрация Бурбонов после Наполеона'
  },
  'Франция': {
    name: 'Франция',
    ruler: 'Людовик XVIII',
    capital: 'Париж',
    government: 'Конституционная монархия',
    description: 'Реставрация Бурбонов после Наполеона'
  },
  'Kingdom of the Two Sicilies': {
    name: 'Королевство Обеих Сицилий',
    ruler: 'Фердинанд I',
    capital: 'Неаполь',
    government: 'Абсолютная монархия',
    description: 'Восстановленное Бурбонское королевство'
  },
  'Королевство Обеих Сицилий': {
    name: 'Королевство Обеих Сицилий',
    ruler: 'Фердинанд I',
    capital: 'Неаполь',
    government: 'Абсолютная монархия',
    description: 'Восстановленное Бурбонское королевство'
  },
  'Palatinate': {
    name: 'Пфальц',
    ruler: 'Максимилиан I Йозеф Баварский',
    capital: 'Мангейм',
    government: 'Курфюршество',
    description: 'Часть Баварии в составе Германского союза'
  },
  'Hohenzollern': {
    name: 'Гогенцоллерн',
    ruler: 'Карл Антон',
    capital: 'Зигмаринген',
    government: 'Княжество',
    description: 'Мелкое княжество династии Гогенцоллернов'
  },
  'Baden': {
    name: 'Баден',
    ruler: 'Карл Людвиг Фридрих',
    capital: 'Карлсруэ',
    government: 'Великое герцогство',
    description: 'Либеральное государство в юго-западной Германии'
  },
  'Saxony': {
    name: 'Саксония',
    ruler: 'Фридрих Август I',
    capital: 'Дрезден',
    government: 'Королевство',
    description: 'Союзник Наполеона, потерял территории'
  },
  'Саксония': {
    name: 'Саксония',
    ruler: 'Фридрих Август I',
    capital: 'Дрезден',
    government: 'Королевство',
    description: 'Союзник Наполеона, потерял территории'
  },
  'Prussia': {
    name: 'Пруссия',
    ruler: 'Фридрих Вильгельм III',
    capital: 'Берлин',
    government: 'Королевство',
    description: 'Главная сила Германского союза'
  },
  'Пруссия': {
    name: 'Пруссия',
    ruler: 'Фридрих Вильгельм III',
    capital: 'Берлин',
    government: 'Королевство',
    description: 'Главная сила Германского союза'
  },
  'Mecklenburg-Strelitz': {
    name: 'Мекленбург-Стрелиц',
    ruler: 'Карл II',
    capital: 'Нойштрелиц',
    government: 'Великое герцогство',
    description: 'Мелкое северогерманское государство'
  },
  'Grand Duchy of Hesse': {
    name: 'Великое герцогство Гессен',
    ruler: 'Людвиг I',
    capital: 'Дармштадт',
    government: 'Великое герцогство',
    description: 'Государство в центральной Германии'
  },
  'Nassau': {
    name: 'Нассау',
    ruler: 'Вильгельм',
    capital: 'Висбаден',
    government: 'Герцогство',
    description: 'Мелкое рейнское княжество'
  },
  'Wetzlar': {
    name: 'Вецлар',
    ruler: 'Имперский город',
    capital: 'Вецлар',
    government: 'Вольный город',
    description: 'Бывший имперский город'
  },
  'Waldeck': {
    name: 'Вальдек',
    ruler: 'Георг Фридрих Генрих',
    capital: 'Арользен',
    government: 'Княжество',
    description: 'Мелкое княжество в Гессене'
  },
  'Lippe-Detmold': {
    name: 'Липпе-Детмольд',
    ruler: 'Леопольд II',
    capital: 'Детмольд',
    government: 'Княжество',
    description: 'Мелкое вестфальское княжество'
  },
  'Brunswick': {
    name: 'Брауншвейг',
    ruler: 'Карл II',
    capital: 'Брауншвейг',
    government: 'Герцогство',
    description: 'Герцогство в северной Германии'
  },
  'Anhalt': {
    name: 'Ангальт',
    ruler: 'Леопольд Фридрих Франц',
    capital: 'Дессау',
    government: 'Герцогство',
    description: 'Мелкое княжество в Саксонии-Анхальт'
  },
  'Mecklenburg-Schwerin': {
    name: 'Мекленбург-Шверин',
    ruler: 'Фридрих Франц I',
    capital: 'Шверин',
    government: 'Великое герцогство',
    description: 'Северогерманское государство'
  },
  'Thuringia': {
    name: 'Тюрингия',
    ruler: 'Различные герцоги',
    capital: 'Различные',
    government: 'Герцогства',
    description: 'Множество мелких тюрингских княжеств'
  },
  'Lübeck': {
    name: 'Любек',
    ruler: 'Сенат',
    capital: 'Любек',
    government: 'Вольный город',
    description: 'Ганзейский торговый город'
  },
  'Oldenburg': {
    name: 'Ольденбург',
    ruler: 'Петр I',
    capital: 'Ольденбург',
    government: 'Великое герцогство',
    description: 'Северогерманское государство'
  },
  'Hanover': {
    name: 'Ганновер',
    ruler: 'Георг III (король Англии)',
    capital: 'Ганновер',
    government: 'Королевство',
    description: 'Личная уния с Великобританией'
  },
  'Electoral Hesse': {
    name: 'Курфюршество Гессен',
    ruler: 'Вильгельм I',
    capital: 'Кассель',
    government: 'Курфюршество',
    description: 'Восстановленное курфюршество'
  },
  'Bremen': {
    name: 'Бремен',
    ruler: 'Сенат',
    capital: 'Бремен',
    government: 'Вольный город',
    description: 'Ганзейский торговый город'
  },
  'Cuxhaven': {
    name: 'Куксхафен',
    ruler: 'Гамбургский сенат',
    capital: 'Куксхафен',
    government: 'Эксклав Гамбурга',
    description: 'Морской порт Гамбурга'
  },
  'Schleswig': {
    name: 'Шлезвиг',
    ruler: 'Фредерик VI Датский',
    capital: 'Шлезвиг',
    government: 'Герцогство',
    description: 'Датское герцогство'
  },
  'Holstein': {
    name: 'Гольштейн',
    ruler: 'Фредерик VI Датский',
    capital: 'Киль',
    government: 'Герцогство',
    description: 'Часть Германского союза под Данией'
  },
  'Hamburg': {
    name: 'Гамбург',
    ruler: 'Сенат',
    capital: 'Гамбург',
    government: 'Вольный город',
    description: 'Крупнейший ганзейский город'
  },
  'Schaumburg-Lippe': {
    name: 'Шаумбург-Липпе',
    ruler: 'Георг Вильгельм',
    capital: 'Бюккебург',
    government: 'Княжество',
    description: 'Мельчайшее германское княжество'
  },
  'Morocco': {
    name: 'Марокко',
    ruler: 'Мулай Сулейман',
    capital: 'Фес',
    government: 'Султанат',
    description: 'Независимый магрибский султанат'
  },
  'Марокко': {
    name: 'Марокко',
    ruler: 'Мулай Сулейман',
    capital: 'Фес',
    government: 'Султанат',
    description: 'Независимый магрибский султанат'
  },
  'Austrian Empire': {
    name: 'Австрийская империя',
    ruler: 'Франц I',
    capital: 'Вена',
    government: 'Империя',
    description: 'Многонациональная империя Габсбургов'
  },
  'Kingdom of Sardinia': {
    name: 'Сардинское королевство',
    ruler: 'Виктор Эммануил I',
    capital: 'Турин',
    government: 'Королевство',
    description: 'Пьемонт-Сардиния, будущее ядро Италии'
  },
  'Papal States': {
    name: 'Папская область',
    ruler: 'Папа Пий VII',
    capital: 'Рим',
    government: 'Теократия',
    description: 'Восстановленная светская власть Папы'
  },
  'Pontremoli': {
    name: 'Понтремоли',
    ruler: 'Мария Луиза Пармская',
    capital: 'Понтремоли',
    government: 'Герцогство',
    description: 'Мелкое итальянское герцогство'
  },
  'Fivizzano': {
    name: 'Фивиццано',
    ruler: 'Мария Беатриче д\'Эсте',
    capital: 'Фивиццано',
    government: 'Герцогство',
    description: 'Мелкое тосканское владение'
  },
  'Lucca': {
    name: 'Лукка',
    ruler: 'Мария Луиза Бурбон-Парма',
    capital: 'Лукка',
    government: 'Герцогство',
    description: 'Независимое тосканское герцогство'
  },
  'Tuscany': {
    name: 'Тоскана',
    ruler: 'Фердинанд III',
    capital: 'Флоренция',
    government: 'Великое герцогство',
    description: 'Восстановленное герцогство Габсбургов'
  },
  'Massa': {
    name: 'Масса',
    ruler: 'Мария Беатриче д\'Эсте',
    capital: 'Масса',
    government: 'Герцогство',
    description: 'Мелкое герцогство в Тоскане'
  },
  'Bavaria': {
    name: 'Бавария',
    ruler: 'Максимилиан I Йозеф',
    capital: 'Мюнхен',
    government: 'Королевство',
    description: 'Крупнейшее южногерманское королевство'
  },
  'Бавария': {
    name: 'Бавария',
    ruler: 'Максимилиан I Йозеф',
    capital: 'Мюнхен',
    government: 'Королевство',
    description: 'Крупнейшее южногерманское королевство'
  },
  'Württemberg': {
    name: 'Вюртемберг',
    ruler: 'Вильгельм I',
    capital: 'Штутгарт',
    government: 'Королевство',
    description: 'Южногерманское королевство'
  },
  'Switzerland': {
    name: 'Швейцария',
    ruler: 'Федеральное собрание',
    capital: 'Берн',
    government: 'Конфедерация',
    description: 'Нейтральная швейцарская конфедерация'
  },
  'Швейцария': {
    name: 'Швейцария',
    ruler: 'Федеральное собрание',
    capital: 'Берн',
    government: 'Конфедерация',
    description: 'Нейтральная швейцарская конфедерация'
  },
  'United Kingdom of Netherlands': {
    name: 'Соединённое королевство Нидерландов',
    ruler: 'Вильгельм I',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Объединение Голландии и Бельгии'
  },
  'Denmark': {
    name: 'Дания',
    ruler: 'Фредерик VI',
    capital: 'Копенгаген',
    government: 'Абсолютная монархия',
    description: 'Потеряла Норвегию, получила Гольштейн'
  },
  'Дания': {
    name: 'Дания',
    ruler: 'Фредерик VI',
    capital: 'Копенгаген',
    government: 'Абсолютная монархия',
    description: 'Потеряла Норвегию, получила Гольштейн'
  },
  'Sweden–Norway': {
    name: 'Швеция-Норвегия',
    ruler: 'Карл XIV Юхан (Бернадот)',
    capital: 'Стокгольм',
    government: 'Личная уния',
    description: 'Швеция получила Норвегию от Дании'
  },
  'Republic of Kraków': {
    name: 'Краковская республика',
    ruler: 'Сенат',
    capital: 'Краков',
    government: 'Республика',
    description: 'Вольный город под защитой трёх держав'
  },
  'Russian Empire': {
    name: 'Российская империя',
    ruler: 'Александр I',
    capital: 'Санкт-Петербург',
    government: 'Абсолютная монархия',
    description: 'Освободитель Европы от Наполеона'
  },
  'San Marino': {
    name: 'Сан-Марино',
    ruler: 'Капитаны-регенты',
    capital: 'Сан-Марино',
    government: 'Республика',
    description: 'Древняя микро-республика'
  },
  'Ottoman Empire': {
    name: 'Османская империя',
    ruler: 'Махмуд II',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Больной человек Европы'
  },
  'Османская империя': {
    name: 'Османская империя',
    ruler: 'Махмуд II',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Больной человек Европы'
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
      year: 1815,
      period: 'Венский конгресс'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_1815.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 1815 года переведена и обновлена!');
console.log('🎭 Венский конгресс - новый порядок в Европе после Наполеона!');