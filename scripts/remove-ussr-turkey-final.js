const fs = require('fs');

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    // Приблизительные границы Турции
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для проверки, находится ли полигон полностью в Турции
function isPolygonInTurkey(ring) {
    return ring.every(coord => isInTurkey(coord[0], coord[1]));
}

// Функция для фильтрации точек полигона, удаляя те, что в Турции
function filterRingCoordinates(ring) {
    // Если весь полигон в Турции, возвращаем null
    if (isPolygonInTurkey(ring)) {
        return null;
    }
    
    // Если полигон частично в Турции, попробуем удалить проблемные точки
    // Но это сложно для сохранения валидной геометрии, поэтому пока оставим как есть
    // В будущем можно добавить более сложную логику обрезки
    return ring;
}

// Обработка файлов
const files = [
    { file: 'public/data/maps/europe_1920.json', problematicPolygons: [0, 1] },
    { file: 'public/data/maps/europe_1938.json', problematicPolygons: [3] } // Полигон 0 оставляем, так как это основная территория
];

files.forEach(({ file: filename, problematicPolygons }) => {
    console.log(`\n=== Обрабатываем ${filename} ===`);
    
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    let modified = false;
    
    data.features = data.features.map(feature => {
        if (feature.properties.name === 'СССР' || feature.properties.originalName === 'USSR') {
            console.log(`Найден СССР, обрабатываем...`);
            
            const newCoordinates = [];
            
            feature.geometry.coordinates.forEach((polygon, index) => {
                if (problematicPolygons.includes(index)) {
                    console.log(`Удаляем проблемный полигон ${index} (находится в Турции)`);
                    modified = true;
                } else {
                    // Проверяем каждое кольцо в полигоне
                    const filteredPolygon = polygon.map(ring => filterRingCoordinates(ring))
                                                  .filter(ring => ring !== null);
                    
                    if (filteredPolygon.length > 0) {
                        newCoordinates.push(filteredPolygon);
                    }
                }
            });
            
            if (newCoordinates.length === 0) {
                console.log('Все полигоны СССР были в Турции, удаляем весь объект');
                return null;
            }
            
            return {
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: newCoordinates
                }
            };
        }
        return feature;
    }).filter(feature => feature !== null);
    
    if (modified) {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`✅ Файл ${filename} обновлен - удалены турецкие территории СССР`);
    } else {
        console.log(`ℹ️  Файл ${filename} не изменен`);
    }
});

console.log('\n🎉 Удаление турецких территорий СССР завершено!');