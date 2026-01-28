'use client'

import dynamic from 'next/dynamic'

// Динамический импорт карты (Leaflet требует window объект)
const SupabaseMap = dynamic(() => import('@/components/SupabaseMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-xl">Загрузка карты из Supabase...</div>
    </div>
  ),
})

export default function SupabaseDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Исторические карты из Supabase
          </h1>
          <p className="text-gray-600">
            Демонстрация работы с историческими картами, загруженными в базу данных Supabase
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SupabaseMap 
            initialYear={1914}
            className="w-full"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Инструкции по миграции</h2>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li>Установите зависимости: <code className="bg-gray-100 px-2 py-1 rounded">pnpm install</code></li>
              <li>Настройте переменные окружения в файле <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
              <li>Получите Service Role Key из Supabase Dashboard</li>
              <li>Запустите тестовую миграцию: <code className="bg-gray-100 px-2 py-1 rounded">pnpm run test-migration</code></li>
              <li>Запустите полную миграцию: <code className="bg-gray-100 px-2 py-1 rounded">pnpm run migrate-maps</code></li>
            </ol>
            
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Внимание:</strong> Для работы миграции необходимо получить Service Role Key 
                из Supabase Dashboard (Settings → API) и добавить его в переменную окружения 
                <code className="bg-yellow-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}