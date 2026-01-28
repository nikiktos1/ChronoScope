const fs = require('fs');

console.log('🌍 Добавление Швейцарии, Норвегии, Датской Гренландии и РФ на карту 2000 года...\n');

try {
  // Загружаем карту 2000 года
  const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_2000.geojson', 'utf8'));
  
  console.log(`📊 Текущее количество территорий: ${worldData.features.length}`);
  
  // Функция для поиска страны в других годах
  function findCountryInOtherYears(countryNames, years = ['2010', '1994', '1960', '1945']) {
    for (const year of years) {
      try {
        const otherYearData = JSON.parse(fs.readFileSync(`public/data/historical/world_${year}.geojson`, 'utf8'));
        
        for (const countryName of countryNames) {
          const features = otherYearData.features.filter(f => {
            const name = (f.properties.NAME || '').toLowerCase();
            const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
            const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
            
            return name.includes(countryName.toLowerCase()) || 
                   subjecto.includes(countryName.toLowerCase()) ||
                   abbrevn.includes(countryName.toLowerCase());
          });
          
          if (features.length > 0) {
            console.log(`✅ ${countryName} найдена в данных ${year}: ${features[0].properties.NAME || features[0].properties.SUBJECTO}`);
            return features;
          }
        }
      } catch (e) {
        console.log(`⚠️ Не удалось загрузить данные ${year}`);
      }
    }
    return null;
  }
  
  // Проверяем, какие страны уже есть в 2000 году
  function checkIfCountryExists(countryNames) {
    return worldData.features.filter(f => {
      const name = (f.properties.NAME || '').toLowerCase();
      const subjecto = (f.properties.SUBJECTO || '').toLowerCase();
      const abbrevn = (f.properties.ABBREVN || '').toLowerCase();
      
      return countryNames.some(countryName => 
        name.includes(countryName.toLowerCase()) || 
        subjecto.includes(countryName.toLowerCase()) ||
        abbrevn.includes(countryName.toLowerCase())
      );
    });
  }
  
  let addedCount = 0;
  
  // 1. Швейцария
  console.log('\n🇨🇭 Поиск Швейцарии...');
  const existingSwitzerland = checkIfCountryExists(['switzerland', 'швейцария']);
  if (existingSwitzerland.length > 0) {
    console.log(`✅ Швейцария уже есть: ${existingSwitzerland[0].properties.NAME}`);
  } else {
    const switzerlandFeatures = findCountryInOtherYears(['switzerland']);
    if (switzerlandFeatures && switzerlandFeatures.length > 0) {
      const switzerland = {
        type: 'Feature',
        properties: {
          NAME: 'Switzerland',
          ABBREVN: 'Switzerland',
          SUBJECTO: 'Switzerland',
          BORDERPRECISION: 3,
          PARTOF: 'Switzerland'
        },
        geometry: switzerlandFeatures[0].geometry
      };
      worldData.features.push(switzerland);
      addedCount++;
      console.log('✅ Швейцария добавлена');
    } else {
      console.log('❌ Швейцария не найдена');
    }
  }
  
  // 2. Норвегия
  console.log('\n🇳🇴 Поиск Норвегии...');
  const existingNorway = checkIfCountryExists(['norway', 'норвегия']);
  if (existingNorway.length > 0) {
    console.log(`✅ Норвегия уже есть: ${existingNorway[0].properties.NAME}`);
  } else {
    const norwayFeatures = findCountryInOtherYears(['norway']);
    if (norwayFeatures && norwayFeatures.length > 0) {
      const norway = {
        type: 'Feature',
        properties: {
          NAME: 'Norway',
          ABBREVN: 'Norway',
          SUBJECTO: 'Norway',
          BORDERPRECISION: 3,
          PARTOF: 'Norway'
        },
        geometry: norwayFeatures[0].geometry
      };
      worldData.features.push(norway);
      addedCount++;
      console.log('✅ Норвегия добавлена');
    } else {
      console.log('❌ Норвегия не найдена');
    }
  }
  
  // 3. Дания (для Гренландии)
  console.log('\n🇩🇰 Поиск Дании и Гренландии...');
  const existingDenmark = checkIfCountryExists(['denmark', 'дания', 'greenland', 'гренландия']);
  if (existingDenmark.length > 0) {
    console.log(`✅ Дания/Гренландия уже есть: ${existingDenmark.map(f => f.properties.NAME).join(', ')}`);
  } else {
    const denmarkFeatures = findCountryInOtherYears(['denmark', 'greenland']);
    if (denmarkFeatures && denmarkFeatures.length > 0) {
      denmarkFeatures.forEach((feature, index) => {
        const denmark = {
          type: 'Feature',
          properties: {
            NAME: feature.properties.NAME || 'Denmark',
            ABBREVN: feature.properties.ABBREVN || 'Denmark',
            SUBJECTO: feature.properties.SUBJECTO || 'Denmark',
            BORDERPRECISION: 3,
            PARTOF: feature.properties.PARTOF || 'Denmark'
          },
          geometry: feature.geometry
        };
        worldData.features.push(denmark);
        addedCount++;
        console.log(`✅ ${feature.properties.NAME || 'Denmark'} добавлена`);
      });
    } else {
      console.log('❌ Дания/Гренландия не найдена');
    }
  }
  
  // 4. Россия/РФ
  console.log('\n🇷🇺 Поиск России...');
  const existingRussia = checkIfCountryExists(['russia', 'russian federation', 'россия', 'рф']);
  if (existingRussia.length > 0) {
    console.log(`✅ Россия уже есть: ${existingRussia[0].properties.NAME}`);
  } else {
    const russiaFeatures = findCountryInOtherYears(['russia', 'russian federation']);
    if (russiaFeatures && russiaFeatures.length > 0) {
      const russia = {
        type: 'Feature',
        properties: {
          NAME: 'Russian Federation',
          ABBREVN: 'Russia',
          SUBJECTO: 'Russian Federation',
          BORDERPRECISION: 3,
          PARTOF: 'Russian Federation'
        },
        geometry: russiaFeatures[0].geometry
      };
      worldData.features.push(russia);
      addedCount++;
      console.log('✅ Россия добавлена');
    } else {
      console.log('❌ Россия не найдена');
    }
  }
  
  // Сохраняем обновленные данные
  if (addedCount > 0) {
    fs.writeFileSync('public/data/historical/world_2000.geojson', JSON.stringify(worldData, null, 2));
    console.log(`\n✅ Добавлено стран: ${addedCount}`);
    console.log(`📊 Общее количество территорий: ${worldData.features.length}`);
  } else {
    console.log('\n📝 Все запрошенные страны уже присутствуют в данных 2000 года');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
  console.log(error.stack);
}

console.log('\n🎯 Обработка завершена!');