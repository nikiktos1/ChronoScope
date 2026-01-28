const fs = require('fs');

console.log('🏛️ Перевод карты 100 года н.э. на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_100.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 100 года н.э. (эпоха Траяна)
const translations = {
  'Dumonii': {
    name: 'Думонии',
    ruler: 'Племенные вожди',
    capital: 'Иска Думнониорум',
    government: 'Племенной союз',
    description: 'Кельтское племя в юго-западной Британии'
  },
  'Boihaenum': {
    name: 'Бойи',
    ruler: 'Вожди',
    capital: 'Бойодурум',
    government: 'Племенной союз',
    description: 'Кельтское племя в Богемии'
  },
  'Dacia': {
    name: 'Дакия',
    ruler: 'Децебал (до 106 г.)',
    capital: 'Сармизегетуза',
    government: 'Царство',
    description: 'Фракийское царство, вскоре будет завоевано Траяном'
  },
  'Armenia': {
    name: 'Армения',
    ruler: 'Аксидарес',
    capital: 'Артаксата',
    government: 'Царство',
    description: 'Армянское царство под римским протекторатом'
  },
  'Армения': {
    name: 'Армения',
    ruler: 'Аксидарес',
    capital: 'Артаксата',
    government: 'Царство',
    description: 'Армянское царство под римским протекторатом'
  },
  'Roman Empire': {
    name: 'Римская империя',
    ruler: 'Траян',
    capital: 'Рим',
    government: 'Империя',
    description: 'Империя в период наивысшего расцвета при Траяне'
  },
  'Римская империя': {
    name: 'Римская империя',
    ruler: 'Траян',
    capital: 'Рим',
    government: 'Империя',
    description: 'Империя в период наивысшего расцвета при Траяне'
  },
  'Saami': {
    name: 'Саамы',
    ruler: 'Шаманы',
    capital: 'Кочевые',
    government: 'Родовой строй',
    description: 'Коренной народ северной Скандинавии'
  },
  'Finno-Ugric taiga hunter-gatherers': {
    name: 'Финно-угорские охотники',
    ruler: 'Старейшины',
    capital: 'Кочевые',
    government: 'Родовой строй',
    description: 'Охотники и собиратели таежной зоны'
  },
  'Pomeranian culture': {
    name: 'Поморская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Германские племена Балтийского побережья'
  },
  'Pomeranian culture ': {
    name: 'Поморская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Германские племена Балтийского побережья'
  },
  'Sambian-Nothangian culture': {
    name: 'Самбийско-натангская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийские племена в Пруссии'
  },
  'Bell-shaped burials culture': {
    name: 'Культура колоколовидных кубков',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной строй',
    description: 'Поздние отголоски древней культуры'
  },
  'Western Masurian culture': {
    name: 'Западно-мазурская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийские племена в Мазурии'
  },
  'Eastern Masurian culture': {
    name: 'Восточно-мазурская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийские племена в восточной Мазурии'
  },
  'Curonians': {
    name: 'Курши',
    ruler: 'Конунги',
    capital: 'Гробиня',
    government: 'Племенной союз',
    description: 'Балтийское племя мореплавателей и торговцев'
  },
  'Brushed Pottery culture': {
    name: 'Культура штрихованной керамики',
    ruler: 'Старейшины',
    capital: 'Различные',
    government: 'Родовой строй',
    description: 'Балтийские племена с характерной керамикой'
  },
  'Milograd culture': {
    name: 'Милоградская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Раннеславянские племена в Белоруссии'
  },
  'Plain-Pottery culture': {
    name: 'Культура гладкой керамики',
    ruler: 'Старейшины',
    capital: 'Различные',
    government: 'Родовой строй',
    description: 'Славянские племена железного века'
  },
  'Alans': {
    name: 'Аланы',
    ruler: 'Цари-военачальники',
    capital: 'Кочевые',
    government: 'Кочевая орда',
    description: 'Ираноязычные кочевники в причерноморских степях'
  },
  'Scythians': {
    name: 'Скифы',
    ruler: 'Цари',
    capital: 'Неаполь Скифский',
    government: 'Царство',
    description: 'Остатки скифского царства в Крыму'
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
      year: 100,
      period: 'Ранняя Римская империя'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_100.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 100 года н.э. переведена и обновлена!');
console.log('🏛️ Эпоха императора Траяна - пик могущества Римской империи');