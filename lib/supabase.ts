import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Отсутствуют переменные окружения Supabase:", {
		url: !!supabaseUrl,
		key: !!supabaseAnonKey,
	});
	throw new Error("Отсутствуют переменные окружения Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
export interface HistoricalPeriod {
	id: number;
	year: number;
	name?: string;
	description?: string;
	created_at: string;
	updated_at: string;
}

export interface Country {
	id: number;
	period_id: number;
	name: string;
	name_en?: string;
	ruler?: string;
	capital?: string;
	government?: string;
	color?: string;
	abbrevn?: string;
	subjecto?: string;
	border_precision?: number;
	part_of?: string;
	created_at: string;
	updated_at: string;
}

export interface CountryGeometry {
	id: number;
	country_id: number;
	geometry_type: string;
	coordinates: unknown;
	created_at: string;
}
