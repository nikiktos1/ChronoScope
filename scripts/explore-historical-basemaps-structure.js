const axios = require('axios');

async function exploreRepoStructure() {
  console.log('🔍 Исследуем структуру репозитория historical-basemaps...');
  
  // Попробуем найти все возможные файлы и папки
  const pathsToCheck = [
    // Основные папки
    'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/',
    
    // Возможные папки с данными
    'acp',
    'data', 
    'geojson',
    'GeoJSON',
    'maps',
    'historical',
    'boundaries',
    'world',
    'europe',
    'countries',
    
    // Возможные файлы
    'world_1914.geojson',
    'europe_1914.geojson', 
    '1914.geojson',
    'countries_1914.geojson',
    'historical_1914.geojson',
    'boundaries_1914.geojson',
    
    // Другие форматы
    'world_1914.json',
    'europe_1914.json',
    '1914.json'
  ];
  
  const baseUrl = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/';
  
  // Сначала попробуем найти папки
  const folders = ['acp', 'data', 'geojson', 'GeoJSON', 'maps', 'historical', 'boundaries', 'world', 'europe', 'countries'];
  
  for (const folder of folders) {
    console.log(`\n📁 Проверяем папку: ${folder}`);
    
    // Попробуем разные файлы в этой папке
    const filesToTry = [
      '1914.geojson',
      'world_1914.geojson', 
      'europe_1914.geojson',
      'countries_1914.geojson',
      '1914.json',
      'world_1914.json',
      'index.json',
      'README.md'
    ];
    
    for (const file of filesToTry) {
      const fullUrl = `${baseUrl}${folder}/${file}`;
      
      try {
        const response = await axios.head(fullUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.status === 200) {
          console.log(`   ✅ НАЙДЕН: ${folder}/${file}`);
          console.log(`      Размер: ${response.headers['content-length'] || 'неизвестно'} байт`);
          console.log(`      Тип: ${response.headers['content-type'] || 'неизвестно'}`);
          
          // Если это потенциально GeoJSON, попробуем загрузить
          if (file.includes('.geojson') || file.includes('.json')) {
            try {
              const dataResponse = await axios.get(fullUrl, {
                timeout: 15000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              });
              
              if (dataResponse.data && typeof dataResponse.data === 'object') {
                if (dataResponse.data.type === 'FeatureCollection') {
                  console.log(`      🗺️  GeoJSON с ${dataResponse.data.features.length} объектами!`);
                  
                  // Это может быть то что мы ищем!
                  console.log(`\n🎉 ВОЗМОЖНО НАЙДЕНЫ ИСТОРИЧЕСКИЕ ДАННЫЕ!`);
                  console.log(`📍 URL: ${fullUrl}`);
                  
                  return fullUrl;
                }
              }
              
            } catch (downloadError) {
              console.log(`      ⚠️  Ошибка загрузки: ${downloadError.message}`);
            }
          }
        }
        
      } catch (error) {
        // Игнорируем 404 ошибки, они ожидаемы
        if (error.response?.status !== 404) {
          console.log(`   ❌ ${folder}/${file}: ${error.message}`);
        }
      }
    }
  }
  
  // Также попробуем файлы в корне
  console.log(`\n📄 Проверяем файлы в корне репозитория:`);
  
  const rootFiles = [
    'world_1914.geojson',
    'europe_1914.geojson', 
    '1914.geojson',
    'historical_boundaries_1914.geojson',
    'countries_1914.geojson'
  ];
  
  for (const file of rootFiles) {
    const fullUrl = `${baseUrl}${file}`;
    
    try {
      const response = await axios.head(fullUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ НАЙДЕН в корне: ${file}`);
        return fullUrl;
      }
      
    } catch (error) {
      // Игнорируем 404
    }
  }
  
  console.log('\n💡 Рекомендации:');
  console.log('1. Проверьте репозиторий вручную: https://github.com/aourednik/historical-basemaps');
  console.log('2. Посмотрите на структуру файлов в браузере');
  console.log('3. Возможно, файлы в других форматах или с другими названиями');
  console.log('4. Распакуйте скачанный CShapes ZIP файл');
  
  return null;
}

exploreRepoStructure().catch(console.error);