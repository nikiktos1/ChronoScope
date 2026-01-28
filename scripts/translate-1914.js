const fs = require('fs');

console.log('⚔️ Перевод карты 1914 года на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);

// Удаляем дубликаты
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

data.features = uniqueFeatures;
console.log('После удаления дубликатов:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 1914 года (накануне Первой мировой войны)
const translations = {
  'Luxembourg': {
    name: 'Люксембург',
    ruler: 'Мария-Аделаида',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Нейтральное государство между Францией и Германией'
  },
  'Люксембург': {
    name: 'Люксембург',
    ruler: 'Мария-Аделаида',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Нейтральное государство между Францией и Германией'
  },
  'Switzerland': {
    name: 'Швейцария',
    ruler: 'Федеральный совет',
    capital: 'Берн',
    government: 'Федеративная республика',
    description: 'Нейтральная конфедерация в центре Европы'
  },
  'Швейцария': {
    name: 'Швейцария',
    ruler: 'Федеральный совет',
    capital: 'Берн',
    government: 'Федеративная республика',
    description: 'Нейтральная конфедерация в центре Европы'
  },
  'Iceland': {
    name: 'Исландия',
    ruler: 'Кристиан X Датский',
    capital: 'Рейкьявик',
    government: 'Автономия в составе Дании',
    description: 'Датская колония с широкой автономией'
  },
  'Исландия': {
    name: 'Исландия',
    ruler: 'Кристиан X Датский',
    capital: 'Рейкьявик',
    government: 'Автономия в составе Дании',
    description: 'Датская колония с широкой автономией'
  },
  'Belgium': {
    name: 'Бельгия',
    ruler: 'Альберт I',
    capital: 'Брюссель',
    government: 'Конституционная монархия',
    description: 'Нейтральная страна, будет оккупирована Германией'
  },
  'Бельгия': {
    name: 'Бельгия',
    ruler: 'Альберт I',
    capital: 'Брюссель',
    government: 'Конституционная монархия',
    description: 'Нейтральная страна, будет оккупирована Германией'
  },
  'Montenegro': {
    name: 'Черногория',
    ruler: 'Никола I Петрович',
    capital: 'Цетинье',
    government: 'Королевство',
    description: 'Союзник Сербии против Австро-Венгрии'
  },
  'Черногория': {
    name: 'Черногория',
    ruler: 'Никола I Петрович',
    capital: 'Цетинье',
    government: 'Королевство',
    description: 'Союзник Сербии против Австро-Венгрии'
  },
  'Albania': {
    name: 'Албания',
    ruler: 'Вильгельм Видский',
    capital: 'Дуррес',
    government: 'Княжество',
    description: 'Новое государство, созданное в 1912 году'
  },
  'Албания': {
    name: 'Албания',
    ruler: 'Вильгельм Видский',
    capital: 'Дуррес',
    government: 'Княжество',
    description: 'Новое государство, созданное в 1912 году'
  },
  'Portugal': {
    name: 'Португалия',
    ruler: 'Мануэл II (до 1910), затем республика',
    capital: 'Лиссабон',
    government: 'Республика',
    description: 'Молодая республика после свержения монархии'
  },
  'Португалия': {
    name: 'Португалия',
    ruler: 'Мануэл II (до 1910), затем республика',
    capital: 'Лиссабон',
    government: 'Республика',
    description: 'Молодая республика после свержения монархии'
  },
  'Persia': {
    name: 'Персия',
    ruler: 'Ахмад-шах Каджар',
    capital: 'Тегеран',
    government: 'Шахство',
    description: 'Под влиянием России и Британии'
  },
  'Персия': {
    name: 'Персия',
    ruler: 'Ахмад-шах Каджар',
    capital: 'Тегеран',
    government: 'Шахство',
    description: 'Под влиянием России и Британии'
  },
  'Netherlands': {
    name: 'Нидерланды',
    ruler: 'Вильгельмина',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Нейтральная колониальная держава'
  },
  'Нидерланды': {
    name: 'Нидерланды',
    ruler: 'Вильгельмина',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Нейтральная колониальная держава'
  },
  'Finland': {
    name: 'Финляндия',
    ruler: 'Николай II (как великий князь)',
    capital: 'Хельсинки',
    government: 'Великое княжество в составе России',
    description: 'Автономное княжество Российской империи'
  },
  'Финляндия': {
    name: 'Финляндия',
    ruler: 'Николай II (как великий князь)',
    capital: 'Хельсинки',
    government: 'Великое княжество в составе России',
    description: 'Автономное княжество Российской империи'
  },
  'Serbia': {
    name: 'Сербия',
    ruler: 'Петр I Карагеоргиевич',
    capital: 'Белград',
    government: 'Королевство',
    description: 'Центр славянского сопротивления Австро-Венгрии'
  },
  'Сербия': {
    name: 'Сербия',
    ruler: 'Петр I Карагеоргиевич',
    capital: 'Белград',
    government: 'Королевство',
    description: 'Центр славянского сопротивления Австро-Венгрии'
  },
  'Italy': {
    name: 'Италия',
    ruler: 'Виктор Эммануил III',
    capital: 'Рим',
    government: 'Конституционная монархия',
    description: 'Член Тройственного союза, но перейдет к Антанте'
  },
  'Италия': {
    name: 'Италия',
    ruler: 'Виктор Эммануил III',
    capital: 'Рим',
    government: 'Конституционная монархия',
    description: 'Член Тройственного союза, но перейдет к Антанте'
  },
  'Romania': {
    name: 'Румыния',
    ruler: 'Кароль I',
    capital: 'Бухарест',
    government: 'Королевство',
    description: 'Союзник Центральных держав, но перейдет к Антанте'
  },
  'Румыния': {
    name: 'Румыния',
    ruler: 'Кароль I',
    capital: 'Бухарест',
    government: 'Королевство',
    description: 'Союзник Центральных держав, но перейдет к Антанте'
  },
  'Austro-Hungarian Empire': {
    name: 'Австро-Венгрия',
    ruler: 'Франц Иосиф I',
    capital: 'Вена/Будапешт',
    government: 'Дуалистическая монархия',
    description: 'Многонациональная империя на грани распада'
  },
  'Австро-Венгрия': {
    name: 'Австро-Венгрия',
    ruler: 'Франц Иосиф I',
    capital: 'Вена/Будапешт',
    government: 'Дуалистическая монархия',
    description: 'Многонациональная империя на грани распада'
  },
  'Morocco': {
    name: 'Марокко',
    ruler: 'Юсуф бен Хасан',
    capital: 'Фес',
    government: 'Французский протекторат',
    description: 'Под французским протекторатом с 1912 года'
  },
  'Марокко': {
    name: 'Марокко',
    ruler: 'Юсуф бен Хасан',
    capital: 'Фес',
    government: 'Французский протекторат',
    description: 'Под французским протекторатом с 1912 года'
  },
  'France': {
    name: 'Франция',
    ruler: 'Раймон Пуанкаре (президент)',
    capital: 'Париж',
    government: 'Третья республика',
    description: 'Лидер Антанты, готовится к войне с Германией'
  },
  'Франция': {
    name: 'Франция',
    ruler: 'Раймон Пуанкаре (президент)',
    capital: 'Париж',
    government: 'Третья республика',
    description: 'Лидер Антанты, готовится к войне с Германией'
  },
  'Sweden': {
    name: 'Швеция',
    ruler: 'Густав V',
    capital: 'Стокгольм',
    government: 'Конституционная монархия',
    description: 'Нейтральная скандинавская держава'
  },
  'Швеция': {
    name: 'Швеция',
    ruler: 'Густав V',
    capital: 'Стокгольм',
    government: 'Конституционная монархия',
    description: 'Нейтральная скандинавская держава'
  },
  'Greece': {
    name: 'Греция',
    ruler: 'Константин I',
    capital: 'Афины',
    government: 'Конституционная монархия',
    description: 'Расширилась после Балканских войн'
  },
  'Греция': {
    name: 'Греция',
    ruler: 'Константин I',
    capital: 'Афины',
    government: 'Конституционная монархия',
    description: 'Расширилась после Балканских войн'
  },
  'Malta': {
    name: 'Мальта',
    ruler: 'Георг V (через губернатора)',
    capital: 'Валлетта',
    government: 'Британская колония',
    description: 'Стратегическая британская база в Средиземноморье'
  },
  'Мальта': {
    name: 'Мальта',
    ruler: 'Георг V (через губернатора)',
    capital: 'Валлетта',
    government: 'Британская колония',
    description: 'Стратегическая британская база в Средиземноморье'
  },
  'Russia': {
    name: 'Российская империя',
    ruler: 'Николай II',
    capital: 'Санкт-Петербург',
    government: 'Абсолютная монархия',
    description: 'Крупнейшая страна мира, союзник Франции'
  },
  'Российская империя': {
    name: 'Российская империя',
    ruler: 'Николай II',
    capital: 'Санкт-Петербург',
    government: 'Абсолютная монархия',
    description: 'Крупнейшая страна мира, союзник Франции'
  },
  'Bulgaria': {
    name: 'Болгария',
    ruler: 'Фердинанд I',
    capital: 'София',
    government: 'Царство',
    description: 'Союзник Центральных держав'
  },
  'Болгария': {
    name: 'Болгария',
    ruler: 'Фердинанд I',
    capital: 'София',
    government: 'Царство',
    description: 'Союзник Центральных держав'
  },
  'German Empire': {
    name: 'Германская империя',
    ruler: 'Вильгельм II',
    capital: 'Берлин',
    government: 'Империя',
    description: 'Лидер Центральных держав, главный противник Антанты'
  },
  'Германская империя': {
    name: 'Германская империя',
    ruler: 'Вильгельм II',
    capital: 'Берлин',
    government: 'Империя',
    description: 'Лидер Центральных держав, главный противник Антанты'
  },
  'Spain': {
    name: 'Испания',
    ruler: 'Альфонсо XIII',
    capital: 'Мадрид',
    government: 'Конституционная монархия',
    description: 'Нейтральная страна во время войны'
  },
  'Испания': {
    name: 'Испания',
    ruler: 'Альфонсо XIII',
    capital: 'Мадрид',
    government: 'Конституционная монархия',
    description: 'Нейтральная страна во время войны'
  },
  'United Kingdom of Great Britain and Ireland': {
    name: 'Великобритания',
    ruler: 'Георг V',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Крупнейшая империя мира, лидер Антанты'
  },
  'Великобритания': {
    name: 'Великобритания',
    ruler: 'Георг V',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Крупнейшая империя мира, лидер Антанты'
  },
  'Ottoman Empire': {
    name: 'Османская империя',
    ruler: 'Мехмед V',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Больной человек Европы, союзник Германии'
  },
  'Османская империя': {
    name: 'Османская империя',
    ruler: 'Мехмед V',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Больной человек Европы, союзник Германии'
  },
  'Denmark': {
    name: 'Дания',
    ruler: 'Кристиан X',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Нейтральная скандинавская держава'
  },
  'Дания': {
    name: 'Дания',
    ruler: 'Кристиан X',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Нейтральная скандинавская держава'
  },
  'Norway': {
    name: 'Норвегия',
    ruler: 'Хокон VII',
    capital: 'Кристиания (Осло)',
    government: 'Конституционная монархия',
    description: 'Независимое королевство с 1905 года'
  },
  'Норвегия': {
    name: 'Норвегия',
    ruler: 'Хокон VII',
    capital: 'Кристиания (Осло)',
    government: 'Конституционная монархия',
    description: 'Независимое королевство с 1905 года'
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
      year: 1914,
      period: 'Накануне Первой мировой войны'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_1914.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 1914 года переведена и обновлена!');
console.log('⚔️ Накануне Великой войны - Европа на пороге катастрофы!');