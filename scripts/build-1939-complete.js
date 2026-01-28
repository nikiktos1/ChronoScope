const fs = require('fs');

console.log('🗺️  Полная сборка карты 1939 года...\n');

// Шаг 1: Создаем базу из 1938
console.log('Шаг 1: Базовая карта из 1938');
require('./create-1939.js');

// Шаг 2: Добавляем Словакию
console.log('\nШаг 2: Добавление Словакии');
require('./add-slovakia-1939.js');

// Шаг 3: Разделяем Польшу и добавляем к Германии/СССР
console.log('\nШаг 3: Разделение Польши');
require('./split-poland-real.js');

console.log('\n✅ Карта 1939 полностью готова!');
