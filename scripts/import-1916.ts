import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error("❌ Ошибка: Не найдены ключи Supabase");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const CSHAPES_1916_URL =
	"https://demo.ldproxy.net/cshapes/collections/boundary/items?f=json&limit=1000";
const SNAPSHOT_DATE = new Date("1916-07-01");

type CShapesFeature = {
	type: "Feature";
	properties: {
		name: string;
		area?: number;
		capname?: string;
		caplong?: number;
		caplat?: number;
		gwsdate?: string;
		gwedate?: string;
		gwcode?: number;
	};
	geometry: {
		type: "Polygon" | "MultiPolygon";
		coordinates: number[][][] | number[][][][];
	} | null;
};

type ExistingCountry = {
	name: string;
	name_en: string | null;
	ruler: string | null;
	capital: string | null;
	government: string | null;
	color: string | null;
	population: number | null;
	area: number | null;
	currency: string | null;
	religion: string | null;
	languages: string | null;
	part_of: string | null;
	abbrevn: string | null;
	subjecto: string | null;
	border_precision: string | null;
};

const countryNameOverrides: Record<
	string,
	Partial<Pick<ExistingCountry, "name" | "name_en" | "capital">>
> = {
	"United States of America": {
		name: "Соединенные Штаты",
		name_en: "United States of America",
		capital: "Вашингтон",
	},
	Canada: {
		name: "Канада",
		name_en: "Canada",
		capital: "Оттава",
	},
	Australia: {
		name: "Австралийский союз",
		name_en: "Commonwealth of Australia",
	},
	"New Zealand": {
		name: "Новая Зеландия",
		name_en: "Dominion of New Zealand",
	},
	"Union of South Africa": {
		name: "Южно-Африканский союз",
		name_en: "Union of South Africa",
	},
	Egypt: {
		name: "Султанат Египет",
		name_en: "Sultanate of Egypt",
		capital: "Каир",
	},
	Persia: {
		name: "Персия",
		name_en: "Persia",
		capital: "Тегеран",
	},
	Switzerland: {
		name: "Швейцария",
		name_en: "Switzerland",
	},
	Romania: {
		name: "Румынское королевство",
		name_en: "Romania",
		capital: "Бухарест",
	},
	Belgium: {
		name: "Бельгийское королевство",
		name_en: "Belgium",
		capital: "Брюссель",
	},
	Greece: {
		name: "Греческое королевство",
		name_en: "Greece",
		capital: "Афины",
	},
	Portugal: {
		name: "Португальская республика",
		name_en: "Portugal",
		capital: "Лиссабон",
	},
	Spain: {
		name: "Испанское королевство",
		name_en: "Spain",
		capital: "Мадрид",
	},
	Denmark: {
		name: "Королевство Дания",
		name_en: "Denmark",
		capital: "Копенгаген",
	},
	Sweden: {
		name: "Королевство Швеция",
		name_en: "Sweden",
		capital: "Стокгольм",
	},
	Norway: {
		name: "Королевство Норвегия",
		name_en: "Norway",
		capital: "Осло",
	},
	Serbia: {
		name: "Королевство Сербия",
		name_en: "Kingdom of Serbia",
		capital: "Белград",
	},
	Montenegro: {
		name: "Черногория",
		name_en: "Montenegro",
		capital: "Цетине",
	},
	Netherlands: {
		name: "Нидерланды",
		name_en: "Netherlands",
		capital: "Амстердам",
	},
	Luxembourg: {
		name: "Люксембург",
		name_en: "Luxembourg",
		capital: "Люксембург",
	},
};

function normalizeName(name: string | null | undefined): string {
	return (name || "")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.replace(/[()]/g, "")
		.trim();
}

async function fetchCShapes1916(): Promise<CShapesFeature[]> {
	const response = await fetch(CSHAPES_1916_URL);
	if (!response.ok) {
		throw new Error(`Не удалось получить CShapes: HTTP ${response.status}`);
	}

	const data = (await response.json()) as {
		features?: CShapesFeature[];
	};

	const features = data.features || [];

	return features.filter((feature) => {
		const start = feature.properties.gwsdate
			? new Date(feature.properties.gwsdate)
			: null;
		const end = feature.properties.gwedate
			? new Date(feature.properties.gwedate)
			: null;

		if (!start || !end || !feature.geometry) return false;
		return start <= SNAPSHOT_DATE && end >= SNAPSHOT_DATE;
	});
}

async function getExisting1915Countries(): Promise<Map<string, ExistingCountry>> {
	const { data: period1915, error: periodError } = await supabase
		.from("historical_periods")
		.select("id")
		.eq("year", 1915)
		.single();

	if (periodError || !period1915) {
		return new Map();
	}

	const { data: countries, error: countriesError } = await supabase
		.from("countries")
		.select(
			"name, name_en, ruler, capital, government, color, population, area, currency, religion, languages, part_of, abbrevn, subjecto, border_precision",
		)
		.eq("period_id", period1915.id);

	if (countriesError || !countries) {
		return new Map();
	}

	const map = new Map<string, ExistingCountry>();
	for (const country of countries as ExistingCountry[]) {
		map.set(normalizeName(country.name), country);
		if (country.name_en) {
			map.set(normalizeName(country.name_en), country);
		}
	}

	return map;
}

