import { supabase } from './supabase'
import type { HistoricalPeriod, Country, CountryGeometry } from './supabase'

// Получить все доступные периоды
export async function getHistoricalPeriods(): Promise<HistoricalPeriod[]> {
  const { data, error } = await supabase
    .from('historical_periods')
    .select('*')
    .order('year', { ascending: true })

  if (error) {
    console.error('Ошибка получения периодов:', error)
    return []
  }

  return data || []
}

// Получить карту для конкретного года
export async function getMapForYear(year: number) {
  // Получаем период
  const { data: period, error: periodError } = await supabase
    .from('historical_periods')
    .select('id')
    .eq('year', year)
    .single()

  if (periodError || !period) {
    console.error('Период не найден:', year, periodError)
    return null
  }

  // Получаем страны с их геометрией
  const { data: countries, error: countriesError } = await supabase
    .from('countries')
    .select(`
      *,
      country_geometries (*)
    `)
    .eq('period_id', period.id)

  if (countriesError) {
    console.error('Ошибка получения стран:', countriesError)
    return null
  }

  // Преобразуем в формат GeoJSON
  const features = countries?.map(country => ({
    type: 'Feature',
    properties: {
      name: country.name,
      name_en: country.name_en,
      ruler: country.ruler,
      capital: country.capital,
      government: country.government,
      color: country.color,
      ABBREVN: country.abbrevn,
      SUBJECTO: country.subjecto,
      BORDERPRECISION: country.border_precision,
      PARTOF: country.part_of
    },
    geometry: country.country_geometries?.[0] ? {
      type: country.country_geometries[0].geometry_type,
      coordinates: country.country_geometries[0].coordinates
    } : null
  })).filter(feature => feature.geometry !== null) || []

  return {
    type: 'FeatureCollection',
    features
  }
}

// Получить список доступных лет
export async function getAvailableYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from('historical_periods')
    .select('year')
    .order('year', { ascending: true })

  if (error) {
    console.error('Ошибка получения годов:', error)
    return []
  }

  return data?.map(p => p.year) || []
}

// Поиск стран по названию
export async function searchCountries(query: string, year?: number) {
  let queryBuilder = supabase
    .from('countries')
    .select(`
      *,
      historical_periods!inner(year),
      country_geometries (*)
    `)
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%`)

  if (year) {
    queryBuilder = queryBuilder.eq('historical_periods.year', year)
  }

  const { data, error } = await queryBuilder

  if (error) {
    console.error('Ошибка поиска стран:', error)
    return []
  }

  return data || []
}