# Система авторизации ChronoScope

## Обзор

Система авторизации построена на базе Supabase Auth и включает полный набор компонентов для регистрации, входа и управления пользователями.

## Компоненты

### AuthProvider
Контекст React для управления состоянием аутентификации во всем приложении.

**Использование:**
```tsx
import { useAuth } from '@/components/auth/AuthProvider';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Загрузка...</div>;
  if (!user) return <div>Не авторизован</div>;
  
  return <div>Привет, {user.email}</div>;
}
```

### LoginForm
Форма входа с валидацией и обработкой ошибок.

### RegisterForm
Форма регистрации с подтверждением пароля и валидацией.

### UserMenu
Выпадающее меню пользователя с информацией об аккаунте и кнопкой выхода.

### ProtectedRoute
HOC для защиты маршрутов от неавторизованных пользователей.

## Маршруты

- `/auth/login` - Страница входа
- `/auth/register` - Страница регистрации

## Middleware

Middleware автоматически защищает следующие маршруты:
- `/` - Главная страница
- `/enhanced-map` - Подробная карта

Неавторизованные пользователи перенаправляются на `/auth/login`.

## Настройка

Убедитесь, что в `.env.local` указаны переменные Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Функции (lib/auth.ts)

- `signUp(email, password)` - Регистрация нового пользователя
- `signIn(email, password)` - Вход пользователя
- `signOut()` - Выход пользователя
- `getCurrentUser()` - Получение текущего пользователя
- `getSession()` - Получение текущей сессии

## Безопасность

- Пароли должны содержать минимум 6 символов
- Все защищенные маршруты требуют активной сессии
- Middleware проверяет авторизацию на серверной стороне
- AuthProvider синхронизирует состояние аутентификации в реальном времени
