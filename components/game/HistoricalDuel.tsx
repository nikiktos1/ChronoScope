'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getAvailableYears, getMapForYear } from '@/lib/maps';
import { saveGameResult, getUserBestScore } from '@/lib/game';

const SupabaseMapComponent = dynamic(() => import('@/components/SupabaseMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-800 text-white">Загрузка карты...</div>
});

export default function HistoricalDuel() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    getUserBestScore().then(setBestScore);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameStatus, timeLeft]);

  const startGame = async () => {
    setScore(0);
    setTimeLeft(30);
    setGameStatus('playing');
    nextQuestion();
  };

  const endGame = async () => {
    setGameStatus('finished');
    try {
      await saveGameResult(score);
      const newBest = await getUserBestScore();
      setBestScore(newBest);
    } catch (e) {
      console.error('Ошибка сохранения результата:', e);
    }
  };

  const nextQuestion = async () => {
    setLoading(true);
    const years = await getAvailableYears();
    const randomYear = years[Math.floor(Math.random() * years.length)];
    const mapData = await getMapForYear(randomYear);

    if (mapData && mapData.features.length >= 4) {
      const shuffled = [...mapData.features].sort(() => 0.5 - Math.random());
      const target = shuffled[0];
      const others = shuffled.slice(1, 4).map(f => f.properties.name);

      setCurrentQuestion({
        year: randomYear,
        target: target,
        countryName: target.properties.name
      });

      setOptions([...others, target.properties.name].sort(() => 0.5 - Math.random()));
    }
    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    if (answer === currentQuestion.countryName) {
      setScore(s => s + 10);
      setTimeLeft(t => t + 5); // Добавляем время за верный ответ
    } else {
      setTimeLeft(t => Math.max(0, t - 10)); // Штраф за неверный ответ
    }
    nextQuestion();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Исторический поединок</h1>
          <p className="text-gray-400">Лучший результат: {bestScore}</p>
        </div>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">Выйти</Link>
      </div>

      {gameStatus === 'idle' && (
        <div className="text-center bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-3xl font-bold mb-4">Готовы к битве?</h2>
          <p className="text-gray-400 mb-8 max-w-md">У вас есть 30 секунд, чтобы угадать как можно больше стран. Правильный ответ дает +5 сек, ошибка забирает -10 сек.</p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-xl transition-all transform hover:scale-105"
          >
            В бой!
          </button>
        </div>
      )}

      {gameStatus === 'playing' && (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 relative">
            {currentQuestion && (
              <>
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur p-2 rounded text-sm">
                  Год: <span className="text-yellow-400 font-bold">{currentQuestion.year}</span>
                </div>
                <SupabaseMapComponent
                  initialYear={currentQuestion.year}
                  highlightCountry={currentQuestion.countryName}
                  className="h-full w-full"
                />
              </>
            )}
            {loading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Счет</p>
                <p className="text-3xl font-bold text-green-400">{score}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Время</p>
                <p className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}с
                </p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex-1">
              <h3 className="text-lg font-medium mb-4">Какая страна выделена?</h3>
              <div className="grid gap-3">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={loading}
                    className="w-full p-4 bg-gray-700 hover:bg-blue-600 disabled:opacity-50 text-left rounded-xl transition-colors border border-gray-600"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {gameStatus === 'finished' && (
        <div className="text-center bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <h2 className="text-3xl font-bold mb-2 text-yellow-400">Игра окончена!</h2>
          <p className="text-gray-400 mb-6">Ваш результат: <span className="text-white font-bold">{score}</span></p>
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
            >
              Сыграть еще раз
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
            >
              На главную
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