async function main() {
	console.log("🚀 Начинаю импорт данных за 1916 год...");
	console.log("Источник: CShapes 2.0");
	console.log("URL: https://icr.ethz.ch/data/cshapes/");
	console.log("Снимок периода: 1916-07-01");

	const existing1915 = await getExisting1915Countries();
	const cshapesFeatures = await fetchCShapes1916();

	console.log(`✅ Получено ${cshapesFeatures.length} объектов CShapes для 1916`);

	const { data: period, error: periodError } = await supabase
		.from("historical_periods")
		.upsert(
			{
				year: 1916,
				name: "1916: Первая мировая война",
				description:
					"Политическая карта мира на 1916 год на основе CShapes 2.0 (срез 1916-07-01)",
				data_source: "CShapes 2.0",
				data_source_url: "https://icr.ethz.ch/data/cshapes/",
				data_source_description:
					"Historical country boundaries snapshot filtered to 1916-07-01; Europe validated against Euratlas references.",
			},
			{ onConflict: "year" },
		)
		.select()
		.single();

	if (periodError || !period) {
		console.error("❌ Ошибка создания периода 1916:", periodError);
		process.exit(1);
	}

	const periodId = period.id;
	console.log(`✅ Период 1916 готов (ID: ${periodId})`);

	const { data: existingPeriodCountries } = await supabase
		.from("countries")
		.select("id")
		.eq("period_id", periodId);

	const existingCountryIds = (existingPeriodCountries || []).map((country) => country.id);

	if (existingCountryIds.length > 0) {
		const { error: deleteGeometriesError } = await supabase
			.from("country_geometries")
			.delete()
			.in("country_id", existingCountryIds);

		if (deleteGeometriesError) {
			console.error("❌ Ошибка очистки старой геометрии 1916:", deleteGeometriesError);
			process.exit(1);
		}
	}

	const { error: deleteCountriesError } = await supabase
		.from("countries")
		.delete()
		.eq("period_id", periodId);

	if (deleteCountriesError) {
		console.error("❌ Ошибка очистки старых стран 1916:", deleteCountriesError);
		process.exit(1);
	}

	let importedCountries = 0;
	let importedGeometries = 0;

	for (const feature of cshapesFeatures) {
		if (!feature.geometry) continue;
		if (
			feature.geometry.type !== "Polygon" &&
			feature.geometry.type !== "MultiPolygon"
		) {
			continue;
		}

		const sourceName = feature.properties.name;
		const existing =
			existing1915.get(normalizeName(sourceName)) ||
			existing1915.get(normalizeName(countryNameOverrides[sourceName]?.name));
		const overrides = countryNameOverrides[sourceName] || {};

		const countryName = overrides.name || existing?.name || sourceName;
		const countryNameEn = overrides.name_en || existing?.name_en || sourceName;
		const capital = overrides.capital || existing?.capital || feature.properties.capname || null;

		const { data: createdCountry, error: countryError } = await supabase
			.from("countries")
			.insert({
				period_id: periodId,
				name: countryName,
				name_en: countryNameEn,
				ruler: existing?.ruler || null,
				capital,
				government: existing?.government || null,
				color: existing?.color || null,
				abbrevn: existing?.abbrevn || null,
				subjecto: existing?.subjecto || null,
				border_precision: existing?.border_precision || null,
				part_of: existing?.part_of || null,
				population: existing?.population || null,
				area: feature.properties.area || existing?.area || null,
				currency: existing?.currency || null,
				religion: existing?.religion || null,
				languages: existing?.languages || null,
			})
			.select("id")
			.single();

		if (countryError || !createdCountry) {
			console.error(`❌ Ошибка создания страны ${countryName}:`, countryError);
			continue;
		}

		importedCountries += 1;

		const { error: geometryError } = await supabase
			.from("country_geometries")
			.insert({
				country_id: createdCountry.id,
				geometry_type: feature.geometry.type,
				coordinates: feature.geometry.coordinates,
			});

		if (geometryError) {
			console.error(`❌ Ошибка геометрии для ${countryName}:`, geometryError);
			continue;
		}

		importedGeometries += 1;
	}

	console.log(`✅ Импортировано стран: ${importedCountries}`);
	console.log(`✅ Импортировано геометрий: ${importedGeometries}`);
	console.log("🏁 Импорт 1916 завершен");
	console.log("Источник данных:");
	console.log("- CShapes 2.0: https://icr.ethz.ch/data/cshapes/");
	console.log("- Верификация Европы: Euratlas (как reference source)");
}

main().catch((error) => {
	console.error("❌ Критическая ошибка импорта 1916:", error);
	process.exit(1);
});
