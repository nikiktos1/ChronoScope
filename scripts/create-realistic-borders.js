const fs = require('fs');
const path = require('path');

// Загружаем современные границы и адаптируем под 1914
const modernData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/europe1914_temp.json'), 'utf8'));

// Функция для упрощения координат (Douglas-Peucker algorithm simplified)
function simplifyCoords(coords, tolerance = 0.1) {
  if (coords.length < 3) return coords;
  const simplified = [coords[0]];
  for (let i = 1; i < coords.length - 1; i++) {
    if (i % 2 === 0) simplified.push(coords[i]); // Берем каждую вторую точку
  }
  simplified.push(coords[coords.length - 1]);
  return simplified;
}

// Создаем данные для Европы 1914
const europe1914 = {
  type: "FeatureCollection",
  features: []
};

// Находим нужные страны и адаптируем их
const countryMapping = {
  "Russia": {name: "Российская империя", ruler: "Николай II", capital: "Санкт-Петербург", government: "Абсолютная монархия", color: "#5B8DBE"},
  "Germany": {name: "Германская империя", ruler: "Вильгельм II", capital: "Берлин", government: "Конституционная монархия", color: "#2C3E50"},
  "France": {name: "Франция", ruler: "Раймон Пуанкаре", capital: "Париж", government: "Республика", color: "#3498DB"},
  "United Kingdom": {name: "Великобритания", ruler: "Георг V", capital: "Лондон", government: "Конституционная монархия", color: "#E67E22"},
  "Italy": {name: "Италия", ruler: "Виктор Эммануил III", capital: "Рим", government: "Конституционная монархия", color: "#27AE60"},
  "Spain": {name: "Испания", ruler: "Альфонсо XIII", capital: "Мадрид", government: "Конституционная монархия", color: "#F39C12"},
  "Portugal": {name: "Португалия", ruler: "Мануэл II", capital: "Лиссабон", government: "Конституционная монархия", color: "#16A085"},
  "Sweden": {name: "Швеция", ruler: "Густав V", capital: "Стокгольм", government: "Конституционная монархия", color: "#3498DB"},
  "Norway": {name: "Норвегия", ruler: "Хокон VII", capital: "Кристиания", government: "Конституционная монархия", color: "#E74C3C"},
  "Denmark": {name: "Дания", ruler: "Кристиан X", capital: "Копенгаген", government: "Конституционная монархия", color: "#E74C3C"},
  "Netherlands": {name: "Нидерланды", ruler: "Вильгельмина", capital: "Амстердам", government: "Конституционная монархия", color: "#E67E22"},
  "Belgium": {name: "Бельгия", ruler: "Альберт I", capital: "Брюссель", government: "Конституционная монархия", color: "#E74C3C"},
  "Switzerland": {name: "Швейцария", ruler: "Федеральный совет", capital: "Берн", government: "Федеративная республика", color: "#E74C3C"},
  "Greece": {name: "Греция", ruler: "Константин I", capital: "Афины", government: "Конституционная монархия", color: "#3498DB"},
  "Romania": {name: "Румыния", ruler: "Кароль I", capital: "Бухарест", government: "Конституционная монархия", color: "#F1C40F"},
  "Bulgaria": {name: "Болгария", ruler: "Фердинанд I", capital: "София", government: "Конституционная монархия", color: "#8E44AD"},
  "Serbia": {name: "Сербия", ruler: "Пётр I", capital: "Белград", government: "Конституционная монархия", color: "#C0392B"}
};

modernData.features.forEach(feature => {
  const countryName = feature.properties.name || feature.properties.NAME || feature.properties.ADMIN;
  
  if (countryMapping[countryName]) {
    const props = countryMapping[countryName];
    europe1914.features.push({
      type: "Feature",
      properties: props,
      geometry: feature.geometry
    });
  }
});

// Добавляем Австро-Венгрию (объединение Австрии и Венгрии)
const austria = modernData.features.find(f => (f.properties.name || f.properties.ADMIN) === "Austria");
const hungary = modernData.features.find(f => (f.properties.name || f.properties.ADMIN) === "Hungary");

if (austria && hungary) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Австро-Венгрия",
      ruler: "Франц Иосиф I",
      capital: "Вена",
      government: "Дуалистическая монархия",
      color: "#E74C3C"
    },
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        austria.geometry.coordinates,
        hungary.geometry.coordinates
      ]
    }
  });
}

// Добавляем Османскую империю (Турция)
const turkey = modernData.features.find(f => (f.properties.name || f.properties.ADMIN) === "Turkey");
if (turkey) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Османская империя",
      ruler: "Мехмед V",
      capital: "Константинополь",
      government: "Абсолютная монархия",
      color: "#9B59B6"
    },
    geometry: turkey.geometry
  });
}

// Сохраняем файл
const outputPath = path.join(__dirname, '../public/data/europe1914.json');
fs.writeFileSync(outputPath, JSON.stringify(europe1914, null, 2));

console.log(`✅ Создан файл с ${europe1914.features.length} странами`);
console.log(`📍 Путь: ${outputPath}`);
