import { publicSupabase } from "./public-supabase";
import type { HistoricalPeriod } from "./supabase";

type CountryRow = {
	id: number;
	name: string;
	name_en?: string | null;
	ruler?: string | null;
	capital?: string | null;
	government?: string | null;
	color?: string | null;
	population?: string | number | null;
	area?: string | number | null;
	currency?: string | null;
	religion?: string | null;
	languages?: string | null;
	abbrevn?: string | null;
	subjecto?: string | null;
	border_precision?: number | null;
	part_of?: string | null;
};

type CountryGeometryRow = {
	country_id: number;
	geometry_type: string;
	coordinates: unknown;
};

type PolygonCoordinates = number[][][];
type MultiPolygonCoordinates = number[][][][];

type BBox = {
	minLng: number;
	maxLng: number;
	minLat: number;
	maxLat: number;
};

type Point = [number, number];

type FeatureGeometry = {
	type: "Polygon" | "MultiPolygon";
	coordinates: PolygonCoordinates | MultiPolygonCoordinates;
};

type NormalizedGeometry =
	| {
			geometryType: "Polygon";
			coordinates: PolygonCoordinates;
	  }
	| {
			geometryType: "MultiPolygon";
			coordinates: MultiPolygonCoordinates;
	  };

function formatError(error: unknown) {
	if (!error) return null;

	if (error instanceof Error) {
		return {
			message: error.message,
			name: error.name,
		};
	}

	if (typeof error === "object") {
		const serialized = JSON.parse(JSON.stringify(error));

		if (
			serialized &&
			typeof serialized === "object" &&
			Object.keys(serialized).length > 0
		) {
			return serialized;
		}

		return Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>(
			(acc, key) => {
				acc[key] = (error as Record<string, unknown>)[key];
				return acc;
			},
			{},
		);
	}

	return { message: String(error) };
}

function isPolygonCoordinates(value: unknown): value is PolygonCoordinates {
	return (
		Array.isArray(value) &&
		value.every(
			(ring) =>
				Array.isArray(ring) &&
				ring.every(
					(point) =>
						Array.isArray(point) &&
						point.length >= 2 &&
						typeof point[0] === "number" &&
						Number.isFinite(point[0]) &&
						typeof point[1] === "number" &&
						Number.isFinite(point[1]),
				),
		)
	);
}

function isMultiPolygonCoordinates(
	value: unknown,
): value is MultiPolygonCoordinates {
	return (
		Array.isArray(value) &&
		value.every((polygon) => isPolygonCoordinates(polygon))
	);
}

function normalizeGeometry(
	geometryType: string,
	coordinates: unknown,
): NormalizedGeometry | null {
	if (geometryType === "Polygon") {
		if (isPolygonCoordinates(coordinates)) {
			return { geometryType: "Polygon", coordinates };
		}

		if (isMultiPolygonCoordinates(coordinates) && coordinates.length === 1) {
			return { geometryType: "Polygon", coordinates: coordinates[0] };
		}
	}

	if (geometryType === "MultiPolygon") {
		if (isMultiPolygonCoordinates(coordinates)) {
			return { geometryType: "MultiPolygon", coordinates };
		}

		if (isPolygonCoordinates(coordinates)) {
			return { geometryType: "MultiPolygon", coordinates: [coordinates] };
		}
	}

	return null;
}

function getPolygonBounds(polygon: PolygonCoordinates): BBox | null {
	let minLng = Infinity;
	let maxLng = -Infinity;
	let minLat = Infinity;
	let maxLat = -Infinity;

	for (const ring of polygon) {
		for (const point of ring) {
			const [lng, lat] = point;
			if (lng < minLng) minLng = lng;
			if (lng > maxLng) maxLng = lng;
			if (lat < minLat) minLat = lat;
			if (lat > maxLat) maxLat = lat;
		}
	}

	if (
		minLng === Infinity ||
		maxLng === -Infinity ||
		minLat === Infinity ||
		maxLat === -Infinity
	) {
		return null;
	}

	return { minLng, maxLng, minLat, maxLat };
}

function intersectsBounds(bounds: BBox, clip: BBox) {
	return !(
		bounds.maxLng < clip.minLng ||
		bounds.minLng > clip.maxLng ||
		bounds.maxLat < clip.minLat ||
		bounds.minLat > clip.maxLat
	);
}

