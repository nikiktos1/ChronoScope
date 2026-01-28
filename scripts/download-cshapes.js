const https = require('https');
const fs = require('fs');
const path = require('path');

// CShapes - границы каждого года 1886-2019
const CSHAPES_URL = 'http://downloads.weidmann.ws/cshapes/Shapefiles/cshapes_0.6.zip';

console.log('📥 Скачивание CShapes dataset...');
console.log('📊 Содержит: границы КАЖДОГО года с 1886 по 2019');
console.log('⏱️  Это займет 2-3 минуты...\n');

const outputPath = path.join(__dirname, '../public/data/cshapes.zip');
const file = fs.createWriteStream(outputPath);

https.get(CSHAPES_URL, (response) => {
  const totalSize = parseInt(response.headers['content-length'], 10);
  let downloaded = 0;
  
  response.on('data', (chunk) => {
    downloaded += chunk.length;
    const percent = ((downloaded / totalSize) * 100).toFixed(1);
    process.stdout.write(`\r📥 Загружено: ${percent}%`);
  });
  
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('\n\n✅ CShapes скачан!');
    console.log('📍 Путь:', outputPath);
    console.log('\n📝 Следующий шаг: конвертировать Shapefile → GeoJSON');
    console.log('   Команда: ogr2ogr -f GeoJSON output.geojson cshapes.shp');
  });
}).on('error', (err) => {
  fs.unlink(outputPath, () => {});
  console.error('❌ Ошибка:', err.message);
});
