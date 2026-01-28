const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Восстанавливаем состояние карты после добавления Испании
// (до изменения границ основных империй)
const goodVersionCountries = [
  {
    name: "Российская империя",
    name_en: "Russian Empire",
    ruler: "Николай II",
    capital: "Санкт-Петербург",
    government: "Абсолютная монархия",
    color: "#4A90E2",
    border_precision: 4
  },
  {
    name: "Германская империя", 
    name_en: "German Empire",
    ruler: "Вильгельм II",
    capital: "Берлин",
    government: "Конституционная монархия",
    color: "#2C3E50",
    border_precision: 4
  },
  {
    name: "Австро-Венгрия",
    name_en: "Austria-Hungary",
    ruler: "Франц Иосиф I",
    capital: "Вена",
    government: "Дуалистическая монархия",
    color: "#DC143C",
    border_precision: 4
  },
  {
    name: "Франция",
    name_en: "France",
    ruler: "Раймон Пуанкаре",
    capital: "Париж",
    government: "Республика",
    color: "#0055A4",
    border_precision: 4
  },
  {
    name: "Великобритания",
    name_en: "United Kingdom",
    ruler: "Георг V",
    capital: "Лондон",
    government: "Конституционная монархия",
    color: "#C8102E",
    border_precision: 4
  },
  {
    name: "Османская империя",
    name_en: "Ottoman Empire",
    ruler: "Мехмед V",
    capital: "Константинополь",
    government: "Абсолютная монархия",
    color: "#E30A17",
    border_precision: 3
  },
  {
    name: "Италия",
    name_en: "Italy",
    ruler: "Виктор Эммануил III",
    capital: "Рим",
    government: "Конституционная монархия",
    color: "#009246",
    border_precision: 4
  },
  {
    name: "Испания",
    name_en: "Spain",
    ruler: "Альфонсо XIII",
    capital: "Мадрид",
    government: "Конституционная монархия",
    color: "#AA151B",
    border_precision: 4
  },
  {
    name: "Португалия",
    name_en: "Portugal",
    ruler: "Мануэл II",
    capital: "Лиссабон",
    government: "Конституционная монархия",
    color: "#006600",
    border_precision: 4
  },
  {
    name: "Сербия",
    name_en: "Serbia",
    ruler: "Пётр I Карагеоргиевич",
    capital: "Белград",
    government: "Конституционная монархия",
    color: "#C6363C",
    border_precision: 4
  },
  {
    name: "Греция",
    name_en: "Greece",
    ruler: "Константин I",
    capital: "Афины",
    government: "Конституционная монархия",
    color: "#0D5EAF",
    border_precision: 4
  },
  {
    name: "Болгария",
    name_en: "Bulgaria",
    ruler: "Фердинанд I",
    capital: "София",
    government: "Конституционная монархия",
    color: "#00966E",
    border_precision: 4
  },
  {
    name: "Румыния",
    name_en: "Romania",
    ruler: "Кароль I",
    capital: "Бухарест",
    government: "Конституционная монархия",
    color: "#FCD116",
    border_precision: 4
  },
  {
    name: "Бельгия",
    name_en: "Belgium",
    ruler: "Альберт I",
    capital: "Брюссель",
    government: "Конституционная монархия",
    color: "#000000",
    border_precision: 4
  },
  {
    name: "Нидерланды",
    name_en: "Netherlands",
    ruler: "Вильгельмина",
    capital: "Амстердам",
    government: "Конституционная монархия",
    color: "#FF9B00",
    border_precision: 4
  },
  {
    name: "Швейцария",
    name_en: "Switzerland",
    ruler: "Федеральный совет",
    capital: "Берн",
    government: "Федеративная республика",
    color: "#E74C3C",
    border_precision: 4
  },
  {
    name: "Швеция",
    name_en: "Sweden",
    ruler: "Густав V",
    capital: "Стокгольм",
    government: "Конституционная монархия",
    color: "#006AA7",
    border_precision: 3
  },
  {
    name: "Норвегия",
    name_en: "Norway",
    ruler: "Хокон VII",
    capital: "Кристиания (Осло)",
    government: "Конституционная монархия",
    color: "#EF2B2D",
    border_precision: 3
  },
  {
    name: "Дания",
    name_en: "Denmark",
    ruler: "Кристиан X",
    capital: "Копенгаген",
    government: "Конституционная монархия",
    color: "#C60C30",
    border_precision: 4
  }
];

async function rollbackToSpainVersion() {
  try {
    console.log('⏪ Откатываем карту к версии после добавления Испании...');
    
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
    
    // Получаем текущие страны
    const { data: currentCountries } = await supabase
      .from('countries')
      .select('id, name')
      .eq('period_id', period.id);
    
    console.log(`📊 Текущее количество стран: ${currentCountries.length}`);
    
    // Обновляем информацию о странах до "хорошей" версии
    console.log('\n🔄 Восстанавливаем информацию о странах...');
    
    for (const countryData of goodVersionCountries) {
      const existingCountry = currentCountries.find(c => c.name === countryData.name);
      
      if (existingCountry) {
        console.log(`✅ Восстанавливаем: ${countryData.name}`);
        
        const { error } = await supabase
          .from('countries')
          .update({
            name_en: countryData.name_en,
            ruler: countryData.ruler,
            capital: countryData.capital,
            government: countryData.government,
            color: countryData.color,
            border_precision: countryData.border_precision
          })
          .eq('id', existingCountry.id);
        
        if (error) {
          console.error(`❌ Ошибка обновления ${countryData.name}:`, error.message);
        }
      } else {
        console.log(`⚠️  ${countryData.name} не найдена, пропускаем`);
      }
    }
    
    // Удаляем микрогосударства, которые были добавлены позже
    const microstatesToRemove = ['Люксембург', 'Монако', 'Сан-Марино', 'Андорра', 'Лихтенштейн'];
    
    console.log('\n🗑️  Удаляем микрогосударства...');
    
    for (const microstate of microstatesToRemove) {
      const country = currentCountries.find(c => c.name === microstate);
      
      if (country) {
        console.log(`❌ Удаляем: ${microstate}`);
        
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
    
    // Проверяем результат
    const { data: finalCountries } = await supabase
      .from('countries')
      .select('name, color, border_precision')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n📊 Итоговый список стран (${finalCountries.length}):`);
    finalCountries.forEach(country => {
      console.log(`   • ${country.name} - ${country.color} (точность: ${country.border_precision})`);
    });
    
    console.log(`\n🎉 Карта откачена к хорошей версии!`);
    console.log(`📍 Теперь карта содержит ${finalCountries.length} основных европейских стран 1914 года`);
    
  } catch (error) {
    console.error('💥 Ошибка:', error);
  }
}

rollbackToSpainVersion();