'use client';

import { useState, useEffect } from 'react';

interface Period {
  year: number;
  name: string;
  file: string;
}

const periods: Period[] = [
  { year: -323, name: 'Империя Александра', file: 'bc323' },
  { year: 100, name: 'Римская империя', file: '100' },
  { year: 800, name: 'Империя Карла Великого', file: '800' },
  { year: 1492, name: 'Открытие Америки', file: '1492' },
  { year: 1815, name: 'Венский конгресс', file: '1815' },
  { year: 1880, name: 'Колониальные империи', file: '1880' },
  { year: 1900, name: 'Belle Époque', file: '1900' },
  { year: 1914, name: 'Первая мировая', file: '1914' },
  { year: 1915, name: 'Великая война — 1915', file: '1915' },
  { year: 1920, name: 'Версальский мир', file: '1920' },
  { year: 1938, name: 'Накануне войны', file: '1938' },
  { year: 1945, name: 'Конец войны', file: '1945' },
  { year: 2000, name: 'Современность', file: '2000' }
];

interface TimeSliderProps {
  onYearChange: (year: number) => void;
  currentYear: number;
}

export default function TimeSlider({ onYearChange, currentYear }: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const currentIndex = periods.findIndex(p => p.year === currentYear);
  const currentPeriod = periods[currentIndex];
  
  // Автоплей
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < periods.length) {
        onYearChange(periods[nextIndex].year);
      } else {
        setIsPlaying(false); // Останавливаем в конце
      }
    }, 3000); // 3 секунды на период
    
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, onYearChange]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onYearChange(periods[index].year);
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onYearChange(periods[currentIndex - 1].year);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < periods.length - 1) {
      onYearChange(periods[currentIndex + 1].year);
    }
  };
  
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-4xl">
      <div className="bg-black/90 backdrop-blur-md rounded-2xl border border-gray-700 p-6 shadow-2xl">
        {/* Информация о периоде */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white mb-1">
            {currentPeriod.year > 0 ? currentPeriod.year : `${Math.abs(currentPeriod.year)} до н.э.`}
          </div>
          <div className="text-gray-400 text-sm">{currentPeriod.name}</div>
        </div>
        
        {/* Слайдер */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={periods.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          
          {/* Маркеры периодов */}
          <div className="flex justify-between mt-2 px-1">
            {periods.map((period, index) => (
              <div
                key={period.year}
                className={`text-xs ${
                  index === currentIndex ? 'text-blue-400 font-bold' : 'text-gray-500'
                }`}
                style={{ width: `${100 / periods.length}%`, textAlign: 'center' }}
              >
                {period.year > 0 ? period.year : `${Math.abs(period.year)} до н.э.`}
              </div>
            ))}
          </div>
        </div>
        
        {/* Кнопки управления */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            ← Назад
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold"
          >
            {isPlaying ? '⏸ Пауза' : '▶ Играть'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex === periods.length - 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}
