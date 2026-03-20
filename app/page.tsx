'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import TimeSlider from '@/components/TimeSlider';
import UserMenu from '@/components/auth/UserMenu';
import AIHistoryGenerator from '@/components/AIHistoryGenerator';

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
  const [altHistoryEssay, setAltHistoryEssay] = useState<string | null>(null);
  const [altMapData, setAltMapData] = useState<any | null>(null);

  const handleAltHistoryResult = (essay: string, mapData: any | null) => {
    setAltHistoryEssay(essay);
    setAltMapData(mapData);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-900 relative">
      {/* Заголовок */}
      <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-1">ChronoScope</h1>
        <p className="text-gray-300 text-sm">Интерактивный исторический атлас</p>

        {/* ИИ Генератор */}
        <AIHistoryGenerator onResult={handleAltHistoryResult} currentYear={currentYear} />

        {/* Ссылка на обогащенную карту */}
        <div className="mt-3 pt-3 border-t border-gray-600">
          <a
            href="/enhanced-map"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            📊 Подробная карта 1914 года
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Окно с эссе */}
      {altHistoryEssay && (
        <div className="absolute bottom-32 right-4 z-[1000] w-96 bg-black/90 backdrop-blur-md p-6 rounded-xl border border-blue-500/50 shadow-2xl max-h-[60vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-blue-400">Последствия</h3>
            <button
              onClick={() => { setAltHistoryEssay(null); setAltMapData(null); }}
              className="text-gray-400 hover:text-white"
            >✕</button>
          </div>
          <div className="text-gray-200 text-sm leading-relaxed space-y-4 whitespace-pre-line">
            {altHistoryEssay}
          </div>
        </div>
      )}

      {/* Меню пользователя */}
      <div className="absolute top-4 right-4 z-[1000]">
        <UserMenu />
      </div>

      {/* Карта из Supabase */}
      <SupabaseMapComponent
        initialYear={currentYear}
        className="h-full w-full"
        alternativeData={altMapData}
      />
      
      {/* Тайм-слайдер */}
      <TimeSlider 
        currentYear={currentYear} 
        onYearChange={setCurrentYear}
      />
    </main>
  );
}
