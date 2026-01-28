const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Более точные границы для карты 1914 года
const improvedCountries1914 = [
  {
    name: "Российская империя",
    name_en: "Russian Empire",
    ruler: "Николай II",
    capital: "Санкт-Петербург",
    government: "Абсолютная монархия",
    color: "#5B8DBE",
    border_precision: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [20.5, 69.8], [31.0, 70.0], [40.0, 69.5], [50.0, 68.0], [60.0, 67.0], 
        [70.0, 66.0], [80.0, 65.0], [90.0, 64.0], [100.0, 63.0], [110.0, 62.0],
        [120.0, 61.0], [130.0, 60.0], [140.0, 59.0], [150.0, 58.0], [160.0, 57.0],
        [170.0, 56.0], [180.0, 55.0], [170.0, 50.0], [160.0, 45.0], [150.0, 40.0],
        [140.0, 35.0], [130.0, 30.0], [120.0, 35.0], [110.0, 40.0], [100.0, 45.0],
        [90.0, 50.0], [80.0, 52.0], [70.0, 54.0], [60.0, 56.0], [50.0, 58.0],
        [40.0, 60.0], [30.0, 62.0], [20.0, 64.0], [19.8, 66.0], [20.5, 69.8]
      ]]
    }
  },
  {
    name: "Германская империя", 
    name_en: "German Empire",
    ruler: "Вильгельм II",
    capital: "Берлин",
    government: "Конституционная монархия",
    color: "#2C3E50",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [5.9, 55.3], [6.2, 53.8], [7.1, 53.6], [8.5, 54.2], [9.6, 54.8], 
        [10.7, 54.0], [11.3, 54.2], [12.2, 54.1], [13.4, 54.9], [14.1, 53.9], 
        [14.7, 52.9], [15.0, 51.1], [16.9, 50.7], [17.9, 50.3], [18.6, 49.9],
        [19.9, 49.2], [20.4, 49.0], [22.8, 49.0], [22.8, 49.5], [20.8, 49.0], 
        [18.9, 49.2], [17.1, 48.8], [16.0, 48.7], [13.8, 48.8], [12.2, 47.7], 
        [10.2, 47.5], [8.2, 47.7], [7.6, 47.6], [7.5, 48.0], [8.2, 49.0], 
        [6.2, 49.5], [6.1, 50.8], [5.9, 51.0], [6.0, 53.2], [5.9, 55.3]
      ]]
    }
  },
  {
    name: "Австро-Венгрия",
    name_en: "Austria-Hungary", 
    ruler: "Франц Иосиф I",
    capital: "Вена",
    government: "Дуалистическая монархия",
    color: "#E74C3C",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [9.5, 47.5], [10.5, 46.9], [12.4, 46.7], [13.7, 46.5], [16.6, 46.5],
        [16.9, 48.6], [17.9, 48.2], [18.9, 47.9], [22.1, 48.4], [26.6, 48.3],
        [28.2, 45.4], [26.6, 44.6], [22.7, 44.2], [21.6, 45.2], [20.3, 46.0],
        [18.8, 45.9], [16.6, 46.5], [13.7, 46.5], [12.4, 46.7], [10.5, 46.9], [9.5, 47.5]
      ]]
    }
  },
  {
    name: "Франция",
    name_en: "France",
    ruler: "Раймон Пуанкаре", 
    capital: "Париж",
    government: "Республика",
    color: "#3498DB",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-4.8, 48.4], [-1.7, 49.7], [1.4, 51.1], [2.5, 51.1], [4.3, 49.9],
        [6.2, 49.5], [8.2, 49.0], [7.5, 48.0], [7.6, 47.6], [7.0, 47.5],
        [6.8, 45.9], [6.2, 45.1], [7.0, 43.6], [3.1, 42.4], [1.7, 42.7],
        [-1.8, 43.4], [-1.5, 43.5], [-1.0, 44.4], [-1.1, 46.0], [-2.0, 47.0],
        [-4.5, 48.4], [-4.8, 48.4]
      ]]
    }
  },
  {
    name: "Великобритания",
    name_en: "United Kingdom",
    ruler: "Георг V",
    capital: "Лондон", 
    government: "Конституционная монархия",
    color: "#E67E22",
    border_precision: 4,
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [-5.7, 54.1], [-6.2, 55.4], [-5.0, 58.6], [-3.0, 58.6], [-4.2, 57.6],
          [-1.5, 57.7], [-2.0, 55.9], [0.0, 53.0], [1.8, 52.5], [1.7, 51.5],
          [0.7, 51.5], [-5.2, 50.0], [-5.7, 54.1]
        ]],
        [[
          [-10.5, 51.4], [-10.0, 52.0], [-9.5, 53.4], [-8.0, 54.4], [-7.5, 55.4],
          [-6.0, 55.2], [-5.7, 54.1], [-6.5, 52.0], [-10.5, 51.4]
        ]]
      ]
    }
  },
  {
    name: "Османская империя",
    name_en: "Ottoman Empire",
    ruler: "Мехмед V",
    capital: "Константинополь",
    government: "Абсолютная монархия", 
    color: "#9B59B6",
    border_precision: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [26.0, 41.2], [28.0, 41.0], [29.0, 40.0], [26.5, 40.0], [26.0, 39.0],
        [27.5, 37.0], [29.0, 36.5], [28.0, 36.8], [26.3, 36.2], [23.7, 35.7],
        [22.5, 37.0], [21.0, 39.0], [20.0, 39.7], [19.5, 40.5], [20.0, 41.0],
        [22.0, 42.0], [23.0, 41.4], [26.0, 41.2]
      ]]
    }
  },
  {
    name: "Италия",
    name_en: "Italy",
    ruler: "Виктор Эммануил III",
    capital: "Рим",
    government: "Конституционная монархия",
    color: "#27AE60",
    border_precision: 4,
    geometry: {
      type: "Polygon", 
      coordinates: [[
        [12.4, 46.7], [13.7, 46.5], [13.7, 45.5], [15.0, 44.0], [16.6, 41.9],
        [17.2, 40.9], [16.9, 40.6], [15.5, 40.2], [15.2, 37.9], [15.1, 36.7],
        [12.4, 37.8], [12.5, 38.1], [11.0, 42.4], [10.2, 43.9], [8.5, 44.4],
        [7.7, 43.8], [7.0, 43.6], [6.8, 45.9], [7.0, 47.5], [9.5, 47.5],
        [10.5, 46.9], [12.4, 46.7]
      ]]
    }
  }
];

async function improve1914Borders() {
  try {
    console.log('Улучшаем границы карты 1914 года...');
    
    // Получаем ID периода 1914 года
    const { data: period } = await supabase
      .from('historical_periods')
      .select('id')
      .eq('year', 1914)
      .single();
    
    if (!period) {
      console.error('Период 1914 года не найден');
      return;
    }
    
    for (const country of improvedCountries1914) {
      console.log(`Обновляем ${country.name}...`);
      
      // Обновляем или создаем страну
      const { data: existingCountry } = await supabase
        .from('countries')
        .select('id')
        .eq('period_id', period.id)
        .eq('name', country.name)
        .single();
      
      let countryId;
      
      if (existingCountry) {
        // Обновляем существующую страну
        const { error: updateError } = await supabase
          .from('countries')
          .update({
            name_en: country.name_en,
            ruler: country.ruler,
            capital: country.capital,
            government: country.government,
            color: country.color,
            border_precision: country.border_precision
          })
          .eq('id', existingCountry.id);
        
        if (updateError) {
          console.error(`Ошибка обновления ${country.name}:`, updateError);
          continue;
        }
        
        countryId = existingCountry.id;
      } else {
        // Создаем новую страну
        const { data: newCountry, error: insertError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: country.name,
            name_en: country.name_en,
            ruler: country.ruler,
            capital: country.capital,
            government: country.government,
            color: country.color,
            border_precision: country.border_precision
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`Ошибка создания ${country.name}:`, insertError);
          continue;
        }
        
        countryId = newCountry.id;
      }
      
      // Удаляем старую геометрию
      await supabase
        .from('country_geometries')
        .delete()
        .eq('country_id', countryId);
      
      // Добавляем новую геометрию
      const { error: geometryError } = await supabase
        .from('country_geometries')
        .insert({
          country_id: countryId,
          geometry_type: country.geometry.type,
          coordinates: country.geometry.coordinates
        });
      
      if (geometryError) {
        console.error(`Ошибка добавления геометрии для ${country.name}:`, geometryError);
      } else {
        console.log(`✓ ${country.name} обновлена`);
      }
    }
    
    console.log('Границы карты 1914 года улучшены!');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

improve1914Borders();