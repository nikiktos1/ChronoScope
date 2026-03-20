import * as fs from 'fs';

const geojsonData = fs.readFileSync('world_1492.geojson', 'utf-8');
const geojson = JSON.parse(geojsonData);

console.log('=== Поиск в Иберии ===\n');
const iberianKeywords = ['Castile', 'Aragon', 'Granada', 'Leon', 'Galicia', 'Catalonia', 'Valencia'];
const iberian = geojson.features.filter((f: any) => {
  const text = `${f.properties.NAME} ${f.properties.SUBJECTO}`.toLowerCase();
  return iberianKeywords.some(k => text.includes(k.toLowerCase()));
});

iberian.forEach((f: any) => {
  console.log(`${f.properties.NAME} (SUBJECTO: ${f.properties.SUBJECTO}, PARTOF: ${f.properties.PARTOF})`);
});

console.log(`\nНайдено: ${iberian.length}`);

console.log('\n=== Поиск в Италии ===\n');
const italianKeywords = ['Naples', 'Sicily', 'Milan', 'Genoa', 'Florence', 'Ferrara', 'Mantua', 'Modena', 'Lucca', 'Siena', 'Urbino', 'Savoy'];
const italian = geojson.features.filter((f: any) => {
  const text = `${f.properties.NAME} ${f.properties.SUBJECTO}`.toLowerCase();
  return italianKeywords.some(k => text.includes(k.toLowerCase()));
});

italian.forEach((f: any) => {
  console.log(`${f.properties.NAME} (SUBJECTO: ${f.properties.SUBJECTO}, PARTOF: ${f.properties.PARTOF})`);
});

console.log(`\nНайдено: ${italian.length}`);
