const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf'); // Для геометрических операций

/**
 * Конвертирует векторную карту в растровую сетку
 * Адаптивное разрешение: 1км для Европы, 10км для остального
 */

function vectorToRaster(vectorMap, options = {}) {
  const {
    europeResolution = 0.01,  // ~1 км (0.01 градуса)
    worldResolution = 0.1,    // ~10 км (0.1 градуса)
    europeBounds = {          // Границы Европы
      minLat: 35, maxLat: 72,
      minLon: -10, maxLon: 40
    }
  } = options;
  
  const rasterData = {};
  let totalPoints = 0;
  
  console.log('🎨 Конвертация вектор → растр...');
  
  vectorMap.features.forEach((feature, index) => {
    const countryName = feature.properties.name;
    const geometry = feature.geometry;
    
    console.log(`  [${index + 1}/${vectorMap.features.length}] ${countryName}`);
    
    // Определяем границы страны
    const bbox = turf.bbox(feature);
    const [minLon, minLat, maxLon, maxLat] = bbox;
    
    // Определяем разрешение (Европа или остальной мир)
    const isEurope = (
      minLat >= europeBounds.minLat && maxLat <= europeBounds.maxLat &&
      minLon >= europeBounds.minLon && maxLon <= europeBounds.maxLon
    );
    
    const resolution = isEurope ? europeResolution : worldResolution;
    const resolutionKm = isEurope ? '1 км' : '10 км';
    
    console.log(`    Разрешение: ${resolutionKm}`);
    
    // Генерируем сетку точек
    let countryPoints = 0;
    for (let lat = minLat; lat <= maxLat; lat += resolution) {
      for (let lon = minLon; lon <= maxLon; lon += resolution) {
        const point = turf.point([lon, lat]);
        
        // Проверяем, находится ли точка внутри страны
        try {
          if (turf.booleanPointInPolygon(point, feature)) {
            const key = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
            rasterData[key] = countryName;
            countryPoints++;
            totalPoints++;
          }
        } catch (e) {
          // Игнорируем ошибки для сложных полигонов
        }
      }
    }
    
    console.log(`    Точек: ${countryPoints}`);
  });
  
  console.log(`\n✅ Готово! Всего точек: ${totalPoints}`);
  
  return rasterData;
}

// Пример использования
async function convertMap1914() {
  console.log('📥 Загрузка векторной карты 1914...');
  
  const vectorMap = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../public/data/europe1914.json'), 'utf8')
  );
  
  console.log(`📊 Стран: ${vectorMap.features.length}\n`);
  
  const rasterMap = vectorToRaster(vectorMap);
  
  // Сохраняем
  const outputPath = path.join(__dirname, '../public/data/raster_1914.json');
  fs.writeFileSync(outputPath, JSON.stringify(rasterMap, null, 2));
  
  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`\n💾 Размер файла: ${sizeKB} КБ`);
  console.log(`📍 Путь: ${outputPath}`);
}

// Запуск
if (require.main === module) {
  // Проверяем наличие turf
  try {
    require('@turf/turf');
    convertMap1914();
  } catch (e) {
    console.log('❌ Требуется установить @turf/turf');
    console.log('   Команда: pnpm add @turf/turf');
  }
}

module.exports = { vectorToRaster };
