const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingTerritories1914() {
  try {
    console.log('🔍 Ищем Финляндию, Албанию и Люксембург в исторических данных...');
    
    // Читаем загруженные исторические данные
    const historicalData = JSON.parse(fs.readFileSync('data/real-historical-1914.json', 'utf8'));
    
    console.log(`📊 Всего объектов в исторических данных: ${historicalData.features.length}`);
    
    // Ищем нужные территории
    const targetTerritories = ['Finland', 'Albania', 'Luxembourg', 'Luxemburg', 'Finnish', 'Albanian'];
    const foundTerritories = [];
    
    console.log('\n🔍 Поиск территорий в исторических данных:');
    
    for (const feature of historicalData.features) {
      const props = feature.properties;
      const name = props.NAME || props.name || props.ADMIN || props.Country || props.country || '';
      
      // Проверяем все возможные названия
      const isTarget = targetTerritories.some(target => 
        name.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(name.toLowerCase())
      );
      
      if (isTarget) {
        console.log(`✅ НАЙДЕНО: "${name}"`);
        console.log(`   Свойства:`, Object.keys(props));
        
        // Определяем русское название
        let russianName = name;
        if (name.toLowerCase().includes('finland') || name.toLowerCase().includes('finnish')) {
          russianName = 'Великое княжество Финляндское';
        } else if (name.toLowerCase().includes('albania') || name.toLowerCase().includes('albanian')) {
          russianName = 'Албания';
        } else if (name.toLowerCase().includes('luxemb')) {
          russianName = 'Люксембург';
        }
        
        foundTerritories.push({
          type: 'Feature',
          properties: {
            name: russianName,
            name_en: name,
            original_name: name,
            source: 'Historical Basemaps Project - Real 1914 Data'
          },
          geometry: feature.geometry
        });
      }
    }
    
    console.log(`\n📊 Найдено территорий: ${foundTerritories.length}`);
    
    if (foundTerritories.length === 0) {
      console.log('⚠️  Территории не найдены в исторических данных');
      console.log('🔍 Показываем все доступные названия для поиска:');
      
      // Показываем первые 20 названий для анализа
      historicalData.features.slice(0, 20).forEach((feature, index) => {
        const name = feature.properties.NAME || feature.properties.name || feature.properties.ADMIN || 'Неизвестно';
        console.log(`   ${index + 1}. ${name}`);
      });
      
      console.log('\n💡 Попробуем найти по частичным совпадениям...');
      
      // Расширенный поиск
      const extendedSearch = ['fin', 'alb', 'lux', 'grand', 'duchy', 'principality'];
      
      for (const searchTerm of extendedSearch) {
        console.log(`\n🔍 Поиск по "${searchTerm}":`);
        
        const matches = historicalData.features.filter(feature => {
          const name = (feature.properties.NAME || feature.properties.name || feature.properties.ADMIN || '').toLowerCase();
          return name.includes(searchTerm);
        });
        
        matches.slice(0, 5).forEach(feature => {
          const name = feature.properties.NAME || feature.properties.name || feature.properties.ADMIN;
          console.log(`   • ${name}`);
        });
      }
      
      return;
    }
    
    // Загружаем найденные территории в Supabase
    await uploadTerritoriesToSupabase(foundTerritories);
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

async function uploadTerritoriesToSupabase(territories) {
  try {
    console.log('\n🚀 Загружаем найденные территории в Supabase...');
    
    // Получаем период 1914 года
    const { data: period } = await supabase
      .from('historical_periods')
      .select('id')
      .eq('year', 1914)
      .single();
    
    if (!period) {
      console.error('❌ Период 1914 года не найден');
      return;
    }
    
    let successCount = 0;
    
    for (const territory of territories) {
      const props = territory.properties;
      
      console.log(`📍 Загружаем: ${props.name} (${props.name_en})`);
      
      // Определяем исторический статус и правителя
      let ruler = '';
      let government = '';
      let partOf = '';
      
      if (props.name === 'Великое княжество Финляндское') {
        ruler = 'Николай II (как Великий князь Финляндский)';
        government = 'Автономное великое княжество';
        partOf = 'Российская империя';
      } else if (props.name === 'Албания') {
        ruler = 'Вильгельм Вид (до 1914)';
        government = 'Княжество';
        partOf = '';
      } else if (props.name === 'Люксембург') {
        ruler = 'Мария-Аделаида';
        government = 'Великое герцогство';
        partOf = '';
      }
      
      try {
        // Создаем территорию
        const { data: newTerritory, error: territoryError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: props.name,
            name_en: props.name_en,
            ruler: ruler,
            government: government,
            part_of: partOf,
            border_precision: 10, // Максимальная точность для исторических данных
            color: generateTerritoryColor(props.name),
            subjecto: `Исторические границы 1914 года. Источник: Historical Basemaps Project`
          })
          .select('id')
          .single();
        
        if (territoryError) {
          console.error(`❌ Ошибка создания ${props.name}:`, territoryError.message);
          continue;
        }
        
        // Добавляем геометрию
        const { error: geoError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: newTerritory.id,
            geometry_type: territory.geometry.type,
            coordinates: territory.geometry.coordinates
          });
        
        if (geoError) {
          console.error(`❌ Ошибка геометрии ${props.name}:`, geoError.message);
        } else {
          console.log(`✅ ${props.name} - исторические границы загружены`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ Общая ошибка ${props.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Дополнительные территории 1914 года добавлены!`);
    console.log(`✅ Успешно загружено: ${successCount} территорий`);
    
    // Показываем итоговую статистику
    const { data: finalCount } = await supabase
      .from('countries')
      .select('count(*)', { count: 'exact' })
      .eq('period_id', period.id);
    
    console.log(`📊 Всего стран и территорий 1914 года: ${finalCount[0].count}`);
    
    // Показываем новые территории
    const { data: newTerritories } = await supabase
      .from('countries')
      .select('name, ruler, government, part_of')
      .eq('period_id', period.id)
      .in('name', territories.map(t => t.properties.name));
    
    if (newTerritories && newTerritories.length > 0) {
      console.log('\n🏛️  Добавленные территории:');
      newTerritories.forEach(territory => {
        console.log(`   • ${territory.name}`);
        console.log(`     Правитель: ${territory.ruler || 'Не указан'}`);
        console.log(`     Статус: ${territory.government || 'Не указан'}`);
        if (territory.part_of) {
          console.log(`     Часть: ${territory.part_of}`);
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Ошибка загрузки в Supabase:', error);
  }
}

function generateTerritoryColor(territoryName) {
  const territoryColors = {
    'Великое княжество Финляндское': '#0033A0', // Финский синий
    'Албания': '#E41E20', // Албанский красный
    'Люксембург': '#00A1DE' // Люксембургский голубой
  };
  
  return territoryColors[territoryName] || '#95A5A6';
}

// Запускаем поиск и добавление
addMissingTerritories1914();