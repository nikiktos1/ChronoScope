const fs = require('fs');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    // Приблизительные границы Турции
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для фильтрации координат полигона
function filterPolygonCoordinates(coordinates) {
    return coordinates.filter(ring => {
        // Проверяем, есть ли в кольце точки вне Турции
        const hasPointsOutsideTurkey = ring.some(coord => !isInTurkey(coord[0], coord[1]));
        
        // Если все точки в Турции, удаляем этот полигон
        if (!hasPointsOutsideTurkey) {
            console.log('Удаляем полигон, полностью находящийся в Турции');
            return false;
        }
        
        return true;
    });
}

// Функция для обработки геометрии
function processGeometry(geometry) {
    if (geometry.type === 'Polygon') {
        const filtered = filterPolygonCoordinates(geometry.coordinates);
        if (filtered.length === 0) return null;
        return { ...geometry, coordinates: filtered };
    } else if (geometry.type === 'MultiPolygon') {
        const filtered = geometry.coordinates
            .map(polygon => filterPolygonCoordinates(polygon))
            .filter(polygon => polygon.length > 0);
        
        if (filtered.length === 0) return null;
        return { ...geometry, coordinates: filtered };
    }
    return geometry;
}

// Обработка файлов
const files = [
    'public/data/maps/europe_1920.json',
    'public/data/maps/europe_1938.json'
];

files.forEach(filename => {
    console.log(`Обрабатываем ${filename}...`);
    
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    let removedCount = 0;
    
    data.features = data.features.map(feature => {
        if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
            console.log(`Найден СССР в ${filename}`);
            
            const newGeometry = processGeometry(feature.geometry);
            if (!newGeometry) {
                console.log('Полностью удаляем территорию СССР (была только в Турции)');
                removedCount++;
                return null;
            }
            
            return { ...feature, geometry: newGeometry };
        }
        return feature;
    }).filter(feature => feature !== null);
    
    console.log(`Удалено ${removedCount} проблемных территорий СССР из ${filename}`);
    
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Файл ${filename} обновлен`);
});

console.log('Удаление турецких территорий СССР завершено');