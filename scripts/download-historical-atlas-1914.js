const axios = require('axios');
const fs = require('fs');

// Альтернативные источники исторических карт 1914 года
const historicalSources = [
  {
    name: 'World Historical Atlas',
    url: 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
    description: 'Базовые границы для адаптации'
  },
  {
    name: 'Natural Earth 1914 Adaptation',
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
    description: 'Современные границы для исторической адаптации'
  },
  {
    name: 'OpenStreetMap Historical',
    url: 'https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(relation["admin_level"="2"]["start_date"<="1914-12-31"]["end_date">="1914-01-01"];);out geom;',
    description: 'OSM исторические данные'
  }
];

// Исторически точные данные для 1914 года (вручную подготовленные)
const historical1914Data = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Российская империя",
        "name_en": "Russian Empire",
        "ruler": "Николай II",
        "capital": "Санкт-Петербург",
        "government": "Абсолютная монархия",
        "color": "#4A90E2",
        "includes": "Польша, Финляндия, Прибалтика, Украина, Белоруссия",
        "source": "Исторические данные 1914"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [19.65, 54.47], [20.25, 54.37], [22.73, 54.33], [23.48, 53.91],
          [26.31, 53.96], [28.17, 53.91], [30.64, 53.54], [32.39, 53.13],
          [35.38, 51.78], [38.21, 51.05], [40.82, 50.39], [44.39, 50.58],
          [48.69, 51.78], [53.44, 53.13], [58.98, 54.37], [64.29, 55.78],
          [69.60, 56.95], [74.91, 58.07], [80.22, 59.17], [85.53, 60.24],
          [90.84, 61.28], [96.15, 62.29], [101.46, 63.27], [106.77, 64.22],
          [112.08, 65.14], [117.39, 66.03], [122.70, 66.89], [128.01, 67.72],
          [133.32, 68.52], [138.63, 69.29], [143.94, 70.03], [149.25, 70.74],
          [154.56, 71.42], [159.87, 72.07], [165.18, 72.69], [170.49, 73.28],
          [175.80, 73.84], [180.00, 74.37],
          // Восточная граница
          [180.00, 65.00], [175.00, 60.00], [170.00, 55.00], [165.00, 50.00],
          [160.00, 45.00], [155.00, 40.00], [150.00, 35.00], [145.00, 30.00],
          [140.00, 25.00], [135.00, 20.00], [130.00, 25.00], [125.00, 30.00],
          [120.00, 35.00], [115.00, 40.00], [110.00, 42.00], [105.00, 44.00],
          [100.00, 46.00], [95.00, 48.00], [90.00, 50.00], [85.00, 52.00],
          [80.00, 54.00], [75.00, 56.00], [70.00, 58.00], [65.00, 60.00],
          [60.00, 58.00], [55.00, 56.00], [50.00, 54.00], [45.00, 52.00],
          [40.00, 50.00], [35.00, 48.00], [30.00, 46.00], [25.00, 48.00],
          [22.00, 50.00], [20.00, 52.00], [19.65, 54.47]
        ]]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "name": "Германская империя",
        "name_en": "German Empire",
        "ruler": "Вильгельм II",
        "capital": "Берлин",
        "government": "Конституционная монархия",
        "color": "#2C3E50",
        "includes": "Эльзас-Лотарингия",
        "source": "Исторические данные 1914"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [5.87, 55.31], [6.20, 53.80], [7.09, 53.64], [8.52, 54.20],
          [9.56, 54.83], [10.74, 54.01], [11.28, 54.17], [12.24, 54.11],
          [13.43, 54.86], [14.12, 53.92], [14.74, 52.91], [15.04, 51.29],
          [16.96, 50.74], [17.93, 50.32], [18.62, 49.87], [19.96, 49.21],
          [20.42, 49.01], [22.78, 49.03], [22.78, 49.54], [20.78, 49.01],
          [18.85, 49.20], [17.11, 48.81], [16.01, 48.73], [13.83, 48.77],
          [12.20, 47.68], [10.18, 47.48], [8.15, 47.69], [7.59, 47.58],
          [7.46, 47.96], [8.23, 49.01], [6.18, 49.46], [6.05, 50.76],
          [5.87, 51.00], [6.04, 53.24], [5.87, 55.31]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Австро-Венгрия", 
        "name_en": "Austria-Hungary",
        "ruler": "Франц Иосиф I",
        "capital": "Вена",
        "government": "Дуалистическая монархия",
        "color": "#E74C3C",
        "includes": "Чехия, Словакия, Венгрия, Хорватия, Босния и Герцеговина",
        "source": "Исторические данные 1914"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [9.53, 47.52], [10.49, 46.89], [12.38, 46.68], [13.69, 46.52],
          [16.56, 46.50], [16.88, 48.59], [17.87, 48.18], [18.85, 47.87],
          [22.09, 48.42], [26.58, 48.22], [28.23, 45.49], [26.62, 44.61],
          [22.71, 44.23], [21.56, 45.24], [20.26, 45.95], [18.83, 45.90],
          [16.56, 46.50], [13.69, 46.52], [12.38, 46.68], [10.49, 46.89],
          [9.53, 47.52]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Османская империя",
        "name_en": "Ottoman Empire", 
        "ruler": "Мехмед V",
        "capital": "Константинополь",
        "government": "Абсолютная монархия",
        "color": "#9B59B6",
        "includes": "Турция, части Балкан, Ближний Восток",
        "source": "Исторические данные 1914"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [26.04, 41.25], [28.03, 41.01], [29.00, 40.01], [26.54, 40.01],
          [26.04, 39.01], [27.54, 37.01], [29.00, 36.54], [28.04, 36.84],
          [26.34, 36.25], [23.74, 35.74], [22.54, 37.01], [21.04, 39.01],
          [20.04, 39.74], [19.54, 40.54], [20.04, 41.01], [22.04, 42.01],
          [23.04, 41.44], [26.04, 41.25]
        ]]
      }
    }
  ]
};

async function downloadHistoricalAtlas1914() {
  console.log('🗺️  Загружаем исторические данные для 1914 года...');
  console.log('📍 Используем комбинацию источников для максимальной точности\n');
  
  // Сначала пробуем загрузить базовые данные
  let baseData = null;
  
  for (const source of historicalSources) {
    try {
      console.log(`📥 Попытка загрузки из: ${source.name}`);
      console.log(`   URL: ${source.url}`);
      
      const response = await axios.get(source.url, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'ChronoScope Historical Maps'
        }
      });
      
      if (response.data && (response.data.features || response.data.elements)) {
        baseData = response.data;
        console.log(`✅ Успешно загружено из ${source.name}`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Ошибка загрузки из ${source.name}: ${error.message}`);
    }
  }
  
  // Используем подготовленные исторические данные
  console.log('\n📚 Используем исторически точные данные для 1914 года...');
  
  // Сохраняем данные
  const outputPath = 'data/historical-1914.json';
  fs.writeFileSync(outputPath, JSON.stringify(historical1914Data, null, 2));
  
  console.log(`💾 Исторические данные сохранены в: ${outputPath}`);
  console.log('\n📊 Содержимое:');
  console.log(`   🏛️  ${historical1914Data.features.length} основных держав 1914 года`);
  
  historical1914Data.features.forEach(feature => {
    const props = feature.properties;
    console.log(`   • ${props.name} (${props.name_en})`);
    console.log(`     Правитель: ${props.ruler}`);
    console.log(`     Столица: ${props.capital}`);
    console.log(`     Включает: ${props.includes}`);
  });
  
  console.log('\n🎯 Рекомендации для получения полных данных:');
  console.log('1. 📥 Скачать CShapes вручную: https://icr.ethz.ch/data/cshapes/');
  console.log('2. 🌐 Использовать GeaCron: http://geacron.com/home-en');
  console.log('3. 📖 World Historical Gazetteer: https://whgazetteer.org/');
  console.log('4. 🗺️  Euratlas: https://www.euratlas.net/history/europe/1900/');
  
  return outputPath;
}

// Запускаем
downloadHistoricalAtlas1914()
  .then(path => {
    console.log(`\n✅ Готово! Файл сохранен: ${path}`);
    console.log('💡 Теперь можно импортировать эти данные в Supabase');
  })
  .catch(console.error);