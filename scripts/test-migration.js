const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Настройка Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Необходимо установить переменные окружения');
  process.exit(1);
}

console.log('Используем ключ:', supabaseServiceKey ? 'Найден' : 'Не найден');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Тестовая миграция файла europe1914.json
async function testMigration() {
  console.log('Тестируем миграцию файла europe1914.json...');
  
  try {
    // Создаем период 1914
    const { data: period, error: periodError } = await supabase
      .from('historical_periods')
      .upsert({ 
        year: 1914,
        name: '1914 н.э.',
        description: 'Европа накануне Первой мировой войны'
      }, { 
        onConflict: 'year',
        ignoreDuplicates: false 
      })
      .select()
      .single();
      
    if (periodError) {
      console.error('Ошибка создания периода:', periodError);
      return;
    }
    
    console.log('Период создан:', period);

    // Читаем файл europe1914.json
    const filePath = path.join(__dirname, '../data/europe1914.json');
    const geoJsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Найдено ${geoJsonData.features.length} стран`);
    
    // Обрабатываем первые 3 страны для теста
    const testFeatures = geoJsonData.features.slice(0, 3);
    
    for (const feature of testFeatures) {
      const properties = feature.properties || {};
      
      // Создаем страну
      const { data: country, error: countryError } = await supabase
        .from('countries')
        .insert({
          period_id: period.id,
          name: properties.name || 'Неизвестная территория',
          ruler: properties.ruler,
          capital: properties.capital,
          government: properties.government,
          color: properties.color
        })
        .select()
        .single();
        
      if (countryError) {
        console.error('Ошибка создания страны:', countryError);
        continue;
      }
      
      console.log('Страна создана:', country.name);

      // Создаем геометрию
      if (feature.geometry) {
        const { data: geometry, error: geometryError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: country.id,
            geometry_type: feature.geometry.type,
            coordinates: feature.geometry.coordinates
          })
          .select()
          .single();
          
        if (geometryError) {
          console.error('Ошибка создания геометрии:', geometryError);
        } else {
          console.log('Геометрия создана для:', country.name);
        }
      }
    }
    
    console.log('Тестовая миграция завершена успешно!');
    
  } catch (error) {
    console.error('Ошибка тестовой миграции:', error);
  }
}

testMigration();