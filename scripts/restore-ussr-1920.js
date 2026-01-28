const fs = require('fs');

// Загружаем исходные данные
const worldData = JSON.parse(fs.readFileSync('public/data/historical/world_1920.geojson', 'utf8'));
const europeData = JSON.parse(fs.readFileSync('public/data/maps/europe_1920.json', 'utf8'));

console.log('Ищем СССР в мировых данных 1920 года...');

// Ищем СССР в мировых данных
const ussrFeatures = worldData.features.filter(feature => {
    const name = feature.properties.NAME || feature.properties.name || '';
    return name.includes('Soviet') || name.includes('USSR') || name.includes('Russia');
});

console.log(`Найдено ${ussrFeatures.length} потенциальных территорий СССР:`);
ussrFeatures.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature.properties.NAME || feature.properties.name}`);
});

// Функция для проверки, находится ли точка в Европе
function isInEurope(lon, lat) {
    // Приблизительные границы Европы
    return lat >= 35 && lat <= 75 && lon >= -10 && lon <= 60;
}

// Функция для проверки, находится ли точка в Турции
function isInTurkey(lon, lat) {
    return lat >= 35.8 && lat <= 42.1 && lon >= 25.7 && lon <= 44.8;
}

// Функция для фильтрации координат, исключая Турцию
function filterCoordinatesExcludingTurkey(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return coordinates;
    
    if (typeof coordinates[0] === 'number') {
        // Это одна точка [lon, lat]
        const [lon, lat] = coordinates;
        return isInTurkey(lon, lat) ? null : coordinates;
    }
    
    if (Array.isArray(coordinates[0]) && typeof coordinates[0][0] === 'number') {
        // Это массив точек [[lon, lat], ...]
        const filtered = coordinates.filter(coord => !isInTurkey(coord[0], coord[1]));
        return filtered.length > 3 ? filtered : null; // Минимум 4 точки для валидного полигона
    }
    
    // Это вложенный массив
    const filtered = coordinates.map(item => filterCoordinatesExcludingTurkey(item))
                                .filter(item => item !== null);
    return filtered.length > 0 ? filtered : null;
}

// Создаем новый объект СССР для Европы
if (ussrFeatures.length > 0) {
    // Берем первую найденную территорию СССР
    const ussrFeature = ussrFeatures[0];
    
    // Фильтруем координаты, исключая Турцию
    let filteredGeometry = { ...ussrFeature.geometry };
    
    if (filteredGeometry.type === 'Polygon') {
        const filtered = filterCoordinatesExcludingTurkey(filteredGeometry.coordinates);
        if (filtered) {
            filteredGeometry.coordinates = filtered;
        } else {
            console.log('Не удалось создать валидный полигон после фильтрации');
            process.exit(1);
        }
    } else if (filteredGeometry.type === 'MultiPolygon') {
        const filtered = filteredGeometry.coordinates
            .map(polygon => filterCoordinatesExcludingTurkey(polygon))
            .filter(polygon => polygon !== null);
        
        if (filtered.length > 0) {
            filteredGeometry.coordinates = filtered;
        } else {
            console.log('Не удалось создать валидный мультиполигон после фильтрации');
            process.exit(1);
        }
    }
    
    const newUSSR = {
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
        geometry: filteredGeometry
    };
    
    // Добавляем СССР в европейские данные
    europeData.features.push(newUSSR);
    
    // Сохраняем обновленный файл
    fs.writeFileSync('public/data/maps/europe_1920.json', JSON.stringify(europeData, null, 2));
    
    console.log('✅ СССР восстановлен в файле europe_1920.json (без турецких территорий)');
} else {
    console.log('❌ Не найдены территории СССР в мировых данных 1920 года');
}

console.log('Восстановление СССР 1920 завершено');