const fs = require('fs');

console.log('🌍 Перевод world_bc323.geojson на русский язык...\n');

const data = JSON.parse(fs.readFileSync('public/data/historical/world_bc323.geojson', 'utf8'));

// Полный словарь переводов для 323 до н.э.
const translations = {
  'Empire of Alexander': 'Империя Александра Македонского',
  'Bosporan Kingdom': 'Боспорское царство',
  'Rome': 'Римская республика',
  'Greek city-states': 'Греческие полисы',
  'Carthaginian Empire': 'Карфагенская империя',
  'Atropatene': 'Атропатена',
  'Armenia': 'Армения',
  'Colchis': 'Колхида',
  'Cappadocia': 'Каппадокия',
  'Celts': 'Кельтские племена',
  'Sabines': 'Сабины',
  'Saami': 'Саамы',
  'Finno-Ugric taiga hunter-gatherers': 'Финно-угорские охотники тайги',
  'Pomeranian culture': 'Поморская культура',
  'Pomeranian culture ': 'Поморская культура',
  'Sambian-Nothangian culture': 'Самбийско-натангская культура',
  'Bell-shaped burials culture': 'Культура колоколовидных кубков',
  'Western Masurian culture': 'Западно-мазурская культура',
  'Eastern Masurian culture': 'Восточно-мазурская культура',
  'Curonians': 'Курши',
  'Brushed Pottery culture': 'Культура штрихованной керамики',
  'Milograd culture': 'Милоградская культура',
  'Plain-Pottery culture': 'Культура гладкой керамики',
  
  // Азия
  'Qin': 'Царство Цинь',
  'Yue': 'Царство Юэ',
  'Zhow states': 'Государства Чжоу',
  'Magadha': 'Магадха',
  'Hindu kingdoms': 'Индуистские царства',
  'Hindu kingdoms and republics': 'Индуистские царства и республики',
  'Simhala': 'Сингала',
  'Zhangzhung Kingdom': 'Царство Шаншун',
  'Ainu': 'Айны',
  'Paleo-Siberian hunter-gatherers': 'Палеосибирские охотники-собиратели',
  
  // Ближний Восток и Африка
  'Saba': 'Сабейское царство',
  'Qataban': 'Катабан',
  'Hadramaut': 'Хадрамаут',
  'Meroe': 'Мероэ',
  'Blemmyes': 'Блеммии',
  'Ethiopian highland farmers': 'Эфиопские горные земледельцы',
  'Saharan Pastoral Nomads': 'Сахарские кочевники-скотоводы',
  'West African cereal farmers': 'Западноафриканские земледельцы',
  'Khoiasan': 'Койсанские народы',
  'Savanna hunter-gatherers': 'Охотники-собиратели саванны',
  'Desert hunter-gatherers': 'Охотники-собиратели пустынь',
  
  // Америка
  'Teotihuac�n': 'Теотиуакан',
  'Monte Alb�n': 'Монте-Альбан',
  'Maya chiefdoms and states': 'Майяские вождества и государства',
  'Adena Culture': 'Культура Адена',
  'Glades Culture': 'Культура Глейдс',
  'Chavin': 'Чавин',
  'Paracas': 'Паракас',
  'Chorrera': 'Чоррера',
  'Wankarani': 'Ванкарани',
  'Manioc farmers': 'Земледельцы маниока',
  'Amazon hunter-gatherers': 'Охотники-собиратели Амазонии',
  'Andean hunter-gatherers': 'Охотники-собиратели Анд',
  'Caribbean hunter-gatherers': 'Охотники-собиратели Карибов',
  'Pampas cultures': 'Культуры пампасов',
  'Patagonian shellfish and marine mammal hunters': 'Охотники Патагонии',
  'Plain bison hunters': 'Охотники на бизонов равнин',
  'Eastern North Amercian hunter-gatherers': 'Охотники-собиратели восточной Северной Америки',
  'Plateau fichers and hunter gatherers': 'Рыболовы и охотники плато',
  'North American Pacifi foraging, hunting and fishing peoples': 'Народы тихоокеанского побережья Северной Америки',
  'Subarctic forest hunter-gatherers': 'Охотники-собиратели субарктических лесов',
  'Arctic marine mammal hunters': 'Охотники на морских млекопитающих Арктики',
  'Shellfish gatherers': 'Собиратели моллюсков',
  
  // Океания
  'Australian aboriginal hunter-gatherers': 'Австралийские аборигены',
  'Tasmanian hunter-gatherers': 'Тасманийские охотники-собиратели',
  'Guanches': 'Гуанчи'
};

console.log(`Словарь содержит ${Object.keys(translations).length} переводов\n`);

let translated = 0;
let notFound = 0;

data.features.forEach((feature, index) => {
  const originalName = feature.properties.NAME;
  
  if (originalName && originalName !== 'null') {
    if (translations[originalName]) {
      feature.properties.name = translations[originalName];
      feature.properties.originalName = originalName;
      translated++;
    } else {
      console.log(`⚠️  Перевод не найден: ${originalName}`);
      notFound++;
    }
  }
});

// Сохраняем обновленные данные
fs.writeFileSync(
  'public/data/historical/world_bc323.geojson',
  JSON.stringify(data, null, 2)
);

console.log(`\n✅ Переведено: ${translated}`);
console.log(`⚠️  Не найдено переводов: ${notFound}`);
console.log('\n✅ Файл world_bc323.geojson обновлен!');
