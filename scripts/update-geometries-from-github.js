const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateGeometriesFromGitHub() {
  try {
    console.log('🔄 Обновляем геометрии стран данными из GitHub...');
    
    // Читаем загруженные данные
    const githubData = JSON.parse(fs.readFileSync('data/github-historical-raw.json', 'utf8'));
    
    console.log(`📊 Загружено ${githubData.features.length} объектов из GitHub`);
    
    // Маппинг названий
    const countryMapping = {
      'Austria': 'Австро-Венгрия',
      'Hungary': 'Австро-Венгрия', 
      'Belgium': 'Бельгия',
      'Bulgaria': 'Болгария',
      'Switzerland': 'Швейцария',
      'Germany': 'Германская империя',
      'Denmark': 'Дания',
      'Spain': 'Испания',
      'France': 'Франция',
      'United Kingdom': 'Великобритания',
      'Greece': 'Греция',
      'Italy': 'Италия',
      'Netherlands': 'Нидерланды',
      'Norway': 'Норвегия',
      'Portugal': 'Португалия',
      'Romania': 'Румыния',
      'Russia': 'Российская империя',
      'Sweden': 'Швеция',
      'Turkey': 'Османская империя',
      'Serbia': 'Сербия'
    };
    
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
    
    // Получаем все страны 1914 года
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name')
      .eq('period_id', period.id);
    
    console.log(`📍 Найдено ${countries.length} стран в базе для обновления`);
    
    let updatedCount = 0;
    
    // Обновляем геометрии
    for (const feature of githubData.features) {
      const props = feature.properties;
      const originalName = props.NAME || props.name || props.ADMIN;
      const historicalName = countryMapping[originalName];
      
      if (!historicalName) continue;
      
      // Находим страну в базе
      const country = countries.find(c => c.name === historicalName);
      
      if (country) {
        console.log(`🔄 Обновляем геометрию: ${historicalName} (${originalName})`);
        
        try {
          // Удаляем старую геометрию
          await supabase
            .from('country_geometries')
            .delete()
            .eq('country_id', country.id);
          
          // Добавляем новую геометрию из GitHub
          const { error } = await supabase
            .from('country_geometries')
            .insert({
              country_id: country.id,
              geometry_type: feature.geometry.type,
              coordinates: feature.geometry.coordinates
            });
          
          if (error) {
            console.error(`❌ Ошибка обновления ${historicalName}:`, error.message);
          } else {
            // Обновляем точность границ
            await supabase
              .from('countries')
              .update({ border_precision: 5 })
              .eq('id', country.id);
            
            console.log(`✅ ${historicalName} - геометрия обновлена`);
            updatedCount++;
          }
          
        } catch (error) {
          console.error(`❌ Ошибка для ${historicalName}:`, error.message);
        }
      } else {
        console.log(`⚠️  ${historicalName} не найдена в базе`);
      }
    }
    
    console.log(`\n🎉 Обновление завершено!`);
    console.log(`✅ Обновлено геометрий: ${updatedCount}`);
    console.log(`📊 Всего стран: ${countries.length}`);
    console.log(`🎯 Новая точность границ: 5 (максимальная)`);
    console.log(`📍 Источник: GitHub Natural Earth Data`);
    
    // Проверяем результат
    const { data: verification } = await supabase
      .from('countries')
      .select('name, border_precision')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n🔍 Итоговая статистика:`);
    const highPrecision = verification.filter(c => c.border_precision === 5).length;
    console.log(`   📊 Стран с высокой точностью (5): ${highPrecision}`);
    console.log(`   📊 Всего стран: ${verification.length}`);
    
    console.log(`\n🗺️  Карта 1914 года теперь использует качественные границы из GitHub!`);
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

updateGeometriesFromGitHub();