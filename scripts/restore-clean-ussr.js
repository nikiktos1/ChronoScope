const fs = require('fs');

console.log('Восстанавливаем чистые территории СССР без артефактов...');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для извлечения чистых территорий СССР из мировых данных
function extractCleanUSSR(worldFile, year) {
    const worldData = JSON.parse(fs.readFileSync(worldFile, 'utf8'));
    
    // Ищем СССР в мировых данных
    const ussrFeatures = worldData.features.filter(feature => {
        const name = feature.properties.NAME || feature.properties.name || '';
        return name.includes('USSR') || name.includes('Soviet');
    });
    
    if (ussrFeatures.length === 0) {
        console.log(`Не найден СССР в ${worldFile}`);
        return null;
    }
    
    const ussrFeature = ussrFeatures[0];
    console.log(`Найден СССР в ${worldFile}: ${ussrFeature.properties.NAME}`);
    
    // Фильтруем полигоны, исключая те, что полностью в Турции
    let cleanGeometry = { ...ussrFeature.geometry };
    
    if (cleanGeometry.type === 'MultiPolygon') {
        const cleanPolygons = cleanGeometry.coordinates.filter(polygon => {
            // Проверяем первое кольцо полигона
            const ring = polygon[0];
            if (!ring || ring.length === 0) return false;
            
            // Если все точки кольца в Турции, исключаем весь полигон
            const allInTurkey = ring.every(coord => isInTurkey(coord[0], coord[1]));
            if (allInTurkey) {
                console.log('  Исключаем полигон, полностью находящийся в Турции');
                return false;
            }
            
            return true;
        });
        
        cleanGeometry.coordinates = cleanPolygons;
    }
    
    return cleanGeometry;
}

// Восстанавливаем СССР для 1920 года
console.log('\n=== Восстанавливаем СССР 1920 ===');
const ussr1920Geometry = extractCleanUSSR('public/data/historical/world_1920.geojson', 1920);

if (ussr1920Geometry) {
    const europeData1920 = JSON.parse(fs.readFileSync('public/data/maps/europe_1920.json', 'utf8'));
    
    // Удаляем существующий СССР
    europeData1920.features = europeData1920.features.filter(f => 
        f.properties.name !== 'СССР' && f.properties.originalName !== 'USSR'
    );
    
    // Добавляем чистый СССР
    const newUSSR1920 = {
        type: "Feature",
        properties: {
            name: "СССР",
            originalName: "USSR",
            color: "#feea30",
            ruler: "Владимир Ленин",
            capital: "Москва",
            government: "Советская республика",
            description: "Молодое советское государство после Гражданской войны",
            year: 1920,
            period: "Послевоенная Европа"
        },
        geometry: ussr1920Geometry
    };
    
    europeData1920.features.push(newUSSR1920);
    fs.writeFileSync('public/data/maps/europe_1920.json', JSON.stringify(europeData1920, null, 2));
    console.log('✅ СССР 1920 восстановлен');
}

// Восстанавливаем СССР для 1938 года
console.log('\n=== Восстанавливаем СССР 1938 ===');
const ussr1938Geometry = extractCleanUSSR('public/data/historical/world_1938.geojson', 1938);

if (ussr1938Geometry) {
    const europeData1938 = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
    
    // Удаляем существующий СССР
    europeData1938.features = europeData1938.features.filter(f => 
        f.properties.name !== 'СССР' && f.properties.originalName !== 'USSR'
    );
    
    // Добавляем чистый СССР
    const newUSSR1938 = {
        type: "Feature",
        properties: {
            name: "СССР",
            originalName: "USSR",
            color: "#add733",
            ruler: "Иосиф Сталин",
            capital: "Москва",
            government: "Советская диктатура",
            description: "Сталинский режим, готовится к войне",
            year: 1938,
            period: "Накануне Второй мировой войны"
        },
        geometry: ussr1938Geometry
    };
    
    europeData1938.features.push(newUSSR1938);
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(europeData1938, null, 2));
    console.log('✅ СССР 1938 восстановлен');
}

console.log('\n🎉 Восстановление чистых территорий СССР завершено!');