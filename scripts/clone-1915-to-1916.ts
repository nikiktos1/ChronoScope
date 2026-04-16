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

async function main() {
	console.log("🚀 Клонирование 1915 → 1916 с сохранением WWI-семантики...");

	const { data: p1915, error: p1915Error } = await supabase
		.from("historical_periods")
		.select("id")
		.eq("year", 1915)
		.single();

	if (p1915Error || !p1915) {
		console.error("❌ Период 1915 не найден");
		process.exit(1);
	}

	const { data: period1916, error: periodError } = await supabase
		.from("historical_periods")
		.upsert(
			{
				year: 1916,
				name: "1916: Первая мировая война",
				description:
					"Политическая карта мира на 1916 год, клонированная от 1915 с сохранением WWI-семантики оккупаций",
				data_source: "Клонировано от 1915 (WWI curated)",
				data_source_url: null,
				data_source_description:
					"Базовая карта клонирована от 1915 для сохранения оккупационных сущностей; точечные правки по Euratlas",
			},
			{ onConflict: "year" },
		)
		.select()
		.single();

	if (periodError || !period1916) {
		console.error("❌ Ошибка создания периода 1916:", periodError);
		process.exit(1);
	}

	console.log(`✅ Период 1916 создан (ID: ${period1916.id})`);

	const { data: countries1915, error: countriesError } = await supabase
		.from("countries")
		.select("*")
		.eq("period_id", p1915.id);

	if (countriesError || !countries1915) {
		console.error("❌ Ошибка получения стран 1915");
		process.exit(1);
	}

	console.log(`✅ Получено ${countries1915.length} стран из 1915`);

	const countryMapping = new Map<number, number>();

	for (const country of countries1915) {
		const { data: newCountry, error: insertError } = await supabase
			.from("countries")
			.insert({
				period_id: period1916.id,
				name: country.name,
				name_en: country.name_en,
				ruler: country.ruler,
				capital: country.capital,
				government: country.government,
				color: country.color,
				abbrevn: country.abbrevn,
				subjecto: country.subjecto,
				border_precision: country.border_precision,
				part_of: country.part_of,
				population: country.population,
				area: country.area,
				currency: country.currency,
				religion: country.religion,
				languages: country.languages,
			})
			.select("id")
			.single();

		if (insertError || !newCountry) {
			console.error(`❌ Ошибка клонирования ${country.name}`);
			continue;
		}

		countryMapping.set(country.id, newCountry.id);
	}

	console.log(`✅ Клонировано ${countryMapping.size} стран`);

	const oldCountryIds = Array.from(countryMapping.keys());
	const { data: geometries1915, error: geomError } = await supabase
		.from("country_geometries")
		.select("*")
		.in("country_id", oldCountryIds);

	if (geomError || !geometries1915) {
		console.error("❌ Ошибка получения геометрий 1915");
		process.exit(1);
	}

	console.log(`✅ Получено ${geometries1915.length} геометрий из 1915`);

	let clonedGeometries = 0;

	for (const geom of geometries1915) {
		const newCountryId = countryMapping.get(geom.country_id);
		if (!newCountryId) continue;

		const { error: insertGeomError } = await supabase
			.from("country_geometries")
			.insert({
				country_id: newCountryId,
				geometry_type: geom.geometry_type,
				coordinates: geom.coordinates,
			});

		if (insertGeomError) {
			console.error(`❌ Ошибка клонирования геометрии для ${newCountryId}`);
			continue;
		}

		clonedGeometries += 1;
	}

	console.log(`✅ Клонировано ${clonedGeometries} геометрий`);
	console.log("🏁 Клонирование 1915 → 1916 завершено");
}

main().catch((error) => {
	console.error("❌ Критическая ошибка:", error);
	process.exit(1);
});
