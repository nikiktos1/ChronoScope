const fs = require('fs');

console.log('🌍 Перевод карты 1492 года на русский язык...\n');

// Загружаем исходные данные
const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1492.json', 'utf8'));

console.log('Найдено территорий:', data.features.length);
console.log('\nТекущие названия:');

// Словарь переводов для 1492 года (эпоха Великих географических открытий)
const translations = {
  'Cyprus': {
    name: 'Кипр',
    ruler: 'Катерина Корнаро',
    capital: 'Никосия',
    government: 'Венецианский протекторат',
    description: 'Остров под контролем Венеции'
  },
  'Кипр': {
    name: 'Кипр',
    ruler: 'Катерина Корнаро',
    capital: 'Никосия',
    government: 'Венецианский протекторат',
    description: 'Остров под контролем Венеции'
  },
  'Denmark-Norway': {
    name: 'Дания-Норвегия',
    ruler: 'Ханс I',
    capital: 'Копенгаген',
    government: 'Королевство',
    description: 'Кальмарская уния под датским господством'
  },
  'Дания-Норвегия': {
    name: 'Дания-Норвегия',
    ruler: 'Ханс I',
    capital: 'Копенгаген',
    government: 'Королевство',
    description: 'Кальмарская уния под датским господством'
  },
  'England': {
    name: 'Англия',
    ruler: 'Генрих VII Тюдор',
    capital: 'Лондон',
    government: 'Королевство',
    description: 'Начало династии Тюдоров после войны Роз'
  },
  'Англия': {
    name: 'Англия',
    ruler: 'Генрих VII Тюдор',
    capital: 'Лондон',
    government: 'Королевство',
    description: 'Начало династии Тюдоров после войны Роз'
  },
  'Scottland': {
    name: 'Шотландия',
    ruler: 'Яков IV Стюарт',
    capital: 'Эдинбург',
    government: 'Королевство',
    description: 'Независимое шотландское королевство'
  },
  'Шотландия': {
    name: 'Шотландия',
    ruler: 'Яков IV Стюарт',
    capital: 'Эдинбург',
    government: 'Королевство',
    description: 'Независимое шотландское королевство'
  },
  'Portugal': {
    name: 'Португалия',
    ruler: 'Жуан II',
    capital: 'Лиссабон',
    government: 'Королевство',
    description: 'Пионер морских открытий, путь в Индию'
  },
  'Португалия': {
    name: 'Португалия',
    ruler: 'Жуан II',
    capital: 'Лиссабон',
    government: 'Королевство',
    description: 'Пионер морских открытий, путь в Индию'
  },
  'Papal States': {
    name: 'Папская область',
    ruler: 'Папа Александр VI Борджиа',
    capital: 'Рим',
    government: 'Теократия',
    description: 'Светская власть Папы Римского'
  },
  'Папская область': {
    name: 'Папская область',
    ruler: 'Папа Александр VI Борджиа',
    capital: 'Рим',
    government: 'Теократия',
    description: 'Светская власть Папы Римского'
  },
  'France': {
    name: 'Франция',
    ruler: 'Карл VIII',
    capital: 'Париж',
    government: 'Королевство',
    description: 'Готовится к итальянским войнам'
  },
  'Франция': {
    name: 'Франция',
    ruler: 'Карл VIII',
    capital: 'Париж',
    government: 'Королевство',
    description: 'Готовится к итальянским войнам'
  },
  'Venice': {
    name: 'Венеция',
    ruler: 'Дож Агостино Барбариго',
    capital: 'Венеция',
    government: 'Республика',
    description: 'Могущественная торговая республика'
  },
  'Венеция': {
    name: 'Венеция',
    ruler: 'Дож Агостино Барбариго',
    capital: 'Венеция',
    government: 'Республика',
    description: 'Могущественная торговая республика'
  },
  'Sweden': {
    name: 'Швеция',
    ruler: 'Стен Стуре Старший',
    capital: 'Стокгольм',
    government: 'Королевство',
    description: 'Борьба за независимость от Дании'
  },
  'Швеция': {
    name: 'Швеция',
    ruler: 'Стен Стуре Старший',
    capital: 'Стокгольм',
    government: 'Королевство',
    description: 'Борьба за независимость от Дании'
  },
  'Ryazan': {
    name: 'Рязанское княжество',
    ruler: 'Иван V Рязанский',
    capital: 'Рязань',
    government: 'Княжество',
    description: 'Последнее независимое русское княжество'
  },
  'Рязанское княжество': {
    name: 'Рязанское княжество',
    ruler: 'Иван V Рязанский',
    capital: 'Рязань',
    government: 'Княжество',
    description: 'Последнее независимое русское княжество'
  },
  'Georgia': {
    name: 'Грузия',
    ruler: 'Александр I',
    capital: 'Тбилиси',
    government: 'Королевство',
    description: 'Картли-Кахетинское царство'
  },
  'Грузия': {
    name: 'Грузия',
    ruler: 'Александр I',
    capital: 'Тбилиси',
    government: 'Королевство',
    description: 'Картли-Кахетинское царство'
  },
  'Teutonic Knights': {
    name: 'Тевтонский орден',
    ruler: 'Великий магистр Иоганн фон Тифен',
    capital: 'Кёнигсберг',
    government: 'Теократическое государство',
    description: 'Духовно-рыцарский орден в Пруссии'
  },
  'Тевтонский орден': {
    name: 'Тевтонский орден',
    ruler: 'Великий магистр Иоганн фон Тифен',
    capital: 'Кёнигсберг',
    government: 'Теократическое государство',
    description: 'Духовно-рыцарский орден в Пруссии'
  },
  'Pskov': {
    name: 'Псковская республика',
    ruler: 'Вече',
    capital: 'Псков',
    government: 'Республика',
    description: 'Последняя вечевая республика Руси'
  },
  'Псковская республика': {
    name: 'Псковская республика',
    ruler: 'Вече',
    capital: 'Псков',
    government: 'Республика',
    description: 'Последняя вечевая республика Руси'
  },
  'Grand Duchy of Moscow': {
    name: 'Великое княжество Московское',
    ruler: 'Иван III Великий',
    capital: 'Москва',
    government: 'Великое княжество',
    description: 'Собиратель русских земель, "государь всея Руси"'
  },
  'Великое княжество Московское': {
    name: 'Великое княжество Московское',
    ruler: 'Иван III Великий',
    capital: 'Москва',
    government: 'Великое княжество',
    description: 'Собиратель русских земель, "государь всея Руси"'
  },
  'Poland-Lithuania': {
    name: 'Польша-Литва',
    ruler: 'Казимир IV Ягеллончик',
    capital: 'Краков',
    government: 'Королевство',
    description: 'Крупнейшее государство Европы'
  },
  'Польша-Литва': {
    name: 'Польша-Литва',
    ruler: 'Казимир IV Ягеллончик',
    capital: 'Краков',
    government: 'Королевство',
    description: 'Крупнейшее государство Европы'
  },
  'Imperial Hungary': {
    name: 'Венгрия',
    ruler: 'Владислав II Ягеллончик',
    capital: 'Буда',
    government: 'Королевство',
    description: 'Под угрозой османской экспансии'
  },
  'Венгрия': {
    name: 'Венгрия',
    ruler: 'Владислав II Ягеллончик',
    capital: 'Буда',
    government: 'Королевство',
    description: 'Под угрозой османской экспансии'
  },
  'Navarre': {
    name: 'Наварра',
    ruler: 'Екатерина де Фуа',
    capital: 'Памплона',
    government: 'Королевство',
    description: 'Небольшое пиренейское королевство'
  },
  'Наварра': {
    name: 'Наварра',
    ruler: 'Екатерина де Фуа',
    capital: 'Памплона',
    government: 'Королевство',
    description: 'Небольшое пиренейское королевство'
  },
  'Castille': {
    name: 'Кастилия',
    ruler: 'Изабелла I Католичка',
    capital: 'Толедо',
    government: 'Королевство',
    description: 'Спонсор экспедиции Колумба в Америку'
  },
  'Кастилия': {
    name: 'Кастилия',
    ruler: 'Изабелла I Католичка',
    capital: 'Толедо',
    government: 'Королевство',
    description: 'Спонсор экспедиции Колумба в Америку'
  },
  'Wattasid Caliphate': {
    name: 'Ваттасидский халифат',
    ruler: 'Мухаммад аш-Шейх аль-Махди',
    capital: 'Фес',
    government: 'Халифат',
    description: 'Марокканская династия'
  },
  'Ваттасидский халифат': {
    name: 'Ваттасидский халифат',
    ruler: 'Мухаммад аш-Шейх аль-Махди',
    capital: 'Фес',
    government: 'Халифат',
    description: 'Марокканская династия'
  },
  'Hafsid Caliphate': {
    name: 'Хафсидский халифат',
    ruler: 'Абу Абдаллах Мухаммад V',
    capital: 'Тунис',
    government: 'Халифат',
    description: 'Тунисская династия под османским давлением'
  },
  'Хафсидский халифат': {
    name: 'Хафсидский халифат',
    ruler: 'Абу Абдаллах Мухаммад V',
    capital: 'Тунис',
    government: 'Халифат',
    description: 'Тунисская династия под османским давлением'
  },
  'Holy Roman Empire': {
    name: 'Священная Римская империя',
    ruler: 'Максимилиан I Габсбург',
    capital: 'Вена',
    government: 'Империя',
    description: 'Децентрализованная империя германских княжеств'
  },
  'Священная Римская империя': {
    name: 'Священная Римская империя',
    ruler: 'Максимилиан I Габсбург',
    capital: 'Вена',
    government: 'Империя',
    description: 'Децентрализованная империя германских княжеств'
  },
  'Swiss Confederation': {
    name: 'Швейцарская конфедерация',
    ruler: 'Кантональные советы',
    capital: 'Различные',
    government: 'Конфедерация',
    description: 'Союз независимых кантонов'
  },
  'Швейцарская конфедерация': {
    name: 'Швейцарская конфедерация',
    ruler: 'Кантональные советы',
    capital: 'Различные',
    government: 'Конфедерация',
    description: 'Союз независимых кантонов'
  },
  'Ottoman Empire': {
    name: 'Османская империя',
    ruler: 'Баязид II',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Растущая мусульманская империя на Балканах'
  },
  'Османская империя': {
    name: 'Османская империя',
    ruler: 'Баязид II',
    capital: 'Константинополь',
    government: 'Империя',
    description: 'Растущая мусульманская империя на Балканах'
  },
  'Britany': {
    name: 'Бретань',
    ruler: 'Анна Бретонская',
    capital: 'Ренн',
    government: 'Герцогство',
    description: 'Независимое герцогство, скоро войдет в состав Франции'
  },
  'Бретань': {
    name: 'Бретань',
    ruler: 'Анна Бретонская',
    capital: 'Ренн',
    government: 'Герцогство',
    description: 'Независимое герцогство, скоро войдет в состав Франции'
  },
  'Sámi': {
    name: 'Саамы',
    ruler: 'Шаманы',
    capital: 'Кочевые',
    government: 'Родовой строй',
    description: 'Коренной народ северной Скандинавии'
  },
  'Саамы': {
    name: 'Саамы',
    ruler: 'Шаманы',
    capital: 'Кочевые',
    government: 'Родовой строй',
    description: 'Коренной народ северной Скандинавии'
  },
  'Aragón': {
    name: 'Арагон',
    ruler: 'Фердинанд II Католик',
    capital: 'Сарагоса',
    government: 'Королевство',
    description: 'Морская держава Средиземноморья'
  },
  'Арагон': {
    name: 'Арагон',
    ruler: 'Фердинанд II Католик',
    capital: 'Сарагоса',
    government: 'Королевство',
    description: 'Морская держава Средиземноморья'
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
      year: 1492,
      period: 'Эпоха Великих географических открытий'
    };
    console.log(`   → ${translation.name}`);
  } else {
    console.log(`   ⚠️  Перевод не найден для: ${originalName}`);
  }
});

// Сохраняем обновленные данные
fs.writeFileSync('public/data/maps/europe_1492.json', JSON.stringify(data, null, 2));

console.log('\n✅ Карта 1492 года переведена и обновлена!');
console.log('🌍 Год открытия Америки Христофором Колумбом!');