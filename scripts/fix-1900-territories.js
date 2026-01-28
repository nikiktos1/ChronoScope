const fs = require('fs');

console.log('🔧 Исправление карты 1900 года - добавление недостающих территорий...\n');

// Загружаем данные
const data1900 = JSON.parse(fs.readFileSync('public/data/maps/europe_1900.json', 'utf8'));
const data1914 = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
const data1815 = JSON.parse(fs.readFileSync('public/data/maps/europe_1815.json', 'utf8'));

console.log('Текущие территории в 1900:', data1900.features.length);

// Функция поиска территории по названию
function findTerritory(data, searchTerms) {
  return data.features.find(f => {
    const name = f.properties.name.toLowerCase();
    return searchTerms.some(term => name.includes(term.toLowerCase()));
  });
}

// Ищем недостающие территории
const missingTerritories = [];

// Поиск Британии
let britain = findTerritory(data1900, ['британ', 'british', 'united kingdom', 'англия']);
if (!britain) {
  britain = findTerritory(data1914, ['британ', 'british', 'united kingdom', 'англия']);
  if (!britain) {
    britain = findTerritory(data1815, ['соединённое королевство', 'united kingdom']);
  }
  if (britain) {
    const newBritain = {
      ...britain,
      properties: {
        ...britain.properties,
        name: 'Британская империя',
        originalName: britain.properties.name,
        ruler: 'Виктория',
        capital: 'Лондон',
        government: 'Конституционная монархия',
        description: 'Крупнейшая империя в истории',
        year: 1900,
        period: 'Belle Époque'
      }
    };
    missingTerritories.push(newBritain);
    console.log('✅ Найдена Британия в карте', britain.properties.year || 'другой');
  }
}

// Поиск Испании
let spain = findTerritory(data1900, ['испания', 'spain']);
if (!spain) {
  spain = findTerritory(data1914, ['испания', 'spain']);
  if (!spain) {
    spain = findTerritory(data1815, ['испания', 'spain']);
  }
  if (spain) {
    const newSpain = {
      ...spain,
      properties: {
        ...spain.properties,
        name: 'Испания',
        originalName: spain.properties.name,
        ruler: 'Альфонсо XIII',
        capital: 'Мадрид',
        government: 'Конституционная монархия',
        description: 'Бывшая великая держава, потеряла последние колонии',
        year: 1900,
        period: 'Belle Époque'
      }
    };
    missingTerritories.push(newSpain);
    console.log('✅ Найдена Испания в карте', spain.properties.year || 'другой');
  }
}

// Поиск России
let russia = findTerritory(data1900, ['россия', 'russian', 'росс']);
if (!russia) {
  russia = findTerritory(data1914, ['россия', 'russian', 'росс']);
  if (!russia) {
    russia = findTerritory(data1815, ['россия', 'russian', 'росс']);
  }
  if (russia) {
    const newRussia = {
      ...russia,
      properties: {
        ...russia.properties,
        name: 'Российская империя',
        originalName: russia.properties.name,
        ruler: 'Николай II',
        capital: 'Санкт-Петербург',
        government: 'Абсолютная монархия',
        description: 'Крупнейшая страна мира, на пороге революции',
        year: 1900,
        period: 'Belle Époque'
      }
    };
    missingTerritories.push(newRussia);
    console.log('✅ Найдена Россия в карте', russia.properties.year || 'другой');
  }
}

// Добавляем недостающие территории
if (missingTerritories.length > 0) {
  // Удаляем дубликаты, которые мог добавить предыдущий скрипт
  data1900.features = data1900.features.filter(f => {
    const name = f.properties.name;
    return !(name === 'Британская империя' || name === 'Испания' || name === 'Российская империя') ||
           f.properties.originalName !== name; // Оставляем только оригинальные
  });
  
  data1900.features.push(...missingTerritories);
  console.log(`\n🔧 Добавлено территорий: ${missingTerritories.length}`);
  
  // Сохраняем
  fs.writeFileSync('public/data/maps/europe_1900.json', JSON.stringify(data1900, null, 2));
  console.log('✅ Карта 1900 года обновлена с правильными территориями!');
} else {
  console.log('ℹ️  Все территории уже присутствуют в карте 1900 года');
}

console.log('\nИтого территорий в 1900:', data1900.features.length);