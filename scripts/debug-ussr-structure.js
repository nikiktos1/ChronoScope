const fs = require('fs');

// Обработка файлов
const files = [
    'public/data/maps/europe_1920.json',
    'public/data/maps/europe_1938.json'
];

files.forEach(filename => {
    console.log(`\n=== Отладка ${filename} ===`);
    
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    data.features.forEach((feature, index) => {
        if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
            console.log(`\nНайден СССР (индекс ${index}):`);
            console.log(`Тип геометрии: ${feature.geometry.type}`);
            console.log(`Количество элементов coordinates: ${feature.geometry.coordinates.length}`);
            
            // Проверим первые несколько координат
            feature.geometry.coordinates.forEach((polygon, pIndex) => {
                console.log(`\nПолигон ${pIndex}:`);
                console.log(`  Количество колец: ${polygon.length}`);
                
                polygon.forEach((ring, rIndex) => {
                    console.log(`  Кольцо ${rIndex}: ${ring.length} точек`);
                    if (ring.length > 0) {
                        console.log(`    Первая точка: [${ring[0][0]}, ${ring[0][1]}]`);
                        if (ring.length > 1) {
                            console.log(`    Вторая точка: [${ring[1][0]}, ${ring[1][1]}]`);
                        }
                        if (ring.length > 2) {
                            console.log(`    Последняя точка: [${ring[ring.length-1][0]}, ${ring[ring.length-1][1]}]`);
                        }
                        
                        // Проверим границы
                        let minLat = Infinity, maxLat = -Infinity;
                        let minLon = Infinity, maxLon = -Infinity;
                        
                        ring.forEach(coord => {
                            const [lon, lat] = coord;
                            minLat = Math.min(minLat, lat);
                            maxLat = Math.max(maxLat, lat);
                            minLon = Math.min(minLon, lon);
                            maxLon = Math.max(maxLon, lon);
                        });
                        
                        console.log(`    Границы: lat ${minLat.toFixed(2)}-${maxLat.toFixed(2)}, lon ${minLon.toFixed(2)}-${maxLon.toFixed(2)}`);
                        
                        // Проверим, есть ли точки в Турции (35.8-42.1 lat, 25.7-44.8 lon)
                        const inTurkey = ring.some(coord => {
                            const [lon, lat] = coord;
                            return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
                        });
                        
                        if (inTurkey) {
                            console.log(`    🚨 ПРОБЛЕМА: Это кольцо содержит точки в Турции!`);
                        }
                    }
                });
            });
        }
    });
});

console.log('\nОтладка завершена');