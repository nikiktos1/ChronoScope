const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Дополнительные страны для карты 1914 года
const additionalCountries1914 = [
  {
    name: "Испания",
    name_en: "Spain",
    ruler: "Альфонсо XIII",
    capital: "Мадрид",
    government: "Конституционная монархия",
    color: "#F39C12",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-9.5, 42.0], [-7.0, 42.0], [-1.5, 43.5], [1.7, 42.7], [3.1, 42.4],
        [3.3, 41.9], [0.3, 39.5], [-0.3, 38.9], [0.0, 37.5], [-2.0, 36.8],
        [-5.4, 36.0], [-6.0, 36.9], [-7.4, 37.2], [-7.0, 39.0], [-9.0, 41.9], [-9.5, 42.0]
      ]]
    }
  },
  {
    name: "Португалия",
    name_en: "Portugal",
    ruler: "Мануэл II",
    capital: "Лиссабон",
    government: "Конституционная монархия",
    color: "#16A085",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-9.5, 42.0], [-8.9, 41.9], [-6.2, 41.9], [-7.0, 42.0], [-9.0, 41.9],
        [-7.0, 39.0], [-7.4, 37.2], [-8.9, 37.0], [-8.9, 38.5], [-9.5, 38.7],
        [-9.0, 40.0], [-9.5, 42.0]
      ]]
    }
  },
  {
    name: "Сербия",
    name_en: "Serbia",
    ruler: "Пётр I Карагеоргиевич",
    capital: "Белград",
    government: "Конституционная монархия",
    color: "#C0392B",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [18.8, 45.9], [20.3, 46.0], [21.6, 45.2], [22.7, 44.2], [22.5, 42.9],
        [21.0, 42.0], [20.0, 42.0], [19.0, 42.5], [18.5, 43.0], [19.0, 44.0],
        [19.5, 45.0], [18.8, 45.9]
      ]]
    }
  },
  {
    name: "Греция",
    name_en: "Greece",
    ruler: "Константин I",
    capital: "Афины",
    government: "Конституционная монархия",
    color: "#3498DB",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [20.0, 41.0], [21.0, 40.6], [22.9, 41.0], [24.5, 41.4], [26.0, 41.2],
        [26.6, 40.9], [26.5, 40.0], [24.0, 40.8], [23.7, 39.0], [23.0, 38.0],
        [22.5, 37.5], [21.7, 38.0], [21.0, 39.0], [20.0, 39.7], [20.0, 41.0]
      ]]
    }
  },
  {
    name: "Болгария",
    name_en: "Bulgaria",
    ruler: "Фердинанд I",
    capital: "София",
    government: "Конституционная монархия",
    color: "#8E44AD",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [22.5, 42.9], [22.7, 44.2], [26.6, 44.6], [28.2, 45.4], [28.6, 43.7],
        [27.9, 42.0], [26.0, 41.2], [23.0, 41.4], [22.9, 41.0], [22.5, 42.0],
        [22.5, 42.9]
      ]]
    }
  },
  {
    name: "Румыния",
    name_en: "Romania",
    ruler: "Кароль I",
    capital: "Бухарест",
    government: "Конституционная монархия",
    color: "#F1C40F",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [20.3, 46.0], [21.6, 45.2], [22.7, 44.2], [26.6, 44.6], [28.2, 45.4],
        [29.7, 45.4], [29.6, 47.0], [28.2, 48.2], [26.6, 48.3], [22.1, 48.4],
        [20.3, 46.0]
      ]]
    }
  },
  {
    name: "Бельгия",
    name_en: "Belgium",
    ruler: "Альберт I",
    capital: "Брюссель",
    government: "Конституционная монархия",
    color: "#E74C3C",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [2.5, 51.1], [3.3, 51.4], [4.3, 51.4], [5.9, 51.0], [6.0, 50.8],
        [6.2, 49.5], [5.8, 49.5], [4.3, 49.9], [2.5, 51.1]
      ]]
    }
  },
  {
    name: "Нидерланды",
    name_en: "Netherlands",
    ruler: "Вильгельмина",
    capital: "Амстердам",
    government: "Конституционная монархия",
    color: "#E67E22",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [3.3, 51.4], [4.3, 51.4], [5.9, 51.0], [5.9, 53.2], [6.0, 53.2],
        [7.2, 53.5], [7.2, 53.3], [6.8, 52.5], [5.3, 52.4], [4.8, 53.4],
        [3.3, 51.4]
      ]]
    }
  },
  {
    name: "Швейцария",
    name_en: "Switzerland",
    ruler: "Федеральный совет",
    capital: "Берн",
    government: "Федеративная республика",
    color: "#E74C3C",
    border_precision: 4,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [6.0, 46.2], [7.0, 47.5], [8.2, 47.7], [9.5, 47.5], [10.5, 46.9],
        [10.0, 46.0], [8.8, 46.0], [7.0, 45.9], [6.0, 46.2]
      ]]
    }
  },
  {
    name: "Швеция",
    name_en: "Sweden",
    ruler: "Густав V",
    capital: "Стокгольм",
    government: "Конституционная монархия",
    color: "#3498DB",
    border_precision: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [11.0, 59.0], [12.0, 60.0], [13.0, 64.0], [14.0, 66.0], [16.0, 68.0],
        [20.0, 69.0], [24.0, 68.0], [24.0, 65.5], [23.0, 66.0], [22.0, 65.7],
        [21.0, 63.0], [17.0, 61.0], [18.0, 60.0], [17.0, 58.0], [16.0, 56.0],
        [14.0, 56.0], [12.0, 56.0], [11.0, 57.0], [11.0, 59.0]
      ]]
    }
  },
  {
    name: "Норвегия",
    name_en: "Norway",
    ruler: "Хокон VII",
    capital: "Кристиания (Осло)",
    government: "Конституционная монархия",
    color: "#E74C3C",
    border_precision: 3,
    geometry: {
      type: "Polygon",
      coordinates: [[
        [5.0, 58.0], [5.0, 62.0], [8.0, 63.0], [11.0, 64.0], [13.0, 64.0],
        [14.0, 66.0], [16.0, 68.0], [20.0, 69.0], [25.0, 70.0], [28.0, 70.0],
        [31.0, 69.5], [30.0, 68.0], [28.0, 69.0], [25.0, 68.0], [20.0, 69.0],
        [16.0, 68.0], [14.0, 66.0], [13.0, 64.0], [11.0, 59.0], [10.0, 59.0],
        [8.0, 58.0], [5.0, 58.0]
      ]]
    }
  },
  {
    name: "Дания",
    name_en: "Denmark",
    ruler: "Кристиан X",
    capital: "Копенгаген",
    government: "Конституционная монархия",
    color: "#E74C3C",
    border_precision: 4,
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[[8.0, 54.8], [8.8, 54.9], [9.9, 54.8], [10.9, 55.7], [12.7, 56.0],
          [12.6, 55.6], [11.0, 55.4], [10.5, 54.9], [9.5, 54.8], [8.0, 54.8]]],
        [[[10.0, 57.7], [10.5, 57.5], [11.0, 57.0], [12.0, 56.0], [11.0, 55.4],
          [10.5, 54.9], [9.5, 54.8], [8.5, 55.5], [8.0, 56.5], [9.0, 57.5], [10.0, 57.7]]]
      ]
    }
  }
];

async function addMore1914Countries() {
  try {
    console.log('Добавляем дополнительные страны для карты 1914 года...');
    
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
    
    for (const country of additionalCountries1914) {
      console.log(`Добавляем ${country.name}...`);
      
      // Проверяем, существует ли уже такая страна
      const { data: existingCountry } = await supabase
        .from('countries')
        .select('id')
        .eq('period_id', period.id)
        .eq('name', country.name)
        .single();
      
      if (existingCountry) {
        console.log(`${country.name} уже существует, пропускаем...`);
        continue;
      }
      
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
      
      // Добавляем геометрию
      const { error: geometryError } = await supabase
        .from('country_geometries')
        .insert({
          country_id: newCountry.id,
          geometry_type: country.geometry.type,
          coordinates: country.geometry.coordinates
        });
      
      if (geometryError) {
        console.error(`Ошибка добавления геометрии для ${country.name}:`, geometryError);
      } else {
        console.log(`✓ ${country.name} добавлена`);
      }
    }
    
    console.log('Дополнительные страны для карты 1914 года добавлены!');
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

addMore1914Countries();