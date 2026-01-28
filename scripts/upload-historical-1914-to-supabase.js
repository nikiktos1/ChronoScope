const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadHistorical1914ToSupabase() {
  try {
    console.log('🚀 РЕАЛЬНО загружаем исторические данные 1914 года в Supabase...');
    
    // Читаем подготовленные данные
    const historicalData = JSON.parse(fs.readFileSync('data/historical-1914.json', 'utf8'));
    
    console.log(`📊 Найдено ${historicalData.features.length} стран для загрузки`);
    
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
    
    console.log(`✅ Период 1914 найден, ID: ${period.id}`);
    
    // ПОЛНОСТЬЮ ОЧИЩАЕМ старые данные 1914 года
    console.log('🧹 Полностью очищаем старые данные 1914 года...');
    
    const { data: oldCountries } = await supabase
      .from('countries')
      .select('id')
      .eq('period_id', period.id);
    
    if (oldCountries && oldCountries.length > 0) {
      console.log(`🗑️  Удаляем ${oldCountries.length} старых стран...`);
      
      // Удаляем геометрии
      await supabase
        .from('country_geometries')
        .delete()
        .in('country_id', oldCountries.map(c => c.id));
      
      // Удаляем страны
      await supabase
        .from('countries')
        .delete()
        .eq('period_id', period.id);
      
      console.log('✅ Старые данные удалены');
    }
    
    // Загружаем новые исторические данные
    console.log('\n📥 Загружаем новые исторические данные...');
    
    let successCount = 0;
    
    for (const feature of historicalData.features) {
      const props = feature.properties;
      
      console.log(`\n🏛️  Загружаем: ${props.name}`);
      console.log(`   Правитель: ${props.ruler}`);
      console.log(`   Столица: ${props.capital}`);
      console.log(`   Включает: ${props.includes}`);
      
      try {
        // Создаем страну
        const { data: country, error: countryError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: props.name,
            name_en: props.name_en,
            ruler: props.ruler,
            capital: props.capital,
            government: props.government,
            color: props.color,
            border_precision: 5, // Максимальная точность
            subjecto: `${props.source}. ${props.includes}`,
            part_of: props.includes
          })
          .select('id')
          .single();
        
        if (countryError) {
          console.error(`❌ Ошибка создания страны: ${countryError.message}`);
          continue;
        }
        
        console.log(`✅ Страна создана, ID: ${country.id}`);
        
        // Добавляем геометрию
        const { error: geoError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: country.id,
            geometry_type: feature.geometry.type,
            coordinates: feature.geometry.coordinates
          });
        
        if (geoError) {
          console.error(`❌ Ошибка геометрии: ${geoError.message}`);
        } else {
          console.log(`✅ Геометрия добавлена`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ Общая ошибка для ${props.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 ЗАГРУЗКА ЗАВЕРШЕНА!`);
    console.log(`✅ Успешно загружено: ${successCount} стран`);
    
    // Проверяем что данные реально в базе
    const { data: verification } = await supabase
      .from('countries')
      .select('name, border_precision')
      .eq('period_id', period.id);
    
    console.log(`\n🔍 ПРОВЕРКА: В базе данных сейчас ${verification.length} стран для 1914 года:`);
    verification.forEach(country => {
      console.log(`   • ${country.name} (точность: ${country.border_precision})`);
    });
    
    console.log(`\n🌐 Карта 1914 года теперь доступна на сайте!`);
    
  } catch (error) {
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА:', error);
  }
}

uploadHistorical1914ToSupabase();