"use client";

import type { Feature, FeatureCollection } from "geojson";
import type L from "leaflet";
import { useEffect, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import { runDiagnostics } from "@/lib/diagnostics";
import {
	getAvailableYears,
	getMapForYear,
	testSupabaseConnection,
} from "@/lib/maps";
import "leaflet/dist/leaflet.css";

// Компонент для установки вида карты
function SetViewOnLoad() {
	const map = useMap();

	useEffect(() => {
		map.setView([50, 15], 5);
	}, [map]);

	return null;
}

interface SupabaseMapProps {
	initialYear?: number;
	className?: string;
	alternativeData?: FeatureCollection | null;
}

export default function SupabaseMap({
	initialYear = 1914,
	className = "",
	alternativeData = null,
}: SupabaseMapProps) {
	const [mapData, setMapData] = useState<FeatureCollection | null>(null);
	const [, setAvailableYears] = useState<number[]>([]);
	const [currentYear, setCurrentYear] = useState(initialYear);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Обновляем текущий год при изменении initialYear
	useEffect(() => {
		setCurrentYear(initialYear);
	}, [initialYear]);

	// Загрузка доступных лет
	useEffect(() => {
		async function loadYears() {
			try {
				// Запускаем диагностику для отладки
				console.log("Запуск диагностики Supabase...");
				await runDiagnostics();

				// Сначала проверяем подключение
				const isConnected = await testSupabaseConnection();
				if (!isConnected) {
					setError("Не удалось подключиться к базе данных");
					return;
				}

				const years = await getAvailableYears();
				setAvailableYears(years);
			} catch (err) {
				console.error("Ошибка загрузки лет:", err);
				setError("Не удалось загрузить список лет");
			}
		}
		loadYears();
	}, []);

	// Загрузка карты для текущего года
	useEffect(() => {
		async function loadMap() {
			setLoading(true);
			setError(null);

			try {
				const data = await getMapForYear(currentYear);
				if (data) {
					setMapData(data as FeatureCollection);
				} else {
					setError(`Карта для ${currentYear} года не найдена`);
				}
			} catch (err) {
				console.error("Ошибка загрузки карты:", err);
				setError("Не удалось загрузить карту");
			} finally {
				setLoading(false);
			}
		}

		loadMap();
	}, [currentYear]);

	// Стиль для стран с учетом порядка отображения
	const countryStyle = (feature?: Feature) => {
		// Генерируем цвет на основе названия страны для консистентности
		const name =
			feature?.properties?.name || feature?.properties?.name_en || "";
		const hash = name.split("").reduce((a: number, b: string) => {
			a = (a << 5) - a + b.charCodeAt(0);
			return a & a;
		}, 0);

		const hue = Math.abs(hash) % 360;
		const color = `hsl(${hue}, 70%, 50%)`;

		// Римская империя должна быть под другими государствами
		const isRomanEmpire = name === "Римская империя" || name === "Roman Empire";

		return {
			fillColor: color,
			weight: isRomanEmpire ? 1 : 2, // Мелкие государства с более толстой границей
			opacity: isRomanEmpire ? 0.6 : 1.0, // Мелкие государства более контрастные
			color: isRomanEmpire ? "#ffffff" : "#000000", // Черная граница для мелких государств
			fillOpacity: isRomanEmpire ? 0.3 : 0.8, // Римская империя очень прозрачная, мелкие - яркие
			zIndex: isRomanEmpire ? 10 : 100, // Римская империя ниже других
		};
	};

	// Форматирование населения в компактный вид
	const formatPopulation = (pop: string | number | undefined): string => {
		if (!pop) return "";
		const numPop = typeof pop === "string" ? Number.parseFloat(pop) : pop;
		if (Number.isNaN(numPop)) return pop.toString();

		// Конвертируем в миллионы
		const millions = numPop / 1_000_000;
		return `${millions.toFixed(2)} млн чел.`;
	};

	// Форматирование площади в компактный вид
	const formatArea = (area: string | number | undefined): string => {
		if (!area) return "";
		const numArea = typeof area === "string" ? Number.parseFloat(area) : area;
		if (Number.isNaN(numArea)) return area.toString();

		// Конвертируем в тысячи км²
		const thousands = numArea / 1_000;
		return `${thousands.toFixed(1)} тыс. км²`;
	};

	// Обработчик клика по стране с расширенной информацией
	const onEachCountry = (feature: Feature, layer: L.Layer) => {
		if (feature.properties) {
			const {
				name,
				name_en,
				ruler,
				capital,
				government,
				population,
				area,
				currency,
				religion,
				languages,
				part_of,
				PARTOF,
			} = feature.properties;

			const countryName = name || name_en || "Неизвестная территория";
			const formattedPopulation = formatPopulation(population);
			const formattedArea = formatArea(area);

			// Popup с расширенной информацией
			const popupContent = `
        <div class="p-4 min-w-[320px] max-w-[400px]">
          <h3 class="font-bold text-lg mb-3 text-blue-400">${countryName}</h3>
          <div class="space-y-2 mb-3">
            ${ruler ? `<p class="text-sm"><strong>Правитель:</strong> ${ruler}</p>` : ""}
            ${capital ? `<p class="text-sm"><strong>Столица:</strong> ${capital}</p>` : ""}
            ${government ? `<p class="text-sm"><strong>Форма правления:</strong> ${government}</p>` : ""}
            ${formattedPopulation ? `<p class="text-sm"><strong>Население:</strong> ${formattedPopulation}</p>` : ""}
            ${formattedArea ? `<p class="text-sm"><strong>Площадь:</strong> ${formattedArea}</p>` : ""}
            ${currency ? `<p class="text-sm"><strong>Валюта:</strong> ${currency}</p>` : ""}
            ${religion ? `<p class="text-sm"><strong>Религия:</strong> ${religion}</p>` : ""}
            ${languages ? `<p class="text-sm"><strong>Языки:</strong> ${languages}</p>` : ""}
            ${(part_of || PARTOF) && (part_of || PARTOF) !== countryName ? `<p class="text-sm"><strong>Часть:</strong> ${part_of || PARTOF}</p>` : ""}
          </div>
          <p class="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
            ${currentYear > 0 ? `${currentYear} год н.э.` : `${Math.abs(currentYear)} до н.э.`}
          </p>
        </div>
      `;

			layer.bindPopup(popupContent, {
				maxWidth: 400,
				className: "country-popup",
			});

			// Подсветка при наведении
			layer.on({
				mouseover: (e) => {
					const layer = e.target;
					layer.setStyle({
						weight: 3,
						fillOpacity: 0.9,
					});
				},
				mouseout: (e) => {
					const layer = e.target;
					layer.setStyle({
						weight: 1,
						fillOpacity: 0.7,
					});
				},
			});
		}
	};

	if (loading) {
		return (
			<div
				className={`flex items-center justify-center h-screen bg-gray-900 ${className}`}
			>
				<div className="text-white text-xl">
					Загрузка карты{" "}
					{currentYear > 0
						? `${currentYear} года`
						: `${Math.abs(currentYear)} до н.э.`}
					...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`flex items-center justify-center h-screen bg-gray-900 ${className}`}
			>
				<div className="text-red-500 text-xl">{error}</div>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			<MapContainer
				center={[50, 15]}
				zoom={5}
				className="h-full w-full"
				zoomControl={true}
				scrollWheelZoom={true}
			>
				<SetViewOnLoad />

				{/* Темная базовая карта */}
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				/>

				{mapData && (
					<>
						{/* Сначала рендерим Римскую империю (фон) */}
						<GeoJSON
							key={`${currentYear}-roman-empire`}
							data={{
								type: "FeatureCollection",
								features: mapData.features.filter(
									(feature) =>
										feature.properties?.name === "Римская империя" ||
										feature.properties?.name_en === "Roman Empire",
								),
							}}
							style={countryStyle}
							onEachFeature={onEachCountry}
						/>

						{/* Затем рендерим остальные государства (поверх) */}
						<GeoJSON
							key={`${currentYear}-other-countries`}
							data={{
								type: "FeatureCollection",
								features: mapData.features.filter(
									(feature) =>
										feature.properties?.name !== "Римская империя" &&
										feature.properties?.name_en !== "Roman Empire",
								),
							}}
							style={countryStyle}
							onEachFeature={onEachCountry}
						/>
					</>
				)}

				{alternativeData && (
					<GeoJSON
						key="alt-history-layer"
						data={alternativeData}
						style={() => ({
							fillColor: "#ff0000",
							weight: 3,
							opacity: 1,
							color: "#ffffff",
							fillOpacity: 0.5,
							dashArray: "5, 5"
						})}
					/>
				)}
			</MapContainer>
		</div>
	);
}
