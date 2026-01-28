const fs = require('fs');

console.log('🌍 Перевод карты 323 до н.э. на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_-323.json', 'utf8'));

console.log('Найдено стран:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов
const translations = {
  'Bosporan Kingdom': {
    name: 'Боспорское царство',
    ruler: 'Спартак III',
    capital: 'Пантикапей',
    government: 'Царство',
    description: 'Греческое государство в Крыму и на Тамани'
  },
  'Rome': {
    name: 'Римская республика',
    ruler: 'Консулы (Луций Фурий, Децим Юний)',
    capital: 'Рим',
    government: 'Республика',
    description: 'Молодая республика, контролирует только центральную Италию'
  },
  'Greek city-states': {
    name: 'Греческие полисы',
    ruler: 'Различные тираны',
    capital: 'Афины, Спарта',
    government: 'Полисы',
    description: 'Независимые города-государства Греции'
  },
  'Carthaginian Empire': {
    name: 'Карфагенская империя',
    ruler: 'Суффеты',
    capital: 'Карфаген',
    government: 'Олигархическая республика',
    description: 'Могущественная торговая империя Средиземноморья'
  },
  'Atropatene': {
    name: 'Атропатена',
    ruler: 'Атропат',
    capital: 'Газака',
    government: 'Сатрапия',
    description: 'Персидская сатрапия в Азербайджане'
  },
  'Armenia': {
    name: 'Армения',
    ruler: 'Ерванд IV',
    capital: 'Армавир',
    government: 'Царство',
    description: 'Армянское царство под влиянием Селевкидов'
  },
  'Армения': {
    name: 'Армения',
    ruler: 'Ерванд IV',
    capital: 'Армавир',
    government: 'Царство',
    description: 'Армянское царство под влиянием Селевкидов'
  },
  'Colchis': {
    name: 'Колхида',
    ruler: 'Куджи',
    capital: 'Фасис',
    government: 'Царство',
    description: 'Царство в западной Грузии, известное золотым руном'
  },
  'Cappadocia': {
    name: 'Каппадокия',
    ruler: 'Ариарат I',
    capital: 'Мазака',
    government: 'Царство',
    description: 'Анатолийское царство после распада империи Александра'
  },
  'Celts': {
    name: 'Кельтские племена',
    ruler: 'Вожди племен',
    capital: 'Различные',
    government: 'Племенные союзы',
    description: 'Кельтские племена Галлии и Британии'
  },
  'Sabines': {
    name: 'Сабины',
    ruler: 'Племенные вожди',
    capital: 'Курес',
    government: 'Племенной союз',
    description: 'Италийское племя, частично подчиненное Риму'
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
    description: 'Археологическая культура Балтийского побережья'
  },
  'Pomeranian culture ': {
    name: 'Поморская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Археологическая культура Балтийского побережья'
  },
  'Sambian-Nothangian culture': {
    name: 'Самбийско-натангская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийская культура в Пруссии'
  },
  'Bell-shaped burials culture': {
    name: 'Культура колоколовидных кубков',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной строй',
    description: 'Археологическая культура бронзового века'
  },
  'Western Masurian culture': {
    name: 'Западно-мазурская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийская культура в Мазурии'
  },
  'Eastern Masurian culture': {
    name: 'Восточно-мазурская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Балтийская культура в восточной Мазурии'
  },
  'Curonians': {
    name: 'Курши',
    ruler: 'Конунги',
    capital: 'Гробиня',
    government: 'Племенной союз',
    description: 'Балтийское племя мореплавателей'
  },
  'Brushed Pottery culture': {
    name: 'Культура штрихованной керамики',
    ruler: 'Старейшины',
    capital: 'Различные',
    government: 'Родовой строй',
    description: 'Балтийская археологическая культура'
  },
  'Milograd culture': {
    name: 'Милоградская культура',
    ruler: 'Вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Раннеславянская культура в Белоруссии'
  },
  'Plain-Pottery culture': {
    name: 'Культура гладкой керамики',
    ruler: 'Старейшины',
    capital: 'Различные',
    government: 'Родовой строй',
    description: 'Археологическая культура железного века'
  },
  // Дополнительные италийские государства для 323 до н.э.
  'Etruscans': {
    name: 'Этруски',
    ruler: 'Лукумоны',
    capital: 'Различные города',
    government: 'Города-государства',
    description: 'Этрусские города-государства в северной Италии'
  },
  'Magna Graecia': {
    name: 'Великая Греция',
    ruler: 'Тираны и архонты',
    capital: 'Тарент, Сиракузы',
    government: 'Греческие полисы',
    description: 'Греческие колонии в южной Италии и Сицилии'
  },
  'Samnites': {
    name: 'Самниты',
    ruler: 'Медикс туттикус',
    capital: 'Бовианум',
    government: 'Племенная федерация',
    description: 'Воинственные горные племена центральной Италии'
  },
  'Lucanians': {
    name: 'Луканы',
    ruler: 'Племенные вожди',
    capital: 'Различные',
    government: 'Племенной союз',
    description: 'Италийское племя в южной Италии'
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
      year: -323,
      period: 'Эллинистический период'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_-323.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 323 до н.э. переведена и обновлена!');
console.log('📍 Добавлена информация о правителях, столицах и формах правления');