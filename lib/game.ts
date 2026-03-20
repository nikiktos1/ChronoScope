import { supabase } from './supabase';

export interface GameResult {
  score: number;
  played_at?: string;
}

export async function saveGameResult(score: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Пользователь не авторизован');

  const { error } = await supabase
    .from('game_results')
    .insert({
      user_id: user.id,
      score: score
    });

  if (error) throw error;
}

export async function getUserBestScore() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('game_results')
    .select('score')
    .eq('user_id', user.id)
    .order('score', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 0;
  return data[0].score;
}
