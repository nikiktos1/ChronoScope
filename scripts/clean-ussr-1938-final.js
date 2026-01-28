const fs = require('fs');

console.log('Финальная очистка СССР 1938 от турецких точек...');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для удаления турецких точек из кольца
function cleanRingFromTurkey(ring) {
    const cleanedRing = ring.filter(coord => !isInTurkey(coord[0], coord[1]));
    
    // Убеждаемся, что кольцо замкнуто
    if (cleanedRing.length > 3) {
        // Если первая и последняя точки не совпадают, замыкаем кольцо
        const first = cleanedRing[0];
        const last = cleanedRing[cleanedRing.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            cleanedRing.push([...first]);
        }
        return cleanedRing;
    }
    
    return null; // Кольцо слишком маленькое после очистки
}

const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
let modified = false;

data.features = data.features.map(feature => {
    if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
        console.log('Найден СССР, очищаем от турецких точек...');
        
        const newCoordinates = [];
        
        feature.geometry.coordinates.forEach((polygon, polygonIndex) => {
            console.log(`Обрабатываем полигон ${polygonIndex}...`);
            
            const newPolygon = [];
            
            polygon.forEach((ring, ringIndex) => {
                const turkishPoints = ring.filter(coord => isInTurkey(coord[0], coord[1]));
                
                if (turkishPoints.length === 0) {
                    // Кольцо чистое, оставляем как есть
                    newPolygon.push(ring);
                    console.log(`  Кольцо ${ringIndex}: чистое (${ring.length} точек)`);
                } else {
                    // Кольцо содержит турецкие точки, очищаем
                    console.log(`  Кольцо ${ringIndex}: содержит ${turkishPoints.length} турецких точек, очищаем...`);
                    
                    const cleanedRing = cleanRingFromTurkey(ring);
                    if (cleanedRing) {
                        newPolygon.push(cleanedRing);
                        console.log(`    Очищено: ${ring.length} -> ${cleanedRing.length} точек`);
                        modified = true;
                    } else {
                        console.log(`    Кольцо удалено (слишком мало точек после очистки)`);
                        modified = true;
                    }
                }
            });
            
            if (newPolygon.length > 0) {
                newCoordinates.push(newPolygon);
            }
        });
        
        return {
            ...feature,
            geometry: {
                ...feature.geometry,
                coordinates: newCoordinates
            }
        };
    }
    return feature;
});

if (modified) {
    fs.writeFileSync('public/data/maps/europe_1938.json', JSON.stringify(data, null, 2));
    console.log('✅ СССР 1938 очищен от турецких точек');
} else {
    console.log('ℹ️  Изменения не требуются');
}

console.log('Финальная очистка завершена');