function pointsEqual(a: Point, b: Point) {
	return a[0] === b[0] && a[1] === b[1];
}

function closeRing(ring: Point[]) {
	if (ring.length === 0) return ring;
	const first = ring[0];
	const last = ring[ring.length - 1];
	if (!pointsEqual(first, last)) {
		return [...ring, first];
	}
	return ring;
}

function clipRingAgainstVertical(
	ring: Point[],
	bound: number,
	keepGreater: boolean,
) {
	const result: Point[] = [];
	if (ring.length === 0) return result;

	for (let index = 0; index < ring.length; index++) {
		const current = ring[index];
		const previous = ring[(index + ring.length - 1) % ring.length];
		const currentInside = keepGreater
			? current[0] >= bound
			: current[0] <= bound;
		const previousInside = keepGreater
			? previous[0] >= bound
			: previous[0] <= bound;

		if (currentInside !== previousInside && current[0] !== previous[0]) {
			const ratio = (bound - previous[0]) / (current[0] - previous[0]);
			const intersection: Point = [
				bound,
				previous[1] + ratio * (current[1] - previous[1]),
			];
			result.push(intersection);
		}

		if (currentInside) {
			result.push(current);
		}
	}

	return result;
}

function clipRingAgainstHorizontal(
	ring: Point[],
	bound: number,
	keepGreater: boolean,
) {
	const result: Point[] = [];
	if (ring.length === 0) return result;

	for (let index = 0; index < ring.length; index++) {
		const current = ring[index];
		const previous = ring[(index + ring.length - 1) % ring.length];
		const currentInside = keepGreater
			? current[1] >= bound
			: current[1] <= bound;
		const previousInside = keepGreater
			? previous[1] >= bound
			: previous[1] <= bound;

		if (currentInside !== previousInside && current[1] !== previous[1]) {
			const ratio = (bound - previous[1]) / (current[1] - previous[1]);
			const intersection: Point = [
				previous[0] + ratio * (current[0] - previous[0]),
				bound,
			];
			result.push(intersection);
		}

		if (currentInside) {
			result.push(current);
		}
	}

	return result;
}

function clipRingToBounds(ring: Point[], bounds: BBox) {
	const openRing = ring.slice(0, -1);
	let clipped = openRing;

	clipped = clipRingAgainstVertical(clipped, bounds.minLng, true);
	clipped = clipRingAgainstVertical(clipped, bounds.maxLng, false);
	clipped = clipRingAgainstHorizontal(clipped, bounds.minLat, true);
	clipped = clipRingAgainstHorizontal(clipped, bounds.maxLat, false);

	if (clipped.length < 3) {
		return null;
	}

	const closed = closeRing(clipped);
	return closed.length >= 4 ? closed : null;
}

function clipPolygonToBounds(polygon: PolygonCoordinates, bounds: BBox) {
	const clippedRings = polygon
		.map((ring) => clipRingToBounds(ring as Point[], bounds))
		.filter((ring): ring is Point[] => Boolean(ring));

	if (clippedRings.length === 0) {
		return null;
	}

	return clippedRings as PolygonCoordinates;
}

function dedupePolygons(polygons: PolygonCoordinates[]) {
	return [
		...new Map(
			polygons.map((polygon) => [JSON.stringify(polygon), polygon]),
		).values(),
	];
}

function filterEuropeanEmpirePolygons(
	year: number,
	country: CountryRow,
	polygons: PolygonCoordinates[],
) {
	if (polygons.length === 0 || ![1914, 1915].includes(year)) {
		return dedupePolygons(polygons);
	}

	const countryName = country.name_en || country.name;
	const britishIslesBounds: BBox = {
		minLng: -12,
		maxLng: 3,
		minLat: 49,
		maxLat: 61,
	};

	if (
		countryName === "British Empire" ||
		countryName === "United Kingdom of Great Britain and Ireland" ||
		country.name === "Британская империя"
	) {
		const filtered = polygons
			.filter((polygon) => {
				const bounds = getPolygonBounds(polygon);
				return bounds ? intersectsBounds(bounds, britishIslesBounds) : false;
			})
			.map((polygon) => clipPolygonToBounds(polygon, britishIslesBounds))
			.filter((polygon): polygon is PolygonCoordinates => Boolean(polygon));

		return dedupePolygons(filtered.length > 0 ? filtered : polygons);
	}

	return dedupePolygons(polygons);
}

async function getReplacementBritishGeometryFor1914() {
	const { data: period1915, error: periodError } = await publicSupabase
		.from("historical_periods")
		.select("id")
		.eq("year", 1915)
		.maybeSingle();

	if (periodError || !period1915) {
		console.warn("Не удалось получить период 1915 для подмены Британии");
		return null;
	}

	const { data: britain1915, error: countryError } = await publicSupabase
		.from("countries")
		.select("id")
		.eq("period_id", period1915.id)
		.eq("name", "Британская империя")
		.maybeSingle();

	if (countryError || !britain1915) {
		console.warn("Не удалось найти Британию 1915 для подмены 1914");
		return null;
	}

	const { data: geometries, error: geometriesError } = await publicSupabase
		.from("country_geometries")
		.select("geometry_type, coordinates")
		.eq("country_id", britain1915.id);

	if (geometriesError || !geometries || geometries.length === 0) {
		console.warn(
			"Не удалось получить геометрию Британии 1915 для подмены 1914",
		);
		return null;
	}

	const allCoords: PolygonCoordinates[] = [];
	for (const geometry of geometries) {
		const normalizedGeometry = normalizeGeometry(
			geometry.geometry_type,
			geometry.coordinates,
		);

		if (!normalizedGeometry) {
			continue;
		}

		if (normalizedGeometry.geometryType === "Polygon") {
			allCoords.push(normalizedGeometry.coordinates);
			continue;
		}

		normalizedGeometry.coordinates.forEach((polygon) => {
			allCoords.push(polygon);
		});
	}

	const filtered = filterEuropeanEmpirePolygons(
		1915,
		{ id: -1, name: "Британская империя", name_en: "British Empire" },
		allCoords,
	);

	if (filtered.length === 0) {
		return null;
	}

	return {
		type: filtered.length === 1 ? "Polygon" : "MultiPolygon",
		coordinates: filtered.length === 1 ? filtered[0] : filtered,
	} as FeatureGeometry;
}

// Получить все доступные периоды
export async function getHistoricalPeriods(): Promise<HistoricalPeriod[]> {
	const { data, error } = await publicSupabase
		.from("historical_periods")
		.select("*")
		.order("year", { ascending: true });

	if (error) {
		console.error("Ошибка получения периодов:", formatError(error));
		return [];
	}

	return data || [];
}

