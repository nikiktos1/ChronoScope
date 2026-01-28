const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Необходимо установить переменные окружения');
  process.exit(1);
}

console.log('Используем ключ:', supabaseServiceKey ? 'Найден' : 'Не найден');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigrationStatus() {
  console.log('🔍 Проверка статуса миграции...\n');
  
  try {
    // Проверяем количество периодов
    const { data: periods, error: periodsError } = await supabase
      .from('historical_periods')
      .select('*')
      .order('year');
      
    if (periodsError) {
      console.error('❌ Ошибка получения периодов:', periodsError);
      return;
    }
    
    console.log(`📅 Исторических периодов: ${periods?.length || 0}`);
    
    if (periods && periods.length > 0) {
      const minYear = periods[0].year;
      const maxYear = periods[periods.length - 1].year;
      console.log(`   Диапазон: ${minYear < 0 ? Math.abs(minYear) + ' до н.э.' : minYear + ' н.э.'} - ${maxYear < 0 ? Math.abs(maxYear) + ' до н.э.' : maxYear + ' н.э.'}`);
    }
    
    // Проверяем количество стран
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id');
      
    if (countriesError) {
      console.error('❌ Ошибка получения стран:', countriesError);
      return;
    }
    
    console.log(`🏛️  Всего стран/территорий: ${countries?.length || 0}`);
    
    // Проверяем количество геометрий
    const { data: geometries, error: geometriesError } = await supabase
      .from('country_geometries')
      .select('id');
      
    if (geometriesError) {
      console.error('❌ Ошибка получения геометрий:', geometriesError);
      return;
    }
    
    console.log(`🗺️  Геометрий границ: ${geometries?.length || 0}`);
    
    // Статистика по периодам
    const { data: periodStats, error: statsError } = await supabase
      .from('countries')
      .select(`
        period_id,
        historical_periods!inner(year, name)
      `);
      
    if (!statsError && periodStats) {
      console.log('\n📊 Статистика по периодам:');
      
      const stats = periodStats.reduce((acc, country) => {
        const period = country.historical_periods;
        const key = period.year;
        if (!acc[key]) {
          acc[key] = {
            year: period.year,
            name: period.name,
            count: 0
          };
        }
        acc[key].count++;
        return acc;
      }, {});
      
      Object.values(stats)
        .sort((a, b) => a.year - b.year)
        .slice(0, 10) // Показываем первые 10
        .forEach(stat => {
          console.log(`   ${stat.name}: ${stat.count} территорий`);
        });
        
      if (Object.keys(stats).length > 10) {
        console.log(`   ... и еще ${Object.keys(stats).length - 10} периодов`);
      }
    }
    
    console.log('\n✅ Проверка завершена!');
    
    if ((periods?.length || 0) === 0) {
      console.log('\n💡 Для начала миграции выполните:');
      console.log('   pnpm run test-migration    # Тестовая миграция');
      console.log('   pnpm run migrate-maps      # Полная миграция');
    }
    
  } catch (error) {
    console.error('❌ Ошибка проверки:', error);
  }
}

checkMigrationStatus();