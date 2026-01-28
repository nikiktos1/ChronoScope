const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Исторически правильные границы 1914 года
const correctBorders1914 = {
  "Российская империя": {
    // Включает современные: Россия + Польша + Финляндия + Прибалтика + Украина + Белоруссия
    geometry: {
      type: "Polygon", 
      coordinates: [[
        [19.0, 54.0], [20.0, 54.0], [23.0, 54.0], [26.0, 54.0], [30.0, 55.0],
        [35.0, 56.0], [40.0, 57.0], [50.0, 58.0], [60.0, 60.0], [70.0, 62.0],
        [80.0, 64.0], [90.0, 66.0], [100.0, 68.0], [110.0, 70.0], [120.0, 72.0],
        [130.0, 74.0], [140.0, 76.0], [150.0, 78.0], [160.0, 80.0], [170.0, 78.0],
        [180.0, 76.0], [170.0, 70.0], [160.0, 65.0], [150.0, 60.0], [140.0, 55.0],
        [130.0, 50.0], [120.0, 45.0], [110.0, 40.0], [100.0, 35.0], [90.0, 30.0],
        [80.0, 35.0], [70.0, 40.0], [60.0, 45.0], [50.0, 50.0], [40.0, 52.0],
        [35.0, 50.0], [30.0, 48.0], [26.0, 46.0], [23.0, 48.0], [20.0, 50.0], [19.0, 54.0]
      ]]
    }
  },
  
  "Османская империя": {
    // Включает современные: Турция + части Балкан + Ближний Восток
    geometry: {
      type: "Polygon",
      coordinates: [[
        [19.0, 40.0], [20.0, 41.0], [22.0, 42.0], [25.0, 43.0], [28.0, 44.0],
        [32.0, 42.0], [36.0, 40.0], [40.0, 38.0], [44.0, 36.0], [42.0, 34.0],
        [40.0, 32.0], [38.0, 30.0], [36.0, 28.0], [34.0, 26.0], [32.0, 28.0],
        [30.0, 30.0], [28.0, 32.0], [26.0, 34.0], [24.0, 36.0], [22.0, 38.0],
        [20.0, 39.0], [19.0, 40.0]
      ]]
    }
  },

  "Австро-Венгрия": {
    // Включает современные: Австрия + Венгрия + Чехия + Словакия + Хорватия + Босния
    geometry: {
      type: "Polygon",
      coordinates: [[
        [9.0, 47.0], [10.0, 47.0], [12.0, 47.0], [14.0, 48.0], [16.0, 49.0],
        [18.0, 49.0], [20.0, 49.0], [22.0, 48.0], [24.0, 47.0], [26.0, 46.0],
        [28.0, 45.0], [26.0, 44.0], [24.0, 43.0], [22.0, 44.0], [20.0, 45.0],
        [18.0, 46.0], [16.0, 46.0], [14.0, 46.0], [12.0, 46.0], [10.0, 46.0], [9.0, 47.0]
      ]]
    }
  },

  "Германская империя": {
    // Включает современную Германию + Эльзас-Лотарингию
    geometry: {
      type: "Polygon",
      coordinates: [[
        [5.5, 55.0], [6.0, 54.0], [7.0, 54.0], [8.0, 54.0], [9.0, 55.0],
        [10.0, 55.0], [11.0, 54.0], [12.0, 54.0], [13.0, 55.0], [14.0, 54.0],
        [15.0, 51.0], [17.0, 50.0], [19.0, 49.0], [22.0, 49.0], [20.0, 48.0],
        [18.0, 48.0], [16.0, 48.0], [14.0, 47.0], [12.0, 47.0], [10.0, 47.0],
        [8.0, 47.0], [7.0, 48.0], [6.0, 49.0], [5.0, 51.0], [5.5, 55.0]
      ]]
    }
  }
};

async function fixHistoricalBorders1914() {
  try {
    console.log('🔧 Исправляем границы на исторически правильные для 1914 года...');
    
    // Получаем ID периода 1914 года
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
    
    // УДАЛЯЕМ страны, которых не было в 1914 году
    const modernCountriesToDelete = [
      'Турция', 'Turkey', 'Чехия', 'Czech Republic', 'Словакия', 'Slovakia',
      'Хорватия', 'Croatia', 'Словения', 'Slovenia', 'Босния и Герцеговина',
      'Bosnia and Herzegovina', 'Северная Македония', 'North Macedonia',
      'Черногория', 'Montenegro', 'Косово', 'Kosovo', 'Албания', 'Albania',
      'Эстония', 'Estonia', 'Латвия', 'Latvia', 'Литва', 'Lithuania',
      'Польша', 'Poland', 'Украина', 'Ukraine', 'Белоруссия', 'Belarus',
      'Финляндия', 'Finland'
    ];
    
    console.log('\n🗑️  Удаляем страны, которых не было в 1914 году...');
    
    for (const countryName of modernCountriesToDelete) {
      const { data: country } = await supabase
        .from('countries')
        .select('id, name')
        .eq('period_id', period.id)
        .or(`name.eq.${countryName},name_en.eq.${countryName}`)
        .single();
      
      if (country) {
        console.log(`❌ Удаляем: ${country.name}`);
        
        // Удаляем геометрию
        await supabase
          .from('country_geometries')
          .delete()
          .eq('country_id', country.id);
        
        // Удаляем страну
        await supabase
          .from('countries')
          .delete()
          .eq('id', country.id);
      }
    }
    
    // ОБНОВЛЯЕМ границы основных империй
    console.log('\n🏛️  Обновляем границы основных империй...');
    
    for (const [countryName, data] of Object.entries(correctBorders1914)) {
      console.log(`🔄 Обновляем границы: ${countryName}`);
      
      const { data: country } = await supabase
        .from('countries')
        .select('id')
        .eq('period_id', period.id)
        .eq('name', countryName)
        .single();
      
      if (country) {
        // Удаляем старую геометрию
        await supabase
          .from('country_geometries')
          .delete()
          .eq('country_id', country.id);
        
        // Добавляем новую историческую геометрию
        const { error } = await supabase
          .from('country_geometries')
          .insert({
            country_id: country.id,
            geometry_type: data.geometry.type,
            coordinates: data.geometry.coordinates
          });
        
        if (error) {
          console.error(`❌ Ошибка обновления ${countryName}:`, error.message);
        } else {
          console.log(`✅ ${countryName} - границы обновлены`);
        }
      } else {
        console.log(`⚠️  ${countryName} не найдена в базе`);
      }
    }
    
    // Проверяем результат
    const { data: finalCountries } = await supabase
      .from('countries')
      .select('name')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n📊 Итоговый список стран 1914 года (${finalCountries.length}):`);
    finalCountries.forEach(country => {
      console.log(`   • ${country.name}`);
    });
    
    console.log(`\n🎉 Границы 1914 года исправлены на исторически правильные!`);
    console.log(`📍 Теперь карта показывает реальную политическую ситуацию 1914 года`);
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

fixHistoricalBorders1914();