// Получить карту для конкретного года
export async function getMapForYear(year: number) {
	console.log("Запрос карты для года:", year);

	// Проверяем подключение к Supabase
	if (!publicSupabase) {
		console.error("Supabase клиент не инициализирован");
		return null;
	}

	// Получаем период
	const { data: period, error: periodError } = await publicSupabase
		.from("historical_periods")
		.select("id")
		.eq("year", year)
		.maybeSingle();

	if (periodError || !period) {
		console.warn("Период не найден:", {  // Изменяем уровень логирования с error на warn
			year: year,
			error: formatError(periodError),
			message: periodError?.message || "Неизвестная ошибка",
			details: periodError?.details || "Детали недоступны",
			hint: periodError?.hint || "Подсказка недоступна",
			code: periodError?.code || "Код ошибки недоступен",
		});
		return {
			type: "FeatureCollection",
			features: [], // Возвращаем пустую коллекцию вместо null
		};
	}

	console.log("Найден период:", period);

	// Загружаем страны и геометрии отдельными запросами.
	// Так карта не зависит от стабильности PostgREST embed-связей.
	const { data: countries, error: countriesError } = await publicSupabase
		.from("countries")
		.select(
			"id, name, name_en, ruler, capital, government, color, population, area, currency, religion, languages, abbrevn, subjecto, border_precision, part_of",
		)
		.eq("period_id", period.id);

	if (countriesError) {
		console.error("Ошибка получения стран:", {
			error: formatError(countriesError),
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

	const countryIds = countries.map((country) => country.id);
	const { data: geometries, error: geometriesError } = await publicSupabase
		.from("country_geometries")
		.select("country_id, geometry_type, coordinates")
		.in("country_id", countryIds);

	if (geometriesError) {
		console.error("Ошибка получения геометрий стран:", {
			error: formatError(geometriesError),
			message: geometriesError?.message || "Неизвестная ошибка",
			details: geometriesError?.details || "Детали недоступны",
			hint: geometriesError?.hint || "Подсказка недоступна",
			code: geometriesError?.code || "Код ошибки недоступен",
			periodId: period.id,
			year,
		});
		return null;
	}

	const geometriesByCountryId = new Map<number, CountryGeometryRow[]>();
	const replacementBritishGeometryFor1914 =
		year === 1914 ? await getReplacementBritishGeometryFor1914() : null;

	for (const geometry of geometries ?? []) {
		const countryGeometries =
			geometriesByCountryId.get(geometry.country_id) ?? [];
		countryGeometries.push(geometry);
		geometriesByCountryId.set(geometry.country_id, countryGeometries);
	}

	// Преобразуем в формат GeoJSON - объединяем все геометрии каждой страны
	const features: GeoJSON.Feature[] = [];

	(countries as CountryRow[]).forEach((country) => {
		// Проверяем наличие геометрий
		const geometries = geometriesByCountryId.get(country.id);
		if (!geometries || geometries.length === 0) {
			console.warn(`Отсутствует геометрия для страны: ${country.name}`);
			return;
		}

		// Собираем все координаты
		const allCoords: number[][][][] = [];

		geometries.forEach((geometry) => {
			if (!geometry.coordinates) {
				console.warn(
					`Отсутствуют координаты для геометрии страны: ${country.name}`,
				);
				return;
			}

			const normalizedGeometry = normalizeGeometry(
				geometry.geometry_type,
				geometry.coordinates,
			);

			if (!normalizedGeometry) {
				console.warn(
					"Пропущена геометрия с некорректной структурой координат:",
					{
						country: country.name,
						countryId: country.id,
						geometryType: geometry.geometry_type,
					},
				);
				return;
			}

			if (normalizedGeometry.geometryType === "Polygon") {
				allCoords.push(normalizedGeometry.coordinates);
				return;
			}

			normalizedGeometry.coordinates.forEach((poly) => {
				allCoords.push(poly);
			});
		});

		if (allCoords.length === 0) return;

		const displayCoords = filterEuropeanEmpirePolygons(
			year,
			country,
			allCoords,
		);
		if (displayCoords.length === 0) return;

		// Определяем тип геометрии
		const geometryType =
			displayCoords.length === 1 ? "Polygon" : "MultiPolygon";

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
				coordinates:
					geometryType === "Polygon" ? displayCoords[0] : displayCoords,
			},
		} as unknown as GeoJSON.Feature);
	});

	if (year === 1914 && replacementBritishGeometryFor1914) {
		const featureIndex = features.findIndex((feature) => {
			const name = feature.properties?.name;
			const englishName = feature.properties?.name_en;
			return (
				name === "United Kingdom of Great Britain and Ireland" ||
				englishName === "United Kingdom of Great Britain and Ireland"
			);
		});

		if (featureIndex !== -1) {
			features[featureIndex] = {
				...features[featureIndex],
				geometry: replacementBritishGeometryFor1914,
			};
		}
	}

	return {
		type: "FeatureCollection",
		features,
	};
}

// Получить список доступных лет
export async function getAvailableYears(): Promise<number[]> {
	const { data, error } = await publicSupabase
		.from("historical_periods")
		.select("year")
		.order("year", { ascending: true });

	if (error) {
		console.error("Ошибка получения годов:", formatError(error));
		return [];
	}

	return data?.map((p) => p.year) || [];
}

// Тестирование подключения к Supabase
export async function testSupabaseConnection(): Promise<boolean> {
	try {
		const { error } = await publicSupabase
			.from("historical_periods")
			.select("count")
			.limit(1);

		if (error) {
			console.error("Ошибка подключения к Supabase:", formatError(error));
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
	let queryBuilder = publicSupabase
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
		console.error("Ошибка поиска стран:", formatError(error));
		return [];
	}

	return data || [];
}
