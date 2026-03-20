import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthError {
  message: string;
}

// Регистрация нового пользователя
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Вход пользователя
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Выход пользователя
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Получение текущего пользователя
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Проверка сессии
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
