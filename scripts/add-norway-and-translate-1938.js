const fs = require('fs');

console.log('🇳🇴 Добавление Норвегии и перевод карты 1938 года...\n');

try {
  // Загружаем мировые данные 1938
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1938.geojson', 'utf8'));
  
  // Загружаем европейскую карту
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  console.log('Поиск Норвегии в мировых данных...');
  
  // Ищем Норвегию в мировых данных
  const norwayFeatures = worldData.features.filter(f => {
    const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
    const name = (f.properties.NAME || '').toLowerCase();
    return subjecto.includes('norway') || name.includes('norway');
  });
  
  console.log(`Найдено частей Норвегии: ${norwayFeatures.length}`);
  
  // Если Норвегия не найдена в 1938, попробуем взять из других лет
  if (norwayFeatures.length === 0) {
    console.log('Норвегия не найдена в 1938, ищем в других годах...');
    
    const years = ['1914', '1920', '1930'];
    for (const year of years) {
      try {
        const otherWorldData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        const norwayFromOther = otherWorldData.features.filter(f => {
          const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
          return subjecto.includes('norway');
        });
        
        if (norwayFromOther.length > 0) {
          norwayFeatures.push(...norwayFromOther);
          console.log(`Найдена Норвегия в данных ${year}: ${norwayFromOther.length} частей`);
          break;
        }
      } catch (e) {
        // Файл не найден, продолжаем
      }
    }
  }
  
  // Добавляем Норвегию если найдена
  if (norwayFeatures.length > 0) {
    const norwayExists = europeData.features.some(f => 
      f.properties.name.toLowerCase().includes('норв') ||
      f.properties.name.toLowerCase().includes('norway')
    );
    
    if (!norwayExists) {
      const norwayCoordinates = [];
      norwayFeatures.forEach(feature => {
        if (feature.geometry.type === 'MultiPolygon') {
          norwayCoordinates.push(...feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          norwayCoordinates.push(feature.geometry.coordinates);
        }
      });
      
      const norwayFeature = {
        type: 'Feature',
        properties: {
          name: 'Норвегия',
          originalName: 'Norway',
          ruler: 'Хокон VII',
          capital: 'Осло',
          government: 'Конституционная монархия',
          description: 'Нейтральная скандинавская держава',
          year: 1938,
          period: 'Накануне Второй мировой войны'
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: norwayCoordinates
        }
      };
      
      europeData.features.push(norwayFeature);
      console.log('✅ Норвегия добавлена');
    }
  } else {
    console.log('❌ Норвегия не найдена ни в одном источнике');
  }
  
  // Словарь переводов для 1938 года (накануне Второй мировой)
  const translations = {
    'Люксембург': {
      name: 'Люксембург',
      ruler: 'Шарлотта',
      capital: 'Люксембург',
      government: 'Великое герцогство',
      description: 'Нейтральное государство между Францией и Германией'
    },
    'Швейцария': {
      name: 'Швейцария',
      ruler: 'Федеральный совет',
      capital: 'Берн',
      government: 'Федеративная республика',
      description: 'Нейтральная конфедерация'
    },
    'Испания': {
      name: 'Испания',
      ruler: 'Франсиско Франко',
      capital: 'Мадрид',
      government: 'Диктатура',
      description: 'Фашистская диктатура после гражданской войны'
    },
    'Великобритания': {
      name: 'Великобритания',
      ruler: 'Георг VI',
      capital: 'Лондон',
      government: 'Конституционная монархия',
      description: 'Крупнейшая империя мира, готовится к войне'
    },
    'United Kingdom': {
      name: 'Великобритания',
      ruler: 'Георг VI',
      capital: 'Лондон',
      government: 'Конституционная монархия',
      description: 'Крупнейшая империя мира, готовится к войне'
    },
    'Эстония': {
      name: 'Эстония',
      ruler: 'Константин Пятс',
      capital: 'Таллин',
      government: 'Авторитарная республика',
      description: 'Независимая республика под угрозой СССР'
    },
    'Латвия': {
      name: 'Латвия',
      ruler: 'Карлис Ульманис',
      capital: 'Рига',
      government: 'Авторитарная республика',
      description: 'Независимая республика под угрозой СССР'
    },
    'Литва': {
      name: 'Литва',
      ruler: 'Антанас Сметона',
      capital: 'Каунас',
      government: 'Авторитарная республика',
      description: 'Независимая республика под угрозой СССР'
    },
    'Ирландия': {
      name: 'Ирландия',
      ruler: 'Дуглас Хайд',
      capital: 'Дублин',
      government: 'Республика',
      description: 'Независимое государство с 1922 года'
    },
    'Бельгия': {
      name: 'Бельгия',
      ruler: 'Леопольд III',
      capital: 'Брюссель',
      government: 'Конституционная монархия',
      description: 'Нейтральная страна, будет оккупирована Германией'
    },
    'Франция': {
      name: 'Франция',
      ruler: 'Альбер Лебрен',
      capital: 'Париж',
      government: 'Третья республика',
      description: 'Готовится к войне с Германией, линия Мажино'
    },
    'Албания': {
      name: 'Албания',
      ruler: 'Зог I',
      capital: 'Тирана',
      government: 'Королевство',
      description: 'Под итальянским влиянием'
    },
    'Португалия': {
      name: 'Португалия',
      ruler: 'Антониу Салазар',
      capital: 'Лиссабон',
      government: 'Авторитарная республика',
      description: 'Диктатура Салазара, нейтральная позиция'
    },
    'Iran': {
      name: 'Иран',
      ruler: 'Реза Пехлеви',
      capital: 'Тегеран',
      government: 'Шахство',
      description: 'Модернизирующаяся монархия'
    },
    'Нидерланды': {
      name: 'Нидерланды',
      ruler: 'Вильгельмина',
      capital: 'Амстердам',
      government: 'Конституционная монархия',
      description: 'Нейтральная колониальная держава'
    },
    'Болгария': {
      name: 'Болгария',
      ruler: 'Борис III',
      capital: 'София',
      government: 'Царство',
      description: 'Союзник Германии'
    },
    'Румыния': {
      name: 'Румыния',
      ruler: 'Кароль II',
      capital: 'Бухарест',
      government: 'Королевство',
      description: 'Авторитарная монархия, союзник Германии'
    },
    'Чехословакия': {
      name: 'Чехословакия',
      ruler: 'Эдвард Бенеш',
      capital: 'Прага',
      government: 'Республика',
      description: 'Под угрозой немецкой аннексии (Судеты)'
    },
    'Венгрия': {
      name: 'Венгрия',
      ruler: 'Миклош Хорти',
      capital: 'Будапешт',
      government: 'Регентство',
      description: 'Авторитарное регентство, союзник Германии'
    },
    'Германия': {
      name: 'Германия',
      ruler: 'Адольф Гитлер',
      capital: 'Берлин',
      government: 'Нацистская диктатура',
      description: 'Третий рейх, готовится к мировой войне'
    },
    'Польша': {
      name: 'Польша',
      ruler: 'Игнацы Мосьцицкий',
      capital: 'Варшава',
      government: 'Авторитарная республика',
      description: 'Между молотом и наковальней - СССР и Германией'
    },
    'Швеция': {
      name: 'Швеция',
      ruler: 'Густав V',
      capital: 'Стокгольм',
      government: 'Конституционная монархия',
      description: 'Нейтральная скандинавская держава'
    },
    'Финляндия': {
      name: 'Финляндия',
      ruler: 'Кюёсти Каллио',
      capital: 'Хельсинки',
      government: 'Республика',
      description: 'Независимая республика под угрозой СССР'
    },
    'Дания': {
      name: 'Дания',
      ruler: 'Кристиан X',
      capital: 'Копенгаген',
      government: 'Конституционная монархия',
      description: 'Нейтральная скандинавская держава'
    },
    'Югославия': {
      name: 'Югославия',
      ruler: 'Петр II (регентство)',
      capital: 'Белград',
      government: 'Королевство',
      description: 'Многонациональное королевство под угрозой'
    },
    'Италия': {
      name: 'Италия',
      ruler: 'Бенито Муссолини',
      capital: 'Рим',
      government: 'Фашистская диктатура',
      description: 'Союзник Германии, ось Рим-Берлин'
    },
    'USSR': {
      name: 'СССР',
      ruler: 'Иосиф Сталин',
      capital: 'Москва',
      government: 'Советская диктатура',
      description: 'Сталинский режим, готовится к войне'
    },
    'Andorra': {
      name: 'Андорра',
      ruler: 'Со-князья (Франция и Испания)',
      capital: 'Андорра-ла-Велья',
      government: 'Княжество',
      description: 'Микрогосударство в Пиренеях'
    },
    'Турция': {
      name: 'Турция',
      ruler: 'Мустафа Кемаль Ататюрк',
      capital: 'Анкара',
      government: 'Республика',
      description: 'Секуляризованная республика, нейтральная позиция'
    },
    'Греция': {
      name: 'Греция',
      ruler: 'Иоаннис Метаксас',
      capital: 'Афины',
      government: 'Авторитарная монархия',
      description: 'Диктатура Метаксаса'
    },
    'Норвегия': {
      name: 'Норвегия',
      ruler: 'Хокон VII',
      capital: 'Осло',
      government: 'Конституционная монархия',
      description: 'Нейтральная скандинавская держава'
    }
  };
  
  console.log('\nПеревод и добавление информации...');
  
  // Обновляем данные
  europeData.features.forEach((feature, index) => {
    const originalName = feature.properties.name;
    
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
        year: 1938,
        period: 'Накануне Второй мировой войны'
      };
      console.log(`✅ ${originalName} → ${translation.name}`);
    } else {
      console.log(`⚠️ Перевод не найден для: ${originalName}`);
    }
  });
  
  // Сохраняем обновленную карту
  fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData, null, 2));
  
  console.log('\n✅ Карта 1938 года обновлена!');
  console.log(`📊 Всего территорий: ${europeData.features.length}`);
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Обновление завершено!');