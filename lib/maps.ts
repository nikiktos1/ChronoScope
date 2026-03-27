import type { HistoricalPeriod } from "./supabase";
import { supabase } from "./supabase";

// Получить все доступные периоды
export async function getHistoricalPeriods(): Promise<HistoricalPeriod[]> {
	const { data, error } = await supabase
		.from("historical_periods")
		.select("*")
		.order("year", { ascending: true });

	if (error) {
		console.error("Ошибка получения периодов:", error);
		return [];
	}

	return data || [];
}

// Получить карту для конкретного года
export async function getMapForYear(year: number) {
	console.log("Запрос карты для года:", year);

	// Проверяем подключение к Supabase
	if (!supabase) {
		console.error("Supabase клиент не инициализирован");
		return null;
	}

	// Получаем период
	const { data: period, error: periodError } = await supabase
		.from("historical_periods")
		.select("id")
		.eq("year", year)
		.single();

	if (periodError || !period) {
		console.error("Период не найден:", {
			year: year,
			error: periodError,
			message: periodError?.message || "Неизвестная ошибка",
			details: periodError?.details || "Детали недоступны",
			hint: periodError?.hint || "Подсказка недоступна",
			code: periodError?.code || "Код ошибки недоступен",
		});
		return null;
	}

	console.log("Найден период:", period);

	// Получаем страны с их геометрией
	const { data: countries, error: countriesError } = await supabase
		.from("countries")
		.select(`
      *,
      country_geometries (*)
    `)
		.eq("period_id", period.id);

	if (countriesError) {
		console.error("Ошибка получения стран:", {
			error: countriesError,
			message: countriesError?.message || "Неизвестная ошибка",
			details: countriesError?.details || "Детали недоступны",
			hint: countriesError?.hint || "Подсказка недоступна",
			code: countriesError?.code || "Код ошибки недоступен",
			periodId: period.id,
			year: year,
		});
		return null;
	}

	console.log("Получено стран:", countries?.length || 0);

	// Проверяем, что получили данные
	if (!countries || countries.length === 0) {
		console.warn("Не найдено стран для периода:", {
			periodId: period.id,
			year: year,
		});
		return {
			type: "FeatureCollection",
			features: [],
		};
	}

	// Преобразуем в формат GeoJSON - объединяем все геометрии каждой страны
	const features: GeoJSON.Feature[] = [];

	countries?.forEach((country) => {
		// Проверяем наличие геометрий
		const geometries = country.country_geometries;
		if (!geometries || geometries.length === 0) {
			console.warn(`Отсутствует геометрия для страны: ${country.name}`);
			return;
		}

		// Собираем все координаты
		const allCoords: number[][][][] = [];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		geometries.forEach((geometry: any) => {
			if (!geometry.coordinates) {
				console.warn(
					`Отсутствуют координаты для геометрии страны: ${country.name}`,
				);
				return;
			}

			const coords = geometry.coordinates;
			if (geometry.geometry_type === "Polygon") {
				allCoords.push(coords);
			} else if (geometry.geometry_type === "MultiPolygon") {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				coords.forEach((poly: any) => {
					allCoords.push(poly);
				});
			}
		});

		if (allCoords.length === 0) return;

		// Определяем тип геометрии
		const geometryType = allCoords.length === 1 ? "Polygon" : "MultiPolygon";

		features.push({
			type: "Feature",
			properties: {
				name: country.name,
				name_en: country.name_en,
				ruler: country.ruler,
				capital: country.capital,
				government: country.government,
				color: country.color,
				population: country.population,
				area: country.area,
				currency: country.currency,
				religion: country.religion,
				languages: country.languages,
				ABBREVN: country.abbrevn,
				SUBJECTO: country.subjecto,
				BORDERPRECISION: country.border_precision,
				PARTOF: country.part_of,
				part_of: country.part_of,
			},
			geometry: {
				type: geometryType as "Polygon" | "MultiPolygon",
				coordinates: geometryType === "Polygon" ? allCoords[0] : allCoords,
			},
		} as unknown as GeoJSON.Feature);
	});

	return {
		type: "FeatureCollection",
		features,
	};
}

// Получить список доступных лет
export async function getAvailableYears(): Promise<number[]> {
	const { data, error } = await supabase
		.from("historical_periods")
		.select("year")
		.order("year", { ascending: true });

	if (error) {
		console.error("Ошибка получения годов:", error);
		return [];
	}

	return data?.map((p) => p.year) || [];
}

// Тестирование подключения к Supabase
export async function testSupabaseConnection(): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("historical_periods")
			.select("count")
			.limit(1);

		if (error) {
			console.error("Ошибка подключения к Supabase:", error);
			return false;
		}

		console.log("Подключение к Supabase успешно");
		return true;
	} catch (err) {
		console.error("Критическая ошибка подключения к Supabase:", err);
		return false;
	}
}

// Поиск стран по названию
export async function searchCountries(query: string, year?: number) {
	let queryBuilder = supabase
		.from("countries")
		.select(`
      *,
      historical_periods!inner(year),
      country_geometries (*)
    `)
		.or(`name.ilike.%${query}%,name_en.ilike.%${query}%`);

	if (year) {
		queryBuilder = queryBuilder.eq("historical_periods.year", year);
	}

	const { data, error } = await queryBuilder;

	if (error) {
		console.error("Ошибка поиска стран:", error);
		return [];
	}

	return data || [];
}
