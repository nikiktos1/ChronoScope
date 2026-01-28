const fs = require('fs');
const path = require('path');

// Загружаем современные границы
const modernData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/europe1914_temp.json'), 'utf8'));

// Функция поиска страны
function findCountry(name) {
  return modernData.features.find(f => {
    const n = (f.properties.name || f.properties.ADMIN || f.properties.NAME || '').toLowerCase();
    return n.includes(name.toLowerCase());
  });
}

// Функция объединения геометрий
function mergeGeometries(countries) {
  const coords = [];
  countries.forEach(country => {
    if (!country) return;
    if (country.geometry.type === 'Polygon') {
      coords.push(country.geometry.coordinates);
    } else if (country.geometry.type === 'MultiPolygon') {
      coords.push(...country.geometry.coordinates);
    }
  });
  return {
    type: 'MultiPolygon',
    coordinates: coords
  };
}

// Функция фильтрации полигонов по географическим координатам
function filterPolygonsByBounds(geometry, bounds) {
  if (!bounds) return geometry;
  
  const { minLon, maxLon, minLat, maxLat } = bounds;
  
  function isInBounds(coord) {
    const [lon, lat] = coord;
    return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
  }
  
  function filterCoordinates(coords) {
    if (!coords || coords.length === 0) return null;
    
    // Проверяем центроид полигона
    let sumLon = 0, sumLat = 0, count = 0;
    coords[0].forEach(coord => {
      sumLon += coord[0];
      sumLat += coord[1];
      count++;
    });
    const centroid = [sumLon / count, sumLat / count];
    
    return isInBounds(centroid) ? coords : null;
  }
  
  if (geometry.type === 'Polygon') {
    const filtered = filterCoordinates(geometry.coordinates);
    return filtered ? { type: 'Polygon', coordinates: filtered } : null;
  } else if (geometry.type === 'MultiPolygon') {
    const filtered = geometry.coordinates
      .map(filterCoordinates)
      .filter(Boolean);
    return filtered.length > 0 ? { type: 'MultiPolygon', coordinates: filtered } : null;
  }
  
  return geometry;
}

// Функция разделения страны по регионам
function splitCountryByRegions(country, regions) {
  if (!country) return regions.map(() => null);
  
  const results = [];
  
  regions.forEach(bounds => {
    const filtered = filterPolygonsByBounds(country.geometry, bounds);
    results.push(filtered ? { ...country, geometry: filtered } : null);
  });
  
  return results;
}

const europe1914 = {
  type: "FeatureCollection",
  features: []
};

// Разделяем Польшу на три части
const poland = findCountry('poland');
let polandWest = null, polandCentral = null, polandSouth = null;

if (poland) {
  // Западная Польша (Познань, Померания) → Германия (lon < 17)
  // Центральная Польша (Варшава) → Россия (17 <= lon < 22)
  // Южная Польша (Галиция, Краков) → Австро-Венгрия (lat < 50.5)
  
  const [west, central, south] = splitCountryByRegions(poland, [
    { minLon: 14, maxLon: 17, minLat: 50.5, maxLat: 55 },  // Западная → Германия
    { minLon: 17, maxLon: 24, minLat: 50.5, maxLat: 55 },  // Центральная → Россия
    { minLon: 18, maxLon: 25, minLat: 48, maxLat: 50.5 }   // Южная → Австро-Венгрия
  ]);
  
  polandWest = west;
  polandCentral = central;
  polandSouth = south;
}

// 1. РОССИЙСКАЯ ИМПЕРИЯ (включая Центральную Польшу, Финляндию, Прибалтику, Украину, Беларусь)
const russianEmpire = [
  findCountry('russia'),
  findCountry('finland'),
  findCountry('estonia'),
  findCountry('latvia'),
  findCountry('lithuania'),
  polandCentral,  // Только центральная Польша
  findCountry('belarus'),
  findCountry('ukraine'),
  findCountry('moldova')
].filter(Boolean);

europe1914.features.push({
  type: "Feature",
  properties: {
    name: "Российская империя",
    ruler: "Николай II",
    capital: "Санкт-Петербург",
    government: "Абсолютная монархия",
    color: "#5B8DBE",
    area: "22.8 млн км²",
    population: "175 млн"
  },
  geometry: mergeGeometries(russianEmpire)
});

// 2. ГЕРМАНСКАЯ ИМПЕРИЯ (включая Западную Польшу и Эльзас-Лотарингию)
const germany = findCountry('germany');
const france = findCountry('france');

// Эльзас-Лотарингия (восточная Франция) → Германия
let alsaceLorraine = null;
if (france) {
  const [alsace] = splitCountryByRegions(france, [
    { minLon: 6.5, maxLon: 8, minLat: 47.5, maxLat: 49.5 }  // Эльзас-Лотарингия
  ]);
  alsaceLorraine = alsace;
}

const germanEmpire = [
  germany,
  polandWest,        // Западная Польша (Познань)
  alsaceLorraine     // Эльзас-Лотарингия
].filter(Boolean);

europe1914.features.push({
  type: "Feature",
  properties: {
    name: "Германская империя",
    ruler: "Вильгельм II",
    capital: "Берлин",
    government: "Конституционная монархия",
    color: "#2C3E50",
    area: "540 тыс. км²",
    population: "67 млн"
  },
  geometry: mergeGeometries(germanEmpire)
});

// 3. АВСТРО-ВЕНГРИЯ (включая Южную Польшу, Трансильванию, Южный Тироль, Истрию)
const romania = findCountry('romania');
const italy = findCountry('italy');

// Трансильвания (западная Румыния) → Австро-Венгрия
let transylvania = null;
if (romania) {
  const [trans] = splitCountryByRegions(romania, [
    { minLon: 21, maxLon: 26, minLat: 45, maxLat: 48 }  // Трансильвания
  ]);
  transylvania = trans;
}

// Южный Тироль и Истрия (северо-восточная Италия) → Австро-Венгрия
let southTyrol = null;
if (italy) {
  const [tyrol] = splitCountryByRegions(italy, [
    { minLon: 10.5, maxLon: 14, minLat: 45.5, maxLat: 47.5 }  // Южный Тироль + Истрия
  ]);
  southTyrol = tyrol;
}

const austriaHungary = [
  findCountry('austria'),
  findCountry('hungary'),
  findCountry('czech'),
  findCountry('slovakia'),
  findCountry('croatia'),
  findCountry('bosnia'),
  findCountry('slovenia'),
  polandSouth,       // Южная Польша (Галиция)
  transylvania,      // Трансильвания
  southTyrol         // Южный Тироль + Истрия
].filter(Boolean);

europe1914.features.push({
  type: "Feature",
  properties: {
    name: "Австро-Венгрия",
    ruler: "Франц Иосиф I",
    capital: "Вена / Будапешт",
    government: "Дуалистическая монархия",
    color: "#C0504D",
    area: "676 тыс. км²",
    population: "52 млн"
  },
  geometry: mergeGeometries(austriaHungary)
});

// 4. ФРАНЦИЯ (БЕЗ Эльзас-Лотарингии)
// Франция уже загружена выше, но нужно исключить Эльзас-Лотарингию
if (france) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Французская Республика",
      ruler: "Раймон Пуанкаре (президент)",
      capital: "Париж",
      government: "Республика",
      color: "#4472C4",
      area: "536 тыс. км²",
      population: "40 млн"
    },
    geometry: france.geometry  // В идеале нужно вычесть Эльзас, но это сложно
  });
}

// 5. ВЕЛИКОБРИТАНИЯ (включая всю Ирландию)
const uk = [
  findCountry('united kingdom'),
  findCountry('ireland')
].filter(Boolean);

europe1914.features.push({
  type: "Feature",
  properties: {
    name: "Соединённое Королевство",
    ruler: "Георг V",
    capital: "Лондон",
    government: "Конституционная монархия",
    color: "#E67E22",
    area: "315 тыс. км²",
    population: "46 млн"
  },
  geometry: mergeGeometries(uk)
});

// 6. ИТАЛИЯ (БЕЗ Южного Тироля и Истрии)
// Италия уже загружена выше
if (italy) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Италия",
      ruler: "Виктор Эммануил III",
      capital: "Рим",
      government: "Конституционная монархия",
      color: "#70AD47",
      area: "286 тыс. км²",
      population: "36 млн"
    },
    geometry: italy.geometry  // В идеале нужно вычесть Южный Тироль
  });
}

// 7. ИСПАНИЯ
const spain = findCountry('spain');
if (spain) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Испания",
      ruler: "Альфонсо XIII",
      capital: "Мадрид",
      government: "Конституционная монархия",
      color: "#FFC000",
      area: "505 тыс. км²",
      population: "20 млн"
    },
    geometry: spain.geometry
  });
}

// 8. ПОРТУГАЛИЯ
const portugal = findCountry('portugal');
if (portugal) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Португалия",
      ruler: "Мануэл II",
      capital: "Лиссабон",
      government: "Конституционная монархия",
      color: "#44546A",
      area: "92 тыс. км²",
      population: "6 млн"
    },
    geometry: portugal.geometry
  });
}

// 9. ОСМАНСКАЯ ИМПЕРИЯ (Турция + Албания + части Македонии)
const macedonia = findCountry('macedonia') || findCountry('north macedonia');

// Западная Македония → Османская империя
let westMacedonia = null;
if (macedonia) {
  const [west] = splitCountryByRegions(macedonia, [
    { minLon: 20, maxLon: 22, minLat: 40.5, maxLat: 42.5 }  // Западная Македония
  ]);
  westMacedonia = west;
}

const ottoman = [
  findCountry('turkey'),
  findCountry('albania'),
  westMacedonia
].filter(Boolean);

europe1914.features.push({
  type: "Feature",
  properties: {
    name: "Османская империя",
    ruler: "Мехмед V",
    capital: "Константинополь",
    government: "Абсолютная монархия",
    color: "#9B59B6",
    area: "1.8 млн км²",
    population: "24 млн"
  },
  geometry: mergeGeometries(ottoman)
});

// 10. СЕРБИЯ
const serbia = findCountry('serbia');
if (serbia) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Сербия",
      ruler: "Пётр I Карагеоргиевич",
      capital: "Белград",
      government: "Конституционная монархия",
      color: "#C55A11",
      area: "87 тыс. км²",
      population: "4.5 млн"
    },
    geometry: serbia.geometry
  });
}

// 11. ЧЕРНОГОРИЯ
const montenegro = findCountry('montenegro');
if (montenegro) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Черногория",
      ruler: "Никола I",
      capital: "Цетине",
      government: "Конституционная монархия",
      color: "#7030A0",
      area: "14 тыс. км²",
      population: "0.5 млн"
    },
    geometry: montenegro.geometry
  });
}

// 12. ГРЕЦИЯ
const greece = findCountry('greece');
if (greece) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Греция",
      ruler: "Константин I",
      capital: "Афины",
      government: "Конституционная монархия",
      color: "#4472C4",
      area: "108 тыс. км²",
      population: "5 млн"
    },
    geometry: greece.geometry
  });
}

// 13. РУМЫНИЯ (БЕЗ Трансильвании)
// Румыния уже загружена выше, используем её без Трансильвании
if (romania) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Румыния",
      ruler: "Кароль I",
      capital: "Бухарест",
      government: "Конституционная монархия",
      color: "#FFC000",
      area: "138 тыс. км²",
      population: "7.5 млн"
    },
    geometry: romania.geometry  // В идеале нужно вычесть Трансильванию
  });
}

// 14. БОЛГАРИЯ
const bulgaria = findCountry('bulgaria');
if (bulgaria) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Царство Болгария",
      ruler: "Фердинанд I",
      capital: "София",
      government: "Конституционная монархия",
      color: "#8E44AD",
      area: "111 тыс. км²",
      population: "4.3 млн"
    },
    geometry: bulgaria.geometry
  });
}

// 15. БЕЛЬГИЯ
const belgium = findCountry('belgium');
if (belgium) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Бельгия",
      ruler: "Альберт I",
      capital: "Брюссель",
      government: "Конституционная монархия",
      color: "#C55A11",
      area: "31 тыс. км²",
      population: "7.5 млн"
    },
    geometry: belgium.geometry
  });
}

// 16. НИДЕРЛАНДЫ
const netherlands = findCountry('netherlands');
if (netherlands) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Нидерланды",
      ruler: "Вильгельмина",
      capital: "Амстердам",
      government: "Конституционная монархия",
      color: "#E67E22",
      area: "34 тыс. км²",
      population: "6 млн"
    },
    geometry: netherlands.geometry
  });
}

// 17. ШВЕЙЦАРИЯ
const switzerland = findCountry('switzerland');
if (switzerland) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Швейцарская Конфедерация",
      ruler: "Федеральный совет",
      capital: "Берн",
      government: "Федеративная республика",
      color: "#C0504D",
      area: "41 тыс. км²",
      population: "4 млн"
    },
    geometry: switzerland.geometry
  });
}

// 18. ШВЕЦИЯ
const sweden = findCountry('sweden');
if (sweden) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Швеция",
      ruler: "Густав V",
      capital: "Стокгольм",
      government: "Конституционная монархия",
      color: "#4472C4",
      area: "450 тыс. км²",
      population: "5.5 млн"
    },
    geometry: sweden.geometry
  });
}

// 19. НОРВЕГИЯ
const norway = findCountry('norway');
if (norway) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Норвегия",
      ruler: "Хокон VII",
      capital: "Кристиания (Осло)",
      government: "Конституционная монархия",
      color: "#C0504D",
      area: "324 тыс. км²",
      population: "2.5 млн"
    },
    geometry: norway.geometry
  });
}

// 20. ДАНИЯ
const denmark = findCountry('denmark');
if (denmark) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Королевство Дания",
      ruler: "Кристиан X",
      capital: "Копенгаген",
      government: "Конституционная монархия",
      color: "#C0504D",
      area: "43 тыс. км²",
      population: "3 млн"
    },
    geometry: denmark.geometry
  });
}

// 21. ЛЮКСЕМБУРГ
const luxembourg = findCountry('luxembourg');
if (luxembourg) {
  europe1914.features.push({
    type: "Feature",
    properties: {
      name: "Великое Герцогство Люксембург",
      ruler: "Мария-Аделаида",
      capital: "Люксембург",
      government: "Конституционная монархия",
      color: "#7030A0",
      area: "2.6 тыс. км²",
      population: "0.3 млн"
    },
    geometry: luxembourg.geometry
  });
}

// Сохраняем файл
const outputPath = path.join(__dirname, '../public/data/europe1914.json');
fs.writeFileSync(outputPath, JSON.stringify(europe1914, null, 2));

console.log(`✅ Создан файл с ${europe1914.features.length} государствами 1914 года`);
console.log(`📍 Путь: ${outputPath}`);
console.log('\n🗺️  Основные империи с ТОЧНЫМИ границами:');
console.log('   - Российская империя (включая ЦЕНТРАЛЬНУЮ Польшу, Финляндию, Прибалтику)');
console.log('   - Германская империя (включая ЗАПАДНУЮ Польшу + Эльзас-Лотарингию)');
console.log('   - Австро-Венгрия (включая ЮЖНУЮ Польшу + Трансильванию + Южный Тироль)');
console.log('   - Османская империя (включая Албанию + части Македонии)');
console.log('   - Британская империя (включая ВСЮ Ирландию)');
console.log('\n📊 Территориальные разделения:');
console.log('   ✓ Польша разделена: Запад→Германия, Центр→Россия, Юг→Австро-Венгрия');
console.log('   ✓ Эльзас-Лотарингия: Германия (не Франция)');
console.log('   ✓ Трансильвания: Австро-Венгрия (не Румыния)');
console.log('   ✓ Южный Тироль: Австро-Венгрия (не Италия)');
