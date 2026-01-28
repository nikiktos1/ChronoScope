import fs from 'fs';

console.log('🔍 Проверка перекрытий СССР с другими странами в карте 1945...\n');

try {
  // Загружаем карту 1945
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  console.log(`Всего территорий в карте: ${europeData.features.length}`);
  
  // Находим СССР
  const ussrFeature = europeData.features.find(f => f.properties.name === 'СССР');
  
  if (!ussrFeature) {
    console.log('❌ СССР не найден в карте');
    process.exit(1);
  }
  
  console.log(`✅ СССР найден с ${ussrFeature.geometry.coordinates.length} полигонами`);
  
  // Список стран, которые должны быть независимыми
  const independentCountries = [
    'Норвегия', 'Дания', 'Швеция', 'Финляндия',
    'Великобритания', 'Франция', 'Испания', 'Португалия',
    'Швейцария', 'Италия', 'Турция', 'Греция'
  ];
  
  console.log('\nПроверка независимых стран:');
  
  independentCountries.forEach(countryName => {
    const country = europeData.features.find(f => f.properties.name === countryName);
    if (country) {
      console.log(`✅ ${countryName} - найдена как независимая`);
    } else {
      console.log(`⚠️ ${countryName} - не найдена`);
    }
  });
  
  // Проверяем зоны оккупации
  console.log('\nЗоны оккупации СССР:');
  const occupationZones = europeData.features.filter(f => 
    f.properties.name.includes('советская зона') ||
    f.properties.description?.includes('оккупации')
  );
  
  occupationZones.forEach(zone => {
    console.log(`📍 ${zone.properties.name} - ${zone.properties.description}`);
  });
  
  // Показываем все территории СССР и связанные с ним
  console.log('\nВсе территории, связанные с СССР:');
  const ussrRelated = europeData.features.filter(f => 
    f.properties.name.includes('СССР') ||
    f.properties.name.includes('советская') ||
    f.properties.ruler?.includes('Сталин') ||
    f.properties.government?.includes('Советская')
  );
  
  ussrRelated.forEach(territory => {
    console.log(`🇷🇺 ${territory.properties.name} - ${territory.properties.government || 'Не указано'}`);
  });
  
  console.log(`\nИтого территорий, связанных с СССР: ${ussrRelated.length}`);
  
  // Проверяем, что нейтральные страны не имеют советского правления
  console.log('\nПроверка нейтральных стран на советское влияние:');
  const neutralCountries = ['Швеция', 'Швейцария', 'Испания', 'Португалия', 'Турция'];
  
  neutralCountries.forEach(countryName => {
    const country = europeData.features.find(f => f.properties.name === countryName);
    if (country) {
      const hasSovietInfluence = 
        country.properties.ruler?.includes('Сталин') ||
        country.properties.government?.includes('Советская') ||
        country.properties.description?.includes('СССР');
      
      if (hasSovietInfluence) {
        console.log(`❌ ${countryName} - имеет советское влияние!`);
      } else {
        console.log(`✅ ${countryName} - независима`);
      }
    }
  });
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Проверка завершена!');