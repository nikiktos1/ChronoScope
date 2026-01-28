const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Точные границы Испании 1914 года
const spainBorders1914 = {
  type: "Polygon",
  coordinates: [[
    [-9.034818, 41.880571], [-8.984901, 42.592775], [-9.392883, 43.026418],
    [-7.978637, 43.748337], [-6.754417, 43.567909], [-5.411886, 43.574825],
    [-4.347842, 43.403449], [-3.517133, 43.455901], [-1.901351, 43.422802],
    [-1.502770, 43.034014], [0.338046, 42.579546], [0.701591, 42.795734],
    [1.826793, 42.343384], [2.985999, 42.473015], [3.039484, 41.892120],
    [2.091463, 41.226088], [0.810700, 41.014732], [0.721775, 40.678318],
    [1.158056, 40.435257], [2.157895, 40.090725], [3.146473, 39.848380],
    [3.516360, 39.280362], [1.896007, 38.507741], [1.664129, 37.908849],
    [1.255970, 37.071755], [0.467706, 36.677452], [-0.683389, 35.814729],
    [-1.438382, 35.297532], [-2.146453, 35.985154], [-3.416902, 36.659606],
    [-4.368900, 36.677452], [-4.995219, 36.324708], [-5.377358, 35.946850],
    [-5.866432, 36.029817], [-6.236319, 36.367749], [-6.520116, 36.942674],
    [-7.453726, 37.097788], [-7.537118, 37.428904], [-7.166761, 37.803959],
    [-7.029281, 38.075764], [-7.374092, 38.373018], [-7.098827, 38.552362],
    [-7.498407, 39.629571], [-7.066598, 39.711892], [-7.026281, 40.184524],
    [-6.864519, 40.330871], [-6.851431, 40.978293], [-6.961242, 41.533254],
    [-6.993998, 41.614592], [-7.537118, 41.917922], [-8.017738, 41.790886],
    [-8.263857, 42.280469], [-8.671915, 42.134689], [-9.034818, 41.880571]
  ]]
};

async function fixSpain1914() {
  try {
    console.log('🇪🇸 Обновляем границы Испании 1914 года...');
    
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
    
    // Находим Испанию
    const { data: spain } = await supabase
      .from('countries')
      .select('id')
      .eq('period_id', period.id)
      .eq('name', 'Испания')
      .single();
    
    if (!spain) {
      console.error('❌ Испания не найдена');
      return;
    }
    
    console.log(`✅ Испания найдена, ID: ${spain.id}`);
    
    // Обновляем информацию о стране
    const { error: updateError } = await supabase
      .from('countries')
      .update({
        name_en: 'Spain',
        ruler: 'Альфонсо XIII',
        capital: 'Мадрид',
        government: 'Конституционная монархия',
        color: '#C60B1E', // Красный цвет испанского флага
        border_precision: 5,
        subjecto: 'Королевство Испания в 1914 году'
      })
      .eq('id', spain.id);
    
    if (updateError) {
      console.error('❌ Ошибка обновления страны:', updateError);
      return;
    }
    
    console.log('✅ Информация о стране обновлена');
    
    // Удаляем старую геометрию
    await supabase
      .from('country_geometries')
      .delete()
      .eq('country_id', spain.id);
    
    // Добавляем новую точную геометрию
    const { error: geoError } = await supabase
      .from('country_geometries')
      .insert({
        country_id: spain.id,
        geometry_type: spainBorders1914.type,
        coordinates: spainBorders1914.coordinates
      });
    
    if (geoError) {
      console.error('❌ Ошибка обновления геометрии:', geoError);
      return;
    }
    
    console.log('✅ Границы Испании обновлены с высокой точностью');
    
    // Проверяем результат
    const { data: verification } = await supabase
      .from('countries')
      .select('name, ruler, capital, border_precision')
      .eq('id', spain.id)
      .single();
    
    console.log('\n🔍 Проверка:');
    console.log(`   Название: ${verification.name}`);
    console.log(`   Правитель: ${verification.ruler}`);
    console.log(`   Столица: ${verification.capital}`);
    console.log(`   Точность границ: ${verification.border_precision}`);
    
    console.log('\n🎉 Испания 1914 года готова!');
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

fixSpain1914();