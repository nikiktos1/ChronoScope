const https = require('https');
const fs = require('fs');
const path = require('path');

// Все доступные периоды из GeaCron
const periods = [
  // Древний мир
  'bc10000', 'bc5000', 'bc4000', 'bc3000', 'bc2000', 'bc1500', 'bc1000', 
  'bc700', 'bc500', 'bc400', 'bc323', 'bc300', 'bc200', 'bc100', 'bc1',
  // Античность
  '100', '200', '300', '400',
  // Средневековье
  '500', '600', '700', '800', '900', '1000', '1100', '1200', '1279', '1300',
  // Возрождение
  '1400', '1492', '1500', '1530', '1600', '1650', '1700', '1715', '1783',
  // Новое время
  '1800', '1815', '1880', '1900', '1914', '1920', '1930', '1938', '1945',
  // Современность
  '1960', '1994', '2000', '2010'
];

const BASE_URL = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/';
const outputDir = path.join(__dirname, '../public/data/historical');

// Создаем папку если нет
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`📥 Скачивание ${periods.length} исторических периодов...`);
console.log('⏱️  Это займет 2-3 минуты...\n');

let completed = 0;
let failed = 0;

function downloadPeriod(period) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}world_${period}.geojson`;
    const outputPath = path.join(outputDir, `world_${period}.geojson`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(outputPath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          completed++;
          const percent = ((completed / periods.length) * 100).toFixed(1);
          process.stdout.write(`\r✅ Загружено: ${completed}/${periods.length} (${percent}%)`);
          resolve(true);
        });
      } else {
        failed++;
        console.log(`\n⚠️  Не найден: ${period}`);
        resolve(false);
      }
    }).on('error', (err) => {
      failed++;
      console.log(`\n❌ Ошибка ${period}:`, err.message);
      resolve(false);
    });
  });
}

// Скачиваем по 5 файлов одновременно
async function downloadAll() {
  const batchSize = 5;
  for (let i = 0; i < periods.length; i += batchSize) {
    const batch = periods.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadPeriod));
  }
  
  console.log('\n\n✅ Скачивание завершено!');
  console.log(`📊 Успешно: ${completed}`);
  console.log(`❌ Ошибок: ${failed}`);
  console.log(`📍 Папка: ${outputDir}`);
}

downloadAll();
