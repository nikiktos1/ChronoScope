const fs = require('fs');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    // Более точные границы Турции
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для разделения кольца на сегменты, исключая турецкие части
function splitRingExcludingTurkey(ring) {
    const segments = [];
    let currentSegment = [];
    
    for (let i = 0; i < ring.length; i++) {
        const point = ring[i];
        const [lon, lat] = point;
        
        if (!isInTurkey(lon, lat)) {
            // Точка не в Турции, добавляем к текущему сегменту
            currentSegment.push(point);
        } else {
            // Точка в Турции
            if (currentSegment.length > 3) {
                // Закрываем текущий сегмент, если он достаточно большой
                currentSegment.push(currentSegment[0]); // Замыкаем полигон
                segments.push([...currentSegment]);
            }
            currentSegment = [];
        }
    }
    
    // Добавляем последний сегмент, если он есть
    if (currentSegment.length > 3) {
        currentSegment.push(currentSegment[0]); // Замыкаем полигон
        segments.push(currentSegment);
    }
    
    return segments;
}

console.log('Обрабатываем СССР 1938 года для удаления турецких территорий...');

const data = JSON.parse(fs.readFileSync('public/data/maps/europe_1938.json', 'utf8'));
let modified = false;

data.features = data.features.map(feature => {
    if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
        console.log('Найден СССР, обрабатываем основной полигон...');
        
        const newCoordinates = [];
        
        feature.geometry.coordinates.forEach((polygon, polygonIndex) => {
            console.log(`Обрабатываем полигон ${polygonIndex}...`);
            
            const newPolygon = [];
            
            polygon.forEach((ring, ringIndex) => {
                // Проверяем, есть ли в кольце точки в Турции
                const hasPointsInTurkey = ring.some(coord => isInTurkey(coord[0], coord[1]));
                
                if (!hasPointsInTurkey) {
                    // Кольцо не содержит турецких точек, оставляем как есть
                    newPolygon.push(ring);
                    console.log(`  Кольцо ${ringIndex}: оставлено без изменений`);
                } else {
                    // Кольцо содержит турецкие точки, пытаемся разделить
                    console.log(`  Кольцо ${ringIndex}: содержит турецкие точки, разделяем...`);
                    
                    const segments = splitRingExcludingTurkey(ring);
                    console.log(`    Получено ${segments.length} сегментов`);
                    
                    // Добавляем только достаточно большие сегменты
                    segments.forEach((segment, segIndex) => {
                        if (segment.length > 10) { // Минимальный размер для валидного полигона
                            newPolygon.push(segment);
                            console.log(`    Сегмент ${segIndex}: добавлен (${segment.length} точек)`);
                        } else {
                            console.log(`    Сегмент ${segIndex}: слишком мал, пропущен`);
                        }
                    });
                    
                    modified = true;
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
    console.log('✅ Файл europe_1938.json обновлен - турецкие части СССР удалены');
} else {
    console.log('ℹ️  Файл не изменен');
}

console.log('Обработка завершена');