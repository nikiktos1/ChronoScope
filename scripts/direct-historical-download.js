const axios = require('axios');
const fs = require('fs');

// Попробуем прямые ссылки на известные исторические источники
const directSources = [
  // Проверим репозиторий historical-basemaps напрямую
  {
    name: 'Historical Basemaps Repository Check',
    url: 'https://github.com/aourednik/historical-basemaps',
    type: 'repo_check'
  },
  
  // Альтернативные прямые ссылки на исторические данные
  {
    name: 'World Bank Historical Boundaries',
    url: 'https://datahelpdesk.worldbank.org/knowledgebase/articles/902061-country-and-lending-groups-historical-classification',
    type: 'info'
  },
  
  // Попробуем другие известные источники
  {
    name: 'Natural Earth 1914 (если есть)',
    url: 'https://www.naturalearthdata.com/downloads/50m-cultural-vectors/',
    type: 'info'
  },
  
  // Прямые ссылки на файлы, которые могут существовать
  {
    name: 'CShapes Official Site Data',
    url: 'http://nils.weidmann.ws/projects/cshapes/cshapes.zip',
    type: 'download'
  },
  
  {
    name: 'GeaCron Export (если доступен)',
    url: 'http://geacron.com/home-en?&sid=GeaCron896419',
    type: 'info'
  },
  
  // Университетские источники
  {
    name: 'Harvard WorldMap',
    url: 'https://worldmap.harvard.edu/',
    type: 'info'
  },
  
  // Попробуем альтернативные GitHub репозитории
  {
    name: 'Alternative Historical Data 1',
    url: 'https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv',
    type: 'data'
  },
  
  {
    name: 'Alternative Historical Data 2', 
    url: 'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.json',
    type: 'data'
  }
];

async function tryDirectDownload() {
  console.log('🎯 Пробуем прямые ссылки на исторические источники...\n');
  
  for (const source of directSources) {
    try {
      console.log(`🔍 ${source.name}`);
      console.log(`   URL: ${source.url}`);
      
      if (source.type === 'info') {
        console.log('   ℹ️  Информационный ресурс - проверьте вручную');
        continue;
      }
      
      const response = await axios.get(source.url, {
        timeout: 20000,
        maxContentLength: 50 * 1024 * 1024, // 50MB лимит
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*'
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`   Статус: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ Доступен!`);
        console.log(`   📊 Размер: ${response.headers['content-length'] || 'неизвестно'} байт`);
        console.log(`   📄 Тип: ${response.headers['content-type'] || 'неизвестно'}`);
        
        // Если это JSON/GeoJSON
        if (response.data && typeof response.data === 'object') {
          if (response.data.type === 'FeatureCollection') {
            console.log(`   🗺️  GeoJSON с ${response.data.features.length} объектами`);
            
            // Сохраняем
            const filename = `data/found-${source.name.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
            fs.writeFileSync(filename, JSON.stringify(response.data, null, 2));
            console.log(`   💾 Сохранено: ${filename}`);
            
            // Показываем примеры
            if (response.data.features.length > 0) {
              console.log(`   📍 Примеры объектов:`);
              response.data.features.slice(0, 3).forEach(feature => {
                const props = feature.properties;
                const name = props.NAME || props.name || props.ADMIN || 'Неизвестно';
                console.log(`      • ${name}`);
              });
            }
          } else if (Array.isArray(response.data)) {
            console.log(`   📊 Массив с ${response.data.length} элементами`);
          } else {
            console.log(`   📄 JSON объект`);
          }
        } else if (typeof response.data === 'string') {
          if (response.data.includes('FeatureCollection')) {
            console.log(`   🗺️  Возможно GeoJSON (строка)`);
            try {
              const parsed = JSON.parse(response.data);
              if (parsed.type === 'FeatureCollection') {
                console.log(`   ✅ Подтвержден GeoJSON с ${parsed.features.length} объектами`);
              }
            } catch (e) {
              console.log(`   ⚠️  Ошибка парсинга JSON`);
            }
          } else {
            console.log(`   📄 Текстовые данные (${response.data.length} символов)`);
          }
        }
        
      } else {
        console.log(`   ❌ Статус ${response.status}`);
      }
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`   ❌ НЕ НАЙДЕН (404)`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ ДОМЕН НЕ НАЙДЕН`);
      } else {
        console.log(`   ❌ ОШИБКА: ${error.message}`);
      }
    }
    
    console.log('');
  }
  
  console.log('💡 Альтернативные варианты:');
  console.log('1. 🌐 Проверьте сайты вручную в браузере');
  console.log('2. 📧 Свяжитесь с авторами исторических проектов');
  console.log('3. 🏛️  Обратитесь к университетским ГИС центрам');
  console.log('4. 💰 Рассмотрите коммерческие исторические данные');
  console.log('5. ✏️  Создайте границы вручную по историческим картам');
}

tryDirectDownload().catch(console.error);