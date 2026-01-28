const fs = require('fs');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Проверяем файлы
const files = [
    'public/data/maps/europe_1920.json',
    'public/data/maps/europe_1938.json'
];

files.forEach(filename => {
    console.log(`\n=== Проверяем ${filename} ===`);
    
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    data.features.forEach((feature, index) => {
        if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
            console.log(`\nНайден СССР (индекс ${index}):`);
            
            let totalPointsInTurkey = 0;
            let totalPoints = 0;
            
            feature.geometry.coordinates.forEach((polygon, pIndex) => {
                polygon.forEach((ring, rIndex) => {
                    let pointsInTurkey = 0;
                    
                    ring.forEach(coord => {
                        totalPoints++;
                        if (isInTurkey(coord[0], coord[1])) {
                            pointsInTurkey++;
                            totalPointsInTurkey++;
                        }
                    });
                    
                    console.log(`  Полигон ${pIndex}, кольцо ${rIndex}: ${pointsInTurkey}/${ring.length} точек в Турции`);
                    
                    if (pointsInTurkey > 0) {
                        console.log(`    🚨 ПРОБЛЕМА: Кольцо содержит ${pointsInTurkey} точек в Турции!`);
                        
                        // Показываем несколько проблемных точек
                        const turkishPoints = ring.filter(coord => isInTurkey(coord[0], coord[1]));
                        console.log(`    Примеры турецких точек:`);
                        turkishPoints.slice(0, 3).forEach((point, i) => {
                            console.log(`      ${i + 1}. [${point[0].toFixed(2)}, ${point[1].toFixed(2)}]`);
                        });
                    }
                });
            });
            
            console.log(`\nИтого: ${totalPointsInTurkey}/${totalPoints} точек СССР находятся в Турции`);
            
            if (totalPointsInTurkey === 0) {
                console.log('✅ СССР не заходит в Турцию');
            } else {
                console.log(`❌ СССР все еще содержит ${totalPointsInTurkey} точек в Турции`);
            }
        }
    });
});

console.log('\nПроверка завершена');