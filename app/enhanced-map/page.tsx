'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Динамический импорт карты для избежания SSR проблем
const SupabaseMap = dynamic(() => import('@/components/SupabaseMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-xl">Загрузка карты...</div>
    </div>
  )
});

export default function EnhancedMapPage() {
  const [selectedYear, setSelectedYear] = useState(1914);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Заголовок */}
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Историческая карта Европы</h1>
            <p className="text-gray-300 text-sm">
              Подробная информация о странах {selectedYear} года
            </p>
          </div>
          
          {/* Селектор года */}
          <div className="flex items-center space-x-3">
            <label htmlFor="year-select" className="text-sm font-medium">
              Год:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value={1914}>1914 н.э.</option>
              {/* Можно добавить другие годы когда они будут доступны */}
            </select>
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="bg-blue-900 text-blue-100 px-4 py-2 text-sm">
        <p>
          💡 <strong>Совет:</strong> Нажмите на любую страну, чтобы увидеть подробную информацию: 
          правителя, столицу, население, площадь, валюту, религию и языки.
        </p>
      </div>

      {/* Карта */}
      <div className="flex-1">
        <SupabaseMap 
          initialYear={selectedYear}
          className="h-full w-full"
        />
      </div>

      {/* Статистика внизу */}
      <div className="bg-gray-800 text-white p-3 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400">Источник данных:</span> Supabase + Historical Basemaps Project
          </div>
          <div>
            <span className="text-gray-400">Всего стран:</span> 26 | 
            <span className="text-gray-400 ml-2">Период:</span> {selectedYear} год н.э.
          </div>
        </div>
      </div>
    </div>
  );
}