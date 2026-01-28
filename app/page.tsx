'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import TimeSlider from '@/components/TimeSlider';

// Динамический импорт карты из Supabase
const SupabaseMapComponent = dynamic(() => import('@/components/SupabaseMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-white text-xl">Загрузка карты...</div>
    </div>
  ),
});

export default function Home() {
  const [currentYear, setCurrentYear] = useState(1914);
  
  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Заголовок */}
      <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-1">ChronoScope</h1>
        <p className="text-gray-300 text-sm">Интерактивный исторический атлас</p>
      </div>
      
      {/* Карта из Supabase */}
      <SupabaseMapComponent 
        initialYear={currentYear}
        className="h-full w-full"
      />
      
      {/* Тайм-слайдер */}
      <TimeSlider 
        currentYear={currentYear} 
        onYearChange={setCurrentYear}
      />
    </main>
  );
}
