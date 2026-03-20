import * as fs from 'fs';

const geojsonData = fs.readFileSync('world_1492.geojson', 'utf-8');
const geojson = JSON.parse(geojsonData);

// Европейские территории для поиска
const europeanKeywords = [
  'France', 'Spain', 'Portugal', 'England', 'Scotland', 'Ireland', 'Wales',
  'Ottoman', 'Holy Roman', 'Poland', 'Lithuania', 'Hungary', 'Bohemia',
  'Denmark', 'Sweden', 'Norway', 'Venice', 'Genoa', 'Florence',
  'Papal', 'Naples', 'Milan', 'Muscovy', 'Russia', 'Ryazan',
  'Teutonic', 'Moldavia', 'Wallachia', 'Serbia', 'Bosnia',
  'Austria', 'Swiss', 'Netherlands', 'Burgundy', 'Aragon',
  'Castile', 'Navarre', 'Granada', 'Byzantine', 'Albania',
  'Croatia', 'Ragusa', 'Savoy', 'Ferrara', 'Mantua',
  'Modena', 'Lucca', 'Siena', 'Urbino', 'Montferrat',
  'Brittany', 'Provence', 'Lorraine', 'Flanders', 'Hainaut',
  'Brabant', 'Holland', 'Frisia', 'Saxony', 'Bavaria',
  'Brandenburg', 'Pomerania', 'Mecklenburg', 'Livonia', 'Estonia',
  'Novgorod', 'Pskov', 'Tver', 'Crimea', 'Golden Horde',
  'Kazan', 'Astrakhan', 'Circassia', 'Georgia', 'Armenia'
];

const europeanTerritories = geojson.features.filter((f: { properties: { NAME?: string; SUBJECTO?: string; PARTOF?: string } }) => {
  const name = f.properties.NAME || '';
  const subjecto = f.properties.SUBJECTO || '';
  const partOf = f.properties.PARTOF || '';
  
  const text = `${name} ${subjecto} ${partOf}`.toLowerCase();
  
  return europeanKeywords.some(keyword => 
    text.includes(keyword.toLowerCase())
  );
});

console.log(`Найдено европейских территорий: ${europeanTerritories.length}\n`);

europeanTerritories.forEach((f: { properties: { NAME: string; SUBJECTO: string } }, i: number) => {
  console.log(`${i + 1}. ${f.properties.NAME} (SUBJECTO: ${f.properties.SUBJECTO})`);
});
