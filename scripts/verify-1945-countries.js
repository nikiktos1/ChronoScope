import fs from 'fs';

console.log('🔍 Проверка наличия всех требуемых стран в карте 1945 года...\n');

try {
  // Загружаем карту 1945
  const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1945.json', 'utf8'));
  
  // Список требуемых стран
  const requiredCountries = ['СССР', 'Норвегия', 'Дания', 'Греция'];
  
  console.log('Поиск требуемых стран:');
  
  requiredCountries.forEach(country => {
    const found = europeData.features.find(f => 
      f.properties.name === country || 
      f.properties.originalName === country
    );
    
    if (found) {
      console.log(`✅ ${country} - найдена`);
      console.log(`   Правитель: ${found.properties.ruler || 'Не указан'}`);
      console.log(`   Столица: ${found.properties.capital || 'Не указана'}`);
      console.log(`   Описание: ${found.properties.description || 'Не указано'}`);
      console.log('');
    } else {
      console.log(`❌ ${country} - НЕ НАЙДЕНА`);
    }
  });
  
  console.log(`📊 Общее количество стран в карте: ${europeData.features.length}`);
  
  // Проверяем, что у всех стран есть базовая информация
  const countriesWithoutInfo = europeData.features.filter(f => 
    !f.properties.ruler || !f.properties.capital
  );
  
  if (countriesWithoutInfo.length > 0) {
    console.log(`\n⚠️ Страны без полной информации (${countriesWithoutInfo.length}):`);
    countriesWithoutInfo.forEach(f => {
      console.log(`- ${f.properties.name}`);
    });
  } else {
    console.log('\n✅ Все страны имеют полную информацию!');
  }
  
} catch (error) {
  console.log('❌ Ошибка:', error.message);
}

console.log('\n🎯 Проверка завершена!');