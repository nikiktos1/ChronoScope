const fs = require('fs');
const path = require('path');

// Добавляем отсутствующие страны вручную
// Используем границы России из других периодов

function addMissingCountries() {
  // Функция для загрузки страны из исходного датасета
  function loadCountryFromSource(year, countryName) {
    try {
      const sourceData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
      const features = sourceData.features.filter(f => 
        f.properties.SUBJECTO === countryName
      );
      
      if (features.length === 0) return null;
      
      // Объединяем все части страны
      const coords = [];
      features.forEach(f => {
        if (f.geometry.type === 'Polygon') {
          coords.push(f.geometry.coordinates);
        } else if (f.geometry.type === 'MultiPolygon') {
          coords.push(...f.geometry.coordinates);
        }
      });
      
      return {
        type: features.length === 1 && features[0].geometry.type === 'Polygon' 
          ? 'Polygon' 
          : 'MultiPolygon',
        coordinates: features.length === 1 && features[0].geometry.type === 'Polygon'
          ? features[0].geometry.coordinates
          : coords
      };
    } catch (e) {
      return null;
    }
  }
  
  // Загружаем границу России из 1914 как запасной вариант
  const russia1914 = JSON.parse(fs.readFileSync('public/data/maps/europe_1914.json', 'utf8'));
  const russiaFeature = russia1914.features.find(f => 
    f.properties.originalName === 'Russia'
  );
  
  if (!russiaFeature) {
    console.log('❌ Не найдена Россия в 1914');
    return;
  }
  
  // 1920 - НЕ добавляем, там гражданская война
  console.log('⚠️  1920: Пропущено (гражданская война)');
  
  // 1938 - обновляем Турцию, Греция, добавляем СССР
  const map1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
  
  // Удаляем старые версии
  map1938.features = map1938.features.filter(f => 
    !['Turkey', 'Greece', 'Soviet Union'].includes(f.properties.originalName)
  );
  
  // Добавляем из исходных данных
  const turkey1938 = loadCountryFromSource('1938', 'Turkey');
  const greece1938 = loadCountryFromSource('1938', 'Greece');
  
  if (turkey1938) {
    map1938.features.push({
      type: "Feature",
      properties: { name: "Турция", originalName: "Turkey", color: "#9B59B6" },
      geometry: turkey1938
    });
  }
  
  if (greece1938) {
    map1938.features.push({
      type: "Feature",
      properties: { name: "Греция", originalName: "Greece", color: "#3498DB" },
      geometry: greece1938
    });
  }
  
  // СССР используем границы России 1914 (приблизительно)
  map1938.features.push({
    type: "Feature",
    properties: { name: "СССР", originalName: "Soviet Union", color: "#CC0000" },
    geometry: russiaFeature.geometry
  });
  
  fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(map1938));
  console.log('✅ Обновлен 1938: Турция, Греция, СССР');
  
  // 1945 - обновляем границы
  const map1945 = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  map1945.features = map1945.features.filter(f => 
    !['Turkey', 'Greece', 'Soviet Union'].includes(f.properties.originalName)
  );
  
  const turkey1945 = loadCountryFromSource('1945', 'Turkey');
  const greece1945 = loadCountryFromSource('1945', 'Greece');
  
  if (turkey1945) {
    map1945.features.push({
      type: "Feature",
      properties: { name: "Турция", originalName: "Turkey", color: "#9B59B6" },
      geometry: turkey1945
    });
  }
  
  if (greece1945) {
    map1945.features.push({
      type: "Feature",
      properties: { name: "Греция", originalName: "Greece", color: "#3498DB" },
      geometry: greece1945
    });
  }
  
  map1945.features.push({
    type: "Feature",
    properties: { name: "СССР", originalName: "Soviet Union", color: "#CC0000" },
    geometry: russiaFeature.geometry
  });
  
  fs.writeFileSync('public/data/maps/europe_1945.json', JSON.stringify(map1945));
  console.log('✅ Обновлен 1945: Турция, Греция, СССР');
  
  // 2000 - обновляем границы
  const map2000 = JSON.parse(fs.readFileSync('public/data/maps/europe_2000.json', 'utf8'));
  
  map2000.features = map2000.features.filter(f => 
    !['Turkey', 'Greece', 'Russian Federation', 'Russia'].includes(f.properties.originalName)
  );
  
  const turkey2000 = loadCountryFromSource('2000', 'Turkey');
  const greece2000 = loadCountryFromSource('2000', 'Greece');
  
  if (turkey2000) {
    map2000.features.push({
      type: "Feature",
      properties: { name: "Турция", originalName: "Turkey", color: "#9B59B6" },
      geometry: turkey2000
    });
  }
  
  if (greece2000) {
    map2000.features.push({
      type: "Feature",
      properties: { name: "Греция", originalName: "Greece", color: "#3498DB" },
      geometry: greece2000
    });
  }
  
  // РФ - используем современные границы России (меньше чем СССР)
  map2000.features.push({
    type: "Feature",
    properties: { name: "Российская Федерация", originalName: "Russian Federation", color: "#0039A6" },
    geometry: russiaFeature.geometry // TODO: нужны реальные границы РФ
  });
  
  fs.writeFileSync('public/data/maps/europe_2000.json', JSON.stringify(map2000));
  console.log('✅ Обновлен 2000: Турция, Греция, РФ');
  
  // 1900 - добавляем РИ
  const map1900 = JSON.parse(fs.readFileSync('public/data/maps/europe_1900.json', 'utf8'));
  const hasRI = map1900.features.some(f => 
    f.properties.originalName === 'Russia'
  );
  
  if (!hasRI) {
    map1900.features.push({
      type: "Feature",
      properties: {
        name: "Российская империя",
        originalName: "Russia",
        color: "#5B8DBE"
      },
      geometry: russiaFeature.geometry
    });
    fs.writeFileSync('public/data/maps/europe_1900.json', JSON.stringify(map1900));
    console.log('✅ Добавлена РИ в 1900');
  }
  
  console.log('\n✅ Все российские государства добавлены!');
}

addMissingCountries();
