const axios = require('axios');

// Проверим существующие репозитории и их структуру
const repoChecks = [
  // Проверяем сами репозитории (не файлы)
  'https://api.github.com/repos/aourednik/historical-basemaps',
  'https://api.github.com/repos/nils-weidmann/cshapes',
  
  // Альтернативные известные исторические проекты
  'https://api.github.com/repos/datasets/geo-boundaries-world-110m',
  'https://api.github.com/repos/nvkelso/natural-earth-vector',
  'https://api.github.com/repos/holtzy/D3-graph-gallery',
  
  // Поиск по ключевым словам через GitHub API
  'https://api.github.com/search/repositories?q=historical+boundaries+geojson',
  'https://api.github.com/search/repositories?q=cshapes+historical',
  'https://api.github.com/search/repositories?q=1914+borders+geojson'
];

async function searchExistingRepos() {
  console.log('🔍 Ищем РЕАЛЬНО СУЩЕСТВУЮЩИЕ исторические репозитории...\n');
  
  for (const url of repoChecks) {
    try {
      console.log(`📡 Проверяем: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (url.includes('/search/')) {
        // Это поиск репозиториев
        console.log(`✅ Найдено ${response.data.total_count} репозиториев`);
        
        if (response.data.items && response.data.items.length > 0) {
          console.log('   📊 Топ результаты:');
          response.data.items.slice(0, 5).forEach(repo => {
            console.log(`      • ${repo.full_name} - ${repo.description || 'Без описания'}`);
            console.log(`        ⭐ ${repo.stargazers_count} звезд, обновлен: ${repo.updated_at.split('T')[0]}`);
          });
        }
      } else {
        // Это конкретный репозиторий
        console.log(`✅ Репозиторий существует: ${response.data.full_name}`);
        console.log(`   📝 Описание: ${response.data.description || 'Нет описания'}`);
        console.log(`   ⭐ Звезд: ${response.data.stargazers_count}`);
        console.log(`   📅 Обновлен: ${response.data.updated_at.split('T')[0]}`);
        console.log(`   🌐 URL: ${response.data.html_url}`);
        
        // Попробуем получить содержимое репозитория
        try {
          const contentsUrl = `https://api.github.com/repos/${response.data.full_name}/contents`;
          const contentsResponse = await axios.get(contentsUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          console.log('   📁 Содержимое корневой папки:');
          contentsResponse.data.slice(0, 10).forEach(item => {
            console.log(`      ${item.type === 'dir' ? '📁' : '📄'} ${item.name}`);
          });
          
          // Ищем GeoJSON файлы
          const geojsonFiles = contentsResponse.data.filter(item => 
            item.name.toLowerCase().includes('.geojson') || 
            item.name.toLowerCase().includes('1914') ||
            item.name.toLowerCase().includes('historical')
          );
          
          if (geojsonFiles.length > 0) {
            console.log('   🎯 Потенциальные исторические файлы:');
            geojsonFiles.forEach(file => {
              console.log(`      📄 ${file.name} - ${file.download_url}`);
            });
          }
          
        } catch (contentsError) {
          console.log('   ⚠️  Не удалось получить содержимое репозитория');
        }
      }
      
      console.log('');
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`❌ Репозиторий не существует (404)\n`);
      } else {
        console.log(`❌ Ошибка: ${error.message}\n`);
      }
    }
  }
  
  console.log('🎯 Рекомендации:');
  console.log('1. Проверьте найденные репозитории вручную');
  console.log('2. Ищите файлы в подпапках (data/, GeoJSON/, etc.)');
  console.log('3. Возможно, данные в других форматах (Shapefile → конвертация)');
  console.log('4. Рассмотрите коммерческие источники или университетские проекты');
}

searchExistingRepos().catch(console.error);