const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Исторически точные и различимые цвета для карты 1914 года
const historicalColors1914 = {
  'Российская империя': '#4A90E2',      // Синий (имперский)
  'Германская империя': '#2C3E50',      // Темно-серый (прусский)
  'Австро-Венгрия': '#DC143C',          // Темно-красный (габсбургский)
  'Франция': '#0055A4',                 // Французский синий
  'Великобритания': '#C8102E',          // Британский красный
  'Османская империя': '#E30A17',       // Османский красный
  'Италия': '#009246',                  // Итальянский зеленый
  'Испания': '#AA151B',                 // Испанский красный
  'Португалия': '#006600',              // Португальский зеленый
  'Сербия': '#C6363C',                  // Сербский красный
  'Греция': '#0D5EAF',                  // Греческий синий
  'Болгария': '#00966E',                // Болгарский зеленый
  'Румыния': '#FCD116',                 // Румынский желтый
  'Бельгия': '#000000',                 // Бельгийский черный
  'Нидерланды': '#FF9B00',              // Голландский оранжевый
  'Швейцария': '#FF0000',               // Швейцарский красный
  'Швеция': '#006AA7',                  // Шведский синий
  'Норвегия': '#EF2B2D',                // Норвежский красный
  'Дания': '#C60C30',                   // Датский красный
  'Люксембург': '#00A1DE',              // Люксембургский голубой
  'Монако': '#CE1126',                  // Монакский красный
  'Сан-Марино': '#5EB3F5',              // Сан-маринский голубой
  'Андорра': '#10069F',                 // Андоррский синий
  'Лихтенштейн': '#002B7F'              // Лихтенштейнский синий
};

async function recolorMap1914() {
  try {
    console.log('🎨 Перекрашиваем карту 1914 года в исторические цвета...');
    
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
    
    // Получаем все страны 1914 года
    const { data: countries } = await supabase
      .from('countries')
      .select('id, name, color')
      .eq('period_id', period.id);
    
    console.log(`📊 Найдено ${countries.length} стран для перекраски\n`);
    
    let updatedCount = 0;
    
    for (const country of countries) {
      const newColor = historicalColors1914[country.name];
      
      if (newColor && newColor !== country.color) {
        console.log(`🎨 ${country.name}: ${country.color} → ${newColor}`);
        
        const { error } = await supabase
          .from('countries')
          .update({ color: newColor })
          .eq('id', country.id);
        
        if (error) {
          console.error(`❌ Ошибка обновления ${country.name}:`, error.message);
        } else {
          updatedCount++;
        }
      } else if (newColor) {
        console.log(`✓ ${country.name}: цвет уже правильный (${country.color})`);
      } else {
        console.log(`⚠️  ${country.name}: исторический цвет не определен, оставляем ${country.color}`);
      }
    }
    
    console.log(`\n🎉 Перекраска завершена!`);
    console.log(`✅ Обновлено: ${updatedCount} стран`);
    console.log(`📊 Всего стран: ${countries.length}`);
    
    // Проверяем результат
    const { data: verification } = await supabase
      .from('countries')
      .select('name, color')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n🔍 Итоговые цвета:`);
    verification.forEach(country => {
      console.log(`   ${country.name}: ${country.color}`);
    });
    
    console.log(`\n🗺️  Карта 1914 года теперь имеет исторически точные цвета!`);
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

recolorMap1914();