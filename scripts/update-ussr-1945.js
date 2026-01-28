import fs from 'fs';

console.log('🇷🇺 Обновление информации о СССР в карте 1945 года...\n');

try {
  // Загружаем европейскую карту 1945
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  console.log('Поиск СССР в карте...');
  
  // Находим СССР в карте
  const ussrIndex = europeData.features.findIndex(f => {
    const name = (f.properties.name || '').toLowerCase();
    const originalName = (f.properties.originalName || '').toLowerCase();
    return name.includes('ussr') || originalName.includes('ussr') || 
           name.includes('soviet') || originalName.includes('soviet');
  });
  
  if (ussrIndex !== -1) {
    console.log('СССР найден, обновляем информацию...');
    
    // Обновляем информацию о СССР
    europeData.features[ussrIndex].properties = {
      ...europeData.features[ussrIndex].properties,
      name: 'СССР',
      originalName: 'USSR',
      ruler: 'Иосиф Сталин',
      capital: 'Москва',
      government: 'Советская социалистическая республика',
      description: 'Союз Советских Социалистических Республик - победитель во Второй мировой войне, новая сверхдержава',
      year: 1945,
      period: 'Послевоенный период',
      color: '#dd3cdf'
    };
    
    console.log('✅ Информация о СССР обновлена');
  } else {
    console.log('❌ СССР не найден в карте');
  }
  
  // Также обновим другие страны, которые не были переведены
  const translations = {
    'Люксембург': {
      name: 'Люксембург',
      ruler: 'Шарлотта',
      capital: 'Люксембург',
      government: 'Великое герцогство',
      description: 'Освобожден союзниками в 1944 году'
    },
    'Швейцария': {
      name: 'Швейцария',
      ruler: 'Федеральный совет',
      capital: 'Берн',
      government: 'Федеративная республика',
      description: 'Сохранила нейтралитет во время войны'
    },
    'Испания': {
      name: 'Испания',
      ruler: 'Франсиско Франко',
      capital: 'Мадрид',
      government: 'Диктатура',
      description: 'Фашистская диктатура, не участвовала в войне'
    },
    'Великобритания': {
      name: 'Великобритания',
      ruler: 'Георг VI',
      capital: 'Лондон',
      government: 'Конституционная монархия',
      description: 'Победитель во Второй мировой войне'
    },
    'Исландия': {
      name: 'Исландия',
      ruler: 'Свейн Бьёрнссон',
      capital: 'Рейкьявик',
      government: 'Республика',
      description: 'Получила независимость от Дании в 1944 году'
    },
    'Ирландия': {
      name: 'Ирландия',
      ruler: 'Шон О\'Келли',
      capital: 'Дублин',
      government: 'Республика',
      description: 'Сохранила нейтралитет во время войны'
    },
    'Бельгия': {
      name: 'Бельгия',
      ruler: 'Леопольд III',
      capital: 'Брюссель',
      government: 'Конституционная монархия',
      description: 'Освобождена союзниками в 1944 году'
    },
    'Венгрия': {
      name: 'Венгрия',
      ruler: 'Золтан Тилди',
      capital: 'Будапешт',
      government: 'Временное правительство',
      description: 'Освобождена Красной армией'
    },
    'Румыния': {
      name: 'Румыния',
      ruler: 'Михай I',
      capital: 'Бухарест',
      government: 'Королевство',
      description: 'Перешла на сторону союзников в 1944'
    },
    'Болгария': {
      name: 'Болгария',
      ruler: 'Симеон II',
      capital: 'София',
      government: 'Царство',
      description: 'Перешла на сторону союзников в 1944'
    },
    'Албания': {
      name: 'Албания',
      ruler: 'Энвер Ходжа',
      capital: 'Тирана',
      government: 'Народная республика',
      description: 'Освобождена коммунистическими партизанами'
    },
    'Португалия': {
      name: 'Португалия',
      ruler: 'Антониу Салазар',
      capital: 'Лиссабон',
      government: 'Авторитарная республика',
      description: 'Диктатура Салазара, сохранила нейтралитет'
    },
    'Турция': {
      name: 'Турция',
      ruler: 'Исмет Инёню',
      capital: 'Анкара',
      government: 'Республика',
      description: 'Объявила войну Германии в феврале 1945'
    },
    'Iran': {
      name: 'Иран',
      ruler: 'Мохаммед Реза Пехлеви',
      capital: 'Тегеран',
      government: 'Шахство',
      description: 'Оккупирован союзниками в 1941-1946'
    },
    'Франция': {
      name: 'Франция',
      ruler: 'Шарль де Голль',
      capital: 'Париж',
      government: 'Временное правительство',
      description: 'Освобождена союзниками, восстановление республики'
    },
    'Польша': {
      name: 'Польша',
      ruler: 'Болеслав Берут',
      capital: 'Варшава',
      government: 'Народная республика',
      description: 'Освобождена Красной армией, коммунистическое правительство'
    },
    'Нидерланды': {
      name: 'Нидерланды',
      ruler: 'Вильгельмина',
      capital: 'Амстердам',
      government: 'Конституционная монархия',
      description: 'Освобождены союзниками в 1945 году'
    },
    'Австрия': {
      name: 'Австрия',
      ruler: 'Карл Реннер',
      capital: 'Вена',
      government: 'Временное правительство',
      description: 'Освобождена от нацистской аннексии'
    },
    'Финляндия': {
      name: 'Финляндия',
      ruler: 'Карл Густав Маннергейм',
      capital: 'Хельсинки',
      government: 'Республика',
      description: 'Подписала сепаратный мир с СССР в 1944'
    },
    'Швеция': {
      name: 'Швеция',
      ruler: 'Густав V',
      capital: 'Стокгольм',
      government: 'Конституционная монархия',
      description: 'Сохранила нейтралитет во время войны'
    },
    'Чехословакия': {
      name: 'Чехословакия',
      ruler: 'Эдвард Бенеш',
      capital: 'Прага',
      government: 'Республика',
      description: 'Восстановлена после освобождения'
    },
    'Югославия': {
      name: 'Югославия',
      ruler: 'Иосип Броз Тито',
      capital: 'Белград',
      government: 'Федеративная республика',
      description: 'Освобождена партизанами Тито'
    },
    'Италия': {
      name: 'Италия',
      ruler: 'Умберто II',
      capital: 'Рим',
      government: 'Королевство (переходный период)',
      description: 'Капитулировала в 1943, освобождена союзниками'
    },
    'USA': {
      name: 'США (зоны оккупации)',
      ruler: 'Гарри Трумэн',
      capital: 'Вашингтон',
      government: 'Федеративная республика',
      description: 'Американские зоны оккупации в Европе'
    },
    'Andorra': {
      name: 'Андорра',
      ruler: 'Со-князья (Франция и Испания)',
      capital: 'Андорра-ла-Велья',
      government: 'Княжество',
      description: 'Микрогосударство в Пиренеях'
    }
  };
  
  console.log('\nОбновление переводов других стран...');
  
  // Обновляем переводы для всех стран
  europeData.features.forEach((feature, index) => {
    const currentName = feature.properties.name;
    
    if (translations[currentName]) {
      const translation = translations[currentName];
      feature.properties = {
        ...feature.properties,
        name: translation.name,
        originalName: currentName,
        ruler: translation.ruler,
        capital: translation.capital,
        government: translation.government,
        description: translation.description,
        year: 1945,
        period: 'Послевоенный период'
      };
      console.log(`✅ ${currentName} → ${translation.name}`);
    } else if (!feature.properties.ruler) {
      // Добавляем базовую информацию для стран без перевода
      feature.properties.year = 1945;
      feature.properties.period = 'Послевоенный период';
    }
  });
  
  // Сохраняем обновленную карту
  fs.writeFileSync('public/data/maps/europe_1945.json', JSON.stringify(europeData, null, 2));
  
  console.log('\n✅ Карта 1945 года полностью обновлена!');
  console.log(`📊 Всего территорий: ${europeData.features.length}`);
  
  // Выводим список всех стран с переводами
  console.log('\n📋 Обновленный список стран:');
  europeData.features.forEach((feature, index) => {
    const name = feature.properties.name;
    const originalName = feature.properties.originalName;
    const displayName = originalName && originalName !== name ? `${name} (${originalName})` : name;
    console.log(`${index + 1}. ${displayName}`);
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Обновление СССР и переводов завершено!');