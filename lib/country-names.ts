// Локализация названий стран на русский
export const countryNames: Record<string, string> = {
  // Российские государства
  'Russia': 'Российская империя',
  'Soviet Union': 'СССР',
  'Russian Federation': 'Российская Федерация',
  
  // Империи
  'German Empire': 'Германская империя',
  'Germany': 'Германия',
  'Austro-Hungarian Empire': 'Австро-Венгрия',
  'Austria': 'Австрия',
  'Hungary': 'Венгрия',
  'Ottoman Empire': 'Османская империя',
  'Turkey': 'Турция',
  'Roman Empire': 'Римская империя',
  'Byzantine Empire': 'Византийская империя',
  'Holy Roman Empire': 'Священная Римская империя',
  
  // Западная Европа
  'France': 'Франция',
  'United Kingdom': 'Великобритания',
  'United Kingdom of Great Britain and Ireland': 'Соединённое Королевство',
  'Spain': 'Испания',
  'Portugal': 'Португалия',
  'Italy': 'Италия',
  'Kingdom of the Two Sicilies': 'Королевство Обеих Сицилий',
  'Belgium': 'Бельгия',
  'Netherlands': 'Нидерланды',
  'Luxembourg': 'Люксембург',
  'Switzerland': 'Швейцария',
  
  // Северная Европа
  'Sweden': 'Швеция',
  'Norway': 'Норвегия',
  'Denmark': 'Дания',
  'Finland': 'Финляндия',
  'Iceland': 'Исландия',
  
  // Восточная Европа
  'Poland': 'Польша',
  'Czechoslovakia': 'Чехословакия',
  'Czech Republic': 'Чехия',
  'Slovakia': 'Словакия',
  'Ukraine': 'Украина',
  'Belarus': 'Беларусь',
  'Moldova': 'Молдова',
  'Lithuania': 'Литва',
  'Latvia': 'Латвия',
  'Estonia': 'Эстония',
  
  // Балканы
  'Yugoslavia': 'Югославия',
  'Serbia': 'Сербия',
  'Croatia': 'Хорватия',
  'Bosnia and Herzegovina': 'Босния и Герцеговина',
  'Slovenia': 'Словения',
  'Montenegro': 'Черногория',
  'Albania': 'Албания',
  'Macedonia': 'Македония',
  'Greece': 'Греция',
  'Romania': 'Румыния',
  'Bulgaria': 'Болгария',
  
  // Германские государства
  'Prussia': 'Пруссия',
  'Bavaria': 'Бавария',
  'Saxony': 'Саксония',
  'Baden': 'Баден',
  'Württemberg': 'Вюртемберг',
  'Palatinate': 'Пфальц',
  'Hohenzollern': 'Гогенцоллерн',
  'Mecklenburg-Strelitz': 'Мекленбург-Стрелиц',
  'Grand Duchy of Hesse': 'Великое герцогство Гессен',
  'Nassau': 'Нассау',
  'Wetzlar': 'Вецлар',
  
  // Другие
  'Ireland': 'Ирландия',
  'Malta': 'Мальта',
  'Georgia': 'Грузия',
  'Armenia': 'Армения',
  'Azerbaijan': 'Азербайджан',
  'Persia': 'Персия',
  'Morocco': 'Марокко'
};

export function getLocalizedName(englishName: string): string {
  return countryNames[englishName] || englishName;
}
