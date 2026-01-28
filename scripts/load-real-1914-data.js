const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function loadReal1914Data() {
  try {
    console.log('🎉 ЗАГРУЖАЕМ НАСТОЯЩИЕ ИСТОРИЧЕСКИЕ ГРАНИЦЫ 1914 ГОДА!');
    console.log('📍 Источник: historical-basemaps (официальный исторический проект)');
    console.log('🌐 URL: https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson\n');
    
    // Загружаем настоящие исторические данные
    const response = await axios.get(
      'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_1914.geojson',
      {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    console.log('✅ Исторические данные успешно загружены!');
    console.log(`📊 Размер: ${response.data.length || 'неизвестно'} символов`);
    
    const historicalData = response.data;
    
    if (historicalData.type !== 'FeatureCollection') {
      console.error('❌ Не является GeoJSON FeatureCollection');
      return;
    }
    
    console.log(`🗺️  Содержит ${historicalData.features.length} исторических объектов`);
    
    // Сохраняем исходные данные
    fs.writeFileSync('data/real-historical-1914.json', JSON.stringify(historicalData, null, 2));
    console.log('💾 Исходные данные сохранены: data/real-historical-1914.json');
    
    // Фильтруем европейские страны для 1914 года
    const europeanCountries = filterEuropeanCountries1914(historicalData.features);
    
    console.log(`\n🔄 Отфильтровано ${europeanCountries.length} европейских стран для 1914 года:`);
    europeanCountries.forEach(country => {
      console.log(`   • ${country.properties.name}`);
    });
    
    // Загружаем в Supabase
    await uploadRealHistoricalData(europeanCountries);
    
  } catch (error) {
    console.error('💥 Ошибка загрузки:', error.message);
  }
}

function filterEuropeanCountries1914(features) {
  // Список европейских стран и империй, существовавших в 1914 году
  const europeanCountries1914 = [
    'Russia', 'Russian Empire', 'Российская империя',
    'Germany', 'German Empire', 'Германская империя', 
    'Austria-Hungary', 'Austro-Hungarian Empire', 'Австро-Венгрия',
    'France', 'Франция',
    'United Kingdom', 'Great Britain', 'Великобритания',
    'Ottoman Empire', 'Turkey', 'Османская империя',
    'Italy', 'Италия',
    'Spain', 'Испания',
    'Portugal', 'Португалия',
    'Serbia', 'Сербия',
    'Greece', 'Греция',
    'Bulgaria', 'Болгария',
    'Romania', 'Румыния',
    'Belgium', 'Бельгия',
    'Netherlands', 'Holland', 'Нидерланды',
    'Switzerland', 'Швейцария',
    'Sweden', 'Швеция',
    'Norway', 'Норвегия',
    'Denmark', 'Дания',
    'Montenegro', 'Черногория'
  ];
  
  const filtered = [];
  
  for (const feature of features) {
    const props = feature.properties;
    const name = props.NAME || props.name || props.ADMIN || props.Country || props.country;
    
    if (!name) continue;
    
    // Проверяем, является ли страна европейской в 1914 году
    const isEuropean1914 = europeanCountries1914.some(euroCountry => 
      name.toLowerCase().includes(euroCountry.toLowerCase()) ||
      euroCountry.toLowerCase().includes(name.toLowerCase())
    );
    
    if (isEuropean1914) {
      // Переводим названия на русский для консистентности
      let russianName = name;
      
      const nameMapping = {
        'Russia': 'Российская империя',
        'Russian Empire': 'Российская империя',
        'Germany': 'Германская империя',
        'German Empire': 'Германская империя',
        'Austria-Hungary': 'Австро-Венгрия',
        'Austro-Hungarian Empire': 'Австро-Венгрия',
        'France': 'Франция',
        'United Kingdom': 'Великобритания',
        'Great Britain': 'Великобритания',
        'Ottoman Empire': 'Османская империя',
        'Turkey': 'Османская империя',
        'Italy': 'Италия',
        'Spain': 'Испания',
        'Portugal': 'Португалия',
        'Serbia': 'Сербия',
        'Greece': 'Греция',
        'Bulgaria': 'Болгария',
        'Romania': 'Румыния',
        'Belgium': 'Бельгия',
        'Netherlands': 'Нидерланды',
        'Holland': 'Нидерланды',
        'Switzerland': 'Швейцария',
        'Sweden': 'Швеция',
        'Norway': 'Норвегия',
        'Denmark': 'Дания',
        'Montenegro': 'Черногория'
      };
      
      russianName = nameMapping[name] || name;
      
      filtered.push({
        type: 'Feature',
        properties: {
          name: russianName,
          name_en: name,
          original_name: name,
          source: 'Historical Basemaps Project - Real 1914 Data'
        },
        geometry: feature.geometry
      });
    }
  }
  
  return filtered;
}

async function uploadRealHistoricalData(countries) {
  try {
    console.log('\n🚀 ЗАГРУЖАЕМ НАСТОЯЩИЕ ИСТОРИЧЕСКИЕ ГРАНИЦЫ В SUPABASE...');
    
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
    
    // ПОЛНОСТЬЮ ОЧИЩАЕМ старые данные
    console.log('🧹 Удаляем ВСЕ старые данные (современные границы)...');
    
    const { data: oldCountries } = await supabase
      .from('countries')
      .select('id')
      .eq('period_id', period.id);
    
    if (oldCountries && oldCountries.length > 0) {
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
      
      console.log(`✅ Удалено ${oldCountries.length} старых записей с современными границами`);
    }
    
    // Загружаем НАСТОЯЩИЕ исторические данные
    console.log('\n📥 Загружаем НАСТОЯЩИЕ исторические границы 1914 года...');
    
    let successCount = 0;
    
    for (const country of countries) {
      const props = country.properties;
      
      console.log(`📍 Загружаем: ${props.name} (${props.name_en})`);
      
      try {
        // Создаем страну с историческими данными
        const { data: newCountry, error: countryError } = await supabase
          .from('countries')
          .insert({
            period_id: period.id,
            name: props.name,
            name_en: props.name_en,
            border_precision: 10, // МАКСИМАЛЬНАЯ точность для настоящих исторических данных
            color: generateHistoricalColor(props.name),
            subjecto: `НАСТОЯЩИЕ исторические границы 1914 года. Источник: Historical Basemaps Project`
          })
          .select('id')
          .single();
        
        if (countryError) {
          console.error(`❌ Ошибка создания ${props.name}:`, countryError.message);
          continue;
        }
        
        // Добавляем НАСТОЯЩУЮ историческую геометрию
        const { error: geoError } = await supabase
          .from('country_geometries')
          .insert({
            country_id: newCountry.id,
            geometry_type: country.geometry.type,
            coordinates: country.geometry.coordinates
          });
        
        if (geoError) {
          console.error(`❌ Ошибка геометрии ${props.name}:`, geoError.message);
        } else {
          console.log(`✅ ${props.name} - ИСТОРИЧЕСКИЕ границы загружены`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ Общая ошибка ${props.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 НАСТОЯЩИЕ ИСТОРИЧЕСКИЕ ГРАНИЦЫ 1914 ГОДА ЗАГРУЖЕНЫ!`);
    console.log(`✅ Успешно загружено: ${successCount} стран`);
    console.log(`🎯 Точность границ: 10 (максимальная для исторических данных)`);
    console.log(`📍 Источник: Historical Basemaps Project (официальный)`);
    console.log(`📅 Год: 1914 (реальные исторические границы)`);
    console.log(`🌐 Проект: https://github.com/aourednik/historical-basemaps`);
    
    // Финальная проверка
    const { data: verification } = await supabase
      .from('countries')
      .select('name, border_precision')
      .eq('period_id', period.id)
      .order('name');
    
    console.log(`\n🔍 Итоговый список исторических стран (${verification.length}):`);
    verification.forEach(country => {
      console.log(`   • ${country.name} (точность: ${country.border_precision})`);
    });
    
  } catch (error) {
    console.error('💥 Ошибка загрузки в Supabase:', error);
  }
}

function generateHistoricalColor(countryName) {
  const historicalColors = {
    'Российская империя': '#4A90E2',
    'Германская империя': '#2C3E50',
    'Австро-Венгрия': '#DC143C',
    'Франция': '#0055A4',
    'Великобритания': '#C8102E',
    'Османская империя': '#E30A17',
    'Италия': '#009246',
    'Испания': '#AA151B',
    'Португалия': '#006600',
    'Греция': '#0D5EAF',
    'Болгария': '#00966E',
    'Румыния': '#FCD116',
    'Бельгия': '#000000',
    'Нидерланды': '#FF9B00',
    'Швеция': '#006AA7',
    'Норвегия': '#EF2B2D',
    'Дания': '#C60C30',
    'Сербия': '#C6363C',
    'Черногория': '#8B4513'
  };
  
  return historicalColors[countryName] || '#95A5A6';
}

// Запускаем загрузку НАСТОЯЩИХ исторических данных
loadReal1914Data();