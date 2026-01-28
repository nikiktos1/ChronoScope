import fs from 'fs';

console.log('🇷🇺🇳🇴🇩🇰🇬🇷 Создание полной карты 1945 года с СССР, Норвегией, Данией и Грецией...\n');

try {
  // Загружаем мировые данные 1945
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1945.geojson', 'utf8'));
  
  // Создаем новую европейскую карту или загружаем существующую
  let europeData;
  try {
    europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  } catch (e) {
    // Если файл не существует, создаем новую структуру
    europeData = {
      type: 'FeatureCollection',
      features: []
    };
  }
  
  console.log('Поиск стран в мировых данных 1945...');
  
  // Ищем СССР (может быть под разными названиями)
  const ussrFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('ussr') || subjecto.includes('soviet') ||
           name.includes('ussr') || name.includes('soviet') ||
           subjecto.includes('russia') || name.includes('russia');
  });
  
  // Ищем Норвегию
  const norwayFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('norway') || name.includes('norway');
  });
  
  // Ищем Данию
  const denmarkFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('denmark') || name.includes('denmark') ||
           subjecto.includes('danish') || name.includes('danish');
  });
  
  // Ищем Грецию
  const greeceFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('greece') || name.includes('greece') ||
           subjecto.includes('greek') || name.includes('greek');
  });
  
  console.log(`Найдено частей СССР: ${ussrFeatures.length}`);
  console.log(`Найдено частей Норвегии: ${norwayFeatures.length}`);
  console.log(`Найдено частей Дании: ${denmarkFeatures.length}`);
  console.log(`Найдено частей Греции: ${greeceFeatures.length}`);
  
  // Если какие-то страны не найдены, попробуем найти в других картах
  const searchInOtherYears = async (countryName, features, searchTerms) => {
    if (features.length === 0) {
      console.log(`${countryName} не найдена в 1945, ищем в других годах...`);
      
      const years = ['1938', '1930', '1920', '1914'];
      for (const year of years) {
        try {
          const otherWorldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
          const foundFeatures = otherWorldData.features.filter(f => {
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            const name = (f.properties.NAME || '').toLowerCase();
            return searchTerms.some(term => subjecto.includes(term) || name.includes(term));
          });
          
          if (foundFeatures.length > 0) {
            features.push(...foundFeatures);
            console.log(`Найдена ${countryName} в данных ${year}: ${foundFeatures.length} частей`);
            break;
          }
        } catch (e) {
          // Файл не найден, продолжаем
        }
      }
    }
  };
  
  // Ищем недостающие страны в других годах
  await searchInOtherYears('Норвегия', norwayFeatures, ['norway']);
  await searchInOtherYears('Дания', denmarkFeatures, ['denmark', 'danish']);
  await searchInOtherYears('Греция', greeceFeatures, ['greece', 'greek']);
  
  // Функция для добавления страны
  const addCountry = (countryFeatures, countryName, translatedName, countryInfo) => {
    if (countryFeatures.length > 0) {
      const exists = europeData.features.some(f => 
        f.properties.name.toLowerCase().includes(translatedName.toLowerCase()) ||
        f.properties.name.toLowerCase().includes(countryName.toLowerCase())
      );
      
      if (!exists) {
        const coordinates = [];
        countryFeatures.forEach(feature => {
          if (feature.geometry.type === 'MultiPolygon') {
            coordinates.push(...feature.geometry.coordinates);
          } else if (feature.geometry.type === 'Polygon') {
            coordinates.push(feature.geometry.coordinates);
          }
        });
        
        const countryFeature = {
          type: 'Feature',
          properties: {
            name: translatedName,
            originalName: countryName,
            ruler: countryInfo.ruler,
            capital: countryInfo.capital,
            government: countryInfo.government,
            description: countryInfo.description,
            year: 1945,
            period: 'Послевоенный период'
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: coordinates
          }
        };
        
        europeData.features.push(countryFeature);
        console.log(`✅ ${translatedName} добавлена`);
        return true;
      } else {
        console.log(`ℹ️ ${translatedName} уже существует`);
        return false;
      }
    } else {
      console.log(`❌ ${translatedName} не найдена ни в одном источнике`);
      return false;
    }
  };
  
  // Добавляем страны
  console.log('\nДобавление стран...');
  
  addCountry(ussrFeatures, 'USSR', 'СССР', {
    ruler: 'Иосиф Сталин',
    capital: 'Москва',
    government: 'Советская социалистическая республика',
    description: 'Победитель во Второй мировой войне, сверхдержава'
  });
  
  addCountry(norwayFeatures, 'Norway', 'Норвегия', {
    ruler: 'Хокон VII',
    capital: 'Осло',
    government: 'Конституционная монархия',
    description: 'Освобождена от немецкой оккупации в 1945 году'
  });
  
  addCountry(denmarkFeatures, 'Denmark', 'Дания', {
    ruler: 'Кристиан X',
    capital: 'Копенгаген',
    government: 'Конституционная монархия',
    description: 'Освобождена от немецкой оккупации в 1945 году'
  });
  
  addCountry(greeceFeatures, 'Greece', 'Греция', {
    ruler: 'Георг II',
    capital: 'Афины',
    government: 'Королевство',
    description: 'Освобождена от оккупации, начало гражданской войны'
  });
  
  // Добавляем переводы для других стран, которые могут быть в данных 1945
  const translations = {
    'Luxembourg': {
      name: 'Люксембург',
      ruler: 'Шарлотта',
      capital: 'Люксембург',
      government: 'Великое герцогство',
      description: 'Освобожден союзниками в 1944 году'
    },
    'Switzerland': {
      name: 'Швейцария',
      ruler: 'Федеральный совет',
      capital: 'Берн',
      government: 'Федеративная республика',
      description: 'Сохранила нейтралитет во время войны'
    },
    'Spain': {
      name: 'Испания',
      ruler: 'Франсиско Франко',
      capital: 'Мадрид',
      government: 'Диктатура',
      description: 'Фашистская диктатура, не участвовала в войне'
    },
    'United Kingdom': {
      name: 'Великобритания',
      ruler: 'Георг VI',
      capital: 'Лондон',
      government: 'Конституционная монархия',
      description: 'Победитель во Второй мировой войне'
    },
    'Portugal': {
      name: 'Португалия',
      ruler: 'Антониу Салазар',
      capital: 'Лиссабон',
      government: 'Авторитарная республика',
      description: 'Диктатура Салазара, сохранила нейтралитет'
    },
    'France': {
      name: 'Франция',
      ruler: 'Шарль де Голль',
      capital: 'Париж',
      government: 'Временное правительство',
      description: 'Освобождена союзниками, восстановление республики'
    },
    'Belgium': {
      name: 'Бельгия',
      ruler: 'Леопольд III',
      capital: 'Брюссель',
      government: 'Конституционная монархия',
      description: 'Освобождена союзниками в 1944 году'
    },
    'Netherlands': {
      name: 'Нидерланды',
      ruler: 'Вильгельмина',
      capital: 'Амстердам',
      government: 'Конституционная монархия',
      description: 'Освобождены союзниками в 1945 году'
    },
    'Italy': {
      name: 'Италия',
      ruler: 'Умберто II',
      capital: 'Рим',
      government: 'Королевство (переходный период)',
      description: 'Капитулировала в 1943, освобождена союзниками'
    },
    'Germany': {
      name: 'Германия',
      ruler: 'Союзнический контроль',
      capital: 'Берлин (разделен)',
      government: 'Оккупационные зоны',
      description: 'Разгромлена и оккупирована союзниками'
    },
    'Austria': {
      name: 'Австрия',
      ruler: 'Карл Реннер',
      capital: 'Вена',
      government: 'Временное правительство',
      description: 'Освобождена от нацистской аннексии'
    },
    'Poland': {
      name: 'Польша',
      ruler: 'Болеслав Берут',
      capital: 'Варшава',
      government: 'Народная республика',
      description: 'Освобождена Красной армией, коммунистическое правительство'
    },
    'Czechoslovakia': {
      name: 'Чехословакия',
      ruler: 'Эдвард Бенеш',
      capital: 'Прага',
      government: 'Республика',
      description: 'Восстановлена после освобождения'
    },
    'Hungary': {
      name: 'Венгрия',
      ruler: 'Золтан Тилди',
      capital: 'Будапешт',
      government: 'Временное правительство',
      description: 'Освобождена Красной армией'
    },
    'Romania': {
      name: 'Румыния',
      ruler: 'Михай I',
      capital: 'Бухарест',
      government: 'Королевство',
      description: 'Перешла на сторону союзников в 1944'
    },
    'Bulgaria': {
      name: 'Болгария',
      ruler: 'Симеон II',
      capital: 'София',
      government: 'Царство',
      description: 'Перешла на сторону союзников в 1944'
    },
    'Yugoslavia': {
      name: 'Югославия',
      ruler: 'Иосип Броз Тито',
      capital: 'Белград',
      government: 'Федеративная республика',
      description: 'Освобождена партизанами Тито'
    },
    'Albania': {
      name: 'Албания',
      ruler: 'Энвер Ходжа',
      capital: 'Тирана',
      government: 'Народная республика',
      description: 'Освобождена коммунистическими партизанами'
    },
    'Turkey': {
      name: 'Турция',
      ruler: 'Исмет Инёню',
      capital: 'Анкара',
      government: 'Республика',
      description: 'Объявила войну Германии в феврале 1945'
    },
    'Sweden': {
      name: 'Швеция',
      ruler: 'Густав V',
      capital: 'Стокгольм',
      government: 'Конституционная монархия',
      description: 'Сохранила нейтралитет во время войны'
    },
    'Finland': {
      name: 'Финляндия',
      ruler: 'Карл Густав Маннергейм',
      capital: 'Хельсинки',
      government: 'Республика',
      description: 'Подписала сепаратный мир с СССР в 1944'
    },
    'Ireland': {
      name: 'Ирландия',
      ruler: 'Шон О\'Келли',
      capital: 'Дублин',
      government: 'Республика',
      description: 'Сохранила нейтралитет во время войны'
    }
  };
  
  console.log('\nПеревод существующих стран...');
  
  // Обновляем существующие данные с переводами
  europeData.features.forEach((feature, index) => {
    const originalName = feature.properties.name || feature.properties.NAME || feature.properties.originalName;
    
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
        year: 1945,
        period: 'Послевоенный период'
      };
      console.log(`✅ ${originalName} → ${translation.name}`);
    } else if (originalName && !feature.properties.year) {
      // Добавляем базовую информацию для стран без перевода
      feature.properties.year = 1945;
      feature.properties.period = 'Послевоенный период';
      console.log(`⚠️ Перевод не найден для: ${originalName}`);
    }
  });
  
  // Создаем директорию если не существует
  if (!fs.existsSync('public/data/maps')) {
    fs.mkdirSync('public/data/maps', { recursive: true });
  }
  
  // Сохраняем обновленную карту
  fs.writeFileSync('public/data/maps/europe_1945.json', JSON.stringify(europeData, null, 2));
  
  console.log('\n✅ Карта 1945 года создана!');
  console.log(`📊 Всего территорий: ${europeData.features.length}`);
  
  // Выводим список всех стран
  console.log('\n📋 Список стран в карте 1945:');
  europeData.features.forEach((feature, index) => {
    const name = feature.properties.name || feature.properties.NAME || 'Без названия';
    console.log(`${index + 1}. ${name}`);
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Создание карты 1945 года завершено!');