import { publicSupabase } from "./public-supabase";

function formatError(error: unknown) {
	if (!error) return null;

	if (error instanceof Error) {
		return {
			message: error.message,
			name: error.name,
		};
	}

	if (typeof error === "object") {
		return JSON.parse(JSON.stringify(error));
	}

	return { message: String(error) };
}

export async function runDiagnostics() {
	console.log("=== ДИАГНОСТИКА SUPABASE ===");

	// Проверяем переменные окружения
	console.log("1. Переменные окружения:");
	console.log(
		"   NEXT_PUBLIC_SUPABASE_URL:",
		!!process.env.NEXT_PUBLIC_SUPABASE_URL,
	);
	console.log(
		"   NEXT_PUBLIC_SUPABASE_ANON_KEY:",
		!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);

	// Проверяем подключение
	console.log("2. Тестирование подключения...");
	try {
		const { data, error } = await publicSupabase
			.from("historical_periods")
			.select("id, year")
			.limit(1);

		if (error) {
			console.error("   Ошибка подключения:", formatError(error));
			return false;
		}

		console.log("   Подключение успешно, получена запись:", data);
	} catch (err) {
		console.error("   Критическая ошибка:", err);
		return false;
	}

	// Проверяем доступные периоды
	console.log("3. Проверка доступных периодов...");
	try {
		const { data: periods, error } = await publicSupabase
			.from("historical_periods")
			.select("year")
			.order("year");

		if (error) {
			console.error("   Ошибка получения периодов:", formatError(error));
			return false;
		}

		console.log(
			"   Доступные года:",
			periods?.map((p) => p.year),
		);
	} catch (err) {
		console.error("   Ошибка при получении периодов:", err);
		return false;
	}

	// Проверяем конкретный год (1914)
	console.log("4. Проверка данных для 1914 года...");
	try {
		const { data: period, error: periodError } = await publicSupabase
			.from("historical_periods")
			.select("id")
			.eq("year", 1914)
			.maybeSingle();

		if (periodError || !period) {
			console.error("   Период 1914 не найден:", formatError(periodError));
			return false;
		}

		console.log("   Период 1914 найден, ID:", period.id);

		// Проверяем страны для этого периода
		const { data: countries, error: countriesError } = await publicSupabase
			.from("countries")
			.select("id, name")
			.eq("period_id", period.id)
			.limit(5);

		if (countriesError) {
			console.error("   Ошибка получения стран:", formatError(countriesError));
			return false;
		}

		console.log("   Найдено стран:", countries?.length);
		console.log(
			"   Примеры стран:",
			countries?.map((c) => c.name),
		);
	} catch (err) {
		console.error("   Ошибка при проверке 1914 года:", err);
		return false;
	}

	console.log("=== ДИАГНОСТИКА ЗАВЕРШЕНА УСПЕШНО ===");
	return true;
}
