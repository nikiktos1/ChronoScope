const fs = require('fs');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    // Приблизительные границы Турции
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Анализ координат
function analyzeCoordinates(coordinates, level = 0) {
    const indent = '  '.repeat(level);
    
    if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0]) && typeof coordinates[0][0][0] === 'number') {
        // Это кольцо координат
        console.log(`${indent}Кольцо из ${coordinates.length} точек:`);
        let inTurkeyCount = 0;
        let minLat = Infinity, maxLat = -Infinity;
        let minLon = Infinity, maxLon = -Infinity;
        
        coordinates.forEach(coord => {
            const [lon, lat] = coord;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            
            if (isInTurkey(lon, lat)) {
                inTurkeyCount++;
            }
        });
        
        console.log(`${indent}  Границы: lat ${minLat.toFixed(2)}-${maxLat.toFixed(2)}, lon ${minLon.toFixed(2)}-${maxLon.toFixed(2)}`);
        console.log(`${indent}  Точек в Турции: ${inTurkeyCount}/${coordinates.length}`);
        
        if (inTurkeyCount > 0) {
            console.log(`${indent}  ⚠️  ПРОБЛЕМНОЕ КОЛЬЦО - содержит точки в Турции!`);
        }
        
        return inTurkeyCount > 0;
    } else {
        // Это массив колец или полигонов
        let hasProblems = false;
        coordinates.forEach((item, index) => {
            console.log(`${indent}Элемент ${index}:`);
            if (analyzeCoordinates(item, level + 1)) {
                hasProblems = true;
            }
        });
        return hasProblems;
    }
}

// Обработка файлов
const files = [
    'public/data/maps/europe_1920.json',
    'public/data/maps/europe_1938.json'
];

files.forEach(filename => {
    console.log(`\n=== Анализируем ${filename} ===`);
    
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    
    data.features.forEach((feature, index) => {
        if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
            console.log(`\nНайден СССР (индекс ${index}):`);
            console.log(`Тип геометрии: ${feature.geometry.type}`);
            
            if (analyzeCoordinates(feature.geometry.coordinates)) {
                console.log('🚨 ЭТОТ СССР СОДЕРЖИТ ПРОБЛЕМНЫЕ ТЕРРИТОРИИ В ТУРЦИИ!');
            } else {
                console.log('✅ Этот СССР не заходит в Турцию');
            }
        }
    });
});

console.log('\nАнализ завершен');