const fs = require('fs');

console.log('🕊️ Перевод карты 1920 года на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1920.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 1920 года (послевоенная Европа)
const translations = {
  'Люксембург': {
    name: 'Люксембург',
    ruler: 'Шарлотта',
    capital: 'Люксембург',
    government: 'Великое герцогство',
    description: 'Восстановлен после немецкой оккупации'
  },
  'Швейцария': {
    name: 'Швейцария',
    ruler: 'Федеральный совет',
    capital: 'Берн',
    government: 'Федеративная республика',
    description: 'Нейтральная страна, не участвовала в войне'
  },
  'Франция': {
    name: 'Франция',
    ruler: 'Поль Дешанель (президент)',
    capital: 'Париж',
    government: 'Третья республика',
    description: 'Победитель в войне, получила Эльзас-Лотарингию'
  },
  'Соединённое Королевство': {
    name: 'Великобритания',
    ruler: 'Георг V',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Главный победитель войны, расширила империю'
  },
  'United Kingdom': {
    name: 'Великобритания',
    ruler: 'Георг V',
    capital: 'Лондон',
    government: 'Конституционная монархия',
    description: 'Главный победитель войны, расширила империю'
  },
  'Исландия': {
    name: 'Исландия',
    ruler: 'Кристиан X Датский',
    capital: 'Рейкьявик',
    government: 'Автономия в составе Дании',
    description: 'Получила расширенную автономию в 1918 году'
  },
  'Эстония': {
    name: 'Эстония',
    ruler: 'Константин Пятс',
    capital: 'Таллин',
    government: 'Республика',
    description: 'Независимость провозглашена в 1918 году'
  },
  'Латвия': {
    name: 'Латвия',
    ruler: 'Янис Чаксте',
    capital: 'Рига',
    government: 'Республика',
    description: 'Независимость провозглашена в 1918 году'
  },
  'Литва': {
    name: 'Литва',
    ruler: 'Антанас Сметона',
    capital: 'Каунас',
    government: 'Республика',
    description: 'Независимость провозглашена в 1918 году'
  },
  'Бельгия': {
    name: 'Бельгия',
    ruler: 'Альберт I',
    capital: 'Брюссель',
    government: 'Конституционная монархия',
    description: 'Освобождена от немецкой оккупации'
  },
  'Испания': {
    name: 'Испания',
    ruler: 'Альфонсо XIII',
    capital: 'Мадрид',
    government: 'Конституционная монархия',
    description: 'Нейтральная во время войны'
  },
  'Албания': {
    name: 'Албания',
    ruler: 'Ахмед Зогу',
    capital: 'Тирана',
    government: 'Республика',
    description: 'Восстановлена после войны'
  },
  'Португалия': {
    name: 'Португалия',
    ruler: 'Антониу Жозе де Алмейда',
    capital: 'Лиссабон',
    government: 'Республика',
    description: 'Участвовала в войне на стороне Антанты'
  },
  'Марокко': {
    name: 'Марокко',
    ruler: 'Юсуф бен Хасан',
    capital: 'Фес',
    government: 'Французский протекторат',
    description: 'Под французским и испанским протекторатом'
  },
  'Нидерланды': {
    name: 'Нидерланды',
    ruler: 'Вильгельмина',
    capital: 'Амстердам',
    government: 'Конституционная монархия',
    description: 'Нейтральная во время войны'
  },
  'Австрия': {
    name: 'Австрия',
    ruler: 'Михаэль Хайниш',
    capital: 'Вена',
    government: 'Республика',
    description: 'Остаток Австро-Венгрии, запрет на аншлюс с Германией'
  },
  'Финляндия': {
    name: 'Финляндия',
    ruler: 'Карло Юхо Стольберг',
    capital: 'Хельсинки',
    government: 'Республика',
    description: 'Независимость от России в 1917 году'
  },
  'Швеция': {
    name: 'Швеция',
    ruler: 'Густав V',
    capital: 'Стокгольм',
    government: 'Конституционная монархия',
    description: 'Нейтральная во время войны'
  },
  'East Prussia': {
    name: 'Восточная Пруссия',
    ruler: 'Веймарская республика',
    capital: 'Кёнигсберг',
    government: 'Эксклав Германии',
    description: 'Отделена от Германии Польским коридором'
  },
  'Югославия': {
    name: 'Югославия',
    ruler: 'Александр I Карагеоргиевич',
    capital: 'Белград',
    government: 'Королевство',
    description: 'Королевство сербов, хорватов и словенцев'
  },
  'Болгария': {
    name: 'Болгария',
    ruler: 'Борис III',
    capital: 'София',
    government: 'Царство',
    description: 'Потерпела поражение, потеряла территории'
  },
  'Венгрия': {
    name: 'Венгрия',
    ruler: 'Миклош Хорти',
    capital: 'Будапешт',
    government: 'Регентство',
    description: 'Остаток Австро-Венгрии, потеряла 2/3 территории'
  },
  'White Russia': {
    name: 'Белая Россия',
    ruler: 'Петр Врангель',
    capital: 'Севастополь',
    government: 'Военная диктатура',
    description: 'Остатки Белого движения в Крыму'
  },
  'Польша': {
    name: 'Польша',
    ruler: 'Юзеф Пилсудский',
    capital: 'Варшава',
    government: 'Республика',
    description: 'Восстановленная независимость после 123 лет'
  },
  'Румыния': {
    name: 'Румыния',
    ruler: 'Фердинанд I',
    capital: 'Бухарест',
    government: 'Королевство',
    description: 'Удвоила территорию, получила Трансильванию'
  },
  'Чехословакия': {
    name: 'Чехословакия',
    ruler: 'Томаш Масарик',
    capital: 'Прага',
    government: 'Республика',
    description: 'Новое государство из осколков Австро-Венгрии'
  },
  'South Russia': {
    name: 'Южная Россия',
    ruler: 'Антон Деникин',
    capital: 'Ростов-на-Дону',
    government: 'Военная диктатура',
    description: 'Белое движение на юге России'
  },
  'USSR': {
    name: 'СССР',
    ruler: 'Владимир Ленин',
    capital: 'Москва',
    government: 'Советская республика',
    description: 'Советские республики Закавказья'
  },
  'Iran': {
    name: 'Иран',
    ruler: 'Ахмад-шах Каджар',
    capital: 'Тегеран',
    government: 'Шахство',
    description: 'Под британским и советским влиянием'
  },
  'Германия': {
    name: 'Германия',
    ruler: 'Фридрих Эберт',
    capital: 'Берлин',
    government: 'Веймарская республика',
    description: 'Побежденная страна, тяжелые репарации'
  },
  'Италия': {
    name: 'Италия',
    ruler: 'Виктор Эммануил III',
    capital: 'Рим',
    government: 'Конституционная монархия',
    description: 'Победитель, но недовольна территориальными приобретениями'
  },
  'Греция': {
    name: 'Греция',
    ruler: 'Александр I',
    capital: 'Афины',
    government: 'Королевство',
    description: 'Расширилась за счет Османской империи'
  },
  'Ottoman Sultanate': {
    name: 'Османский султанат',
    ruler: 'Мехмед VI',
    capital: 'Константинополь',
    government: 'Султанат',
    description: 'Остатки Османской империи, под оккупацией Антанты'
  },
  'Османский султанат': {
    name: 'Османский султанат',
    ruler: 'Мехмед VI',
    capital: 'Константинополь',
    government: 'Султанат',
    description: 'Остатки Османской империи, под оккупацией Антанты'
  },
  'Украина': {
    name: 'Украина',
    ruler: 'Симон Петлюра',
    capital: 'Киев',
    government: 'Республика',
    description: 'Украинская народная республика в гражданской войне'
  },
  'Дания': {
    name: 'Дания',
    ruler: 'Кристиан X',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Нейтральная во время войны, получила Северный Шлезвиг'
  },
  'Норвегия': {
    name: 'Норвегия',
    ruler: 'Хокон VII',
    capital: 'Кристиания (Осло)',
    government: 'Конституционная монархия',
    description: 'Нейтральная во время войны'
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
      year: 1920,
      period: 'Послевоенная Европа'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_1920.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 1920 года переведена и обновлена!');
console.log('🕊️ Послевоенная Европа - новый мировой порядок после Великой войны!');