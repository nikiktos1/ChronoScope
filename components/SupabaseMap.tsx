"use client";

import type { Feature, FeatureCollection } from "geojson";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import { getMapForYear } from "@/lib/maps";
import "leaflet/dist/leaflet.css";

// Компонент для отображения названий стран
function CountryLabels({ data }: { data: FeatureCollection }) {
	const map = useMap();
	const labelsRef = useRef<L.Layer[]>([]);

	useEffect(() => {
		function updateLabels() {
			// Удаляем старые labels
			labelsRef.current.forEach((layer) => {
				layer.remove();
			});
			labelsRef.current = [];

			if (!data?.features) return;

			data.features.forEach((feature) => {
				if (!feature?.geometry || !feature?.properties) return;

				const name = feature.properties.name || feature.properties.name_en;
				if (!name) return;

				const geometry = feature.geometry as {
					type: string;
					coordinates: unknown;
				};
				const coordsAny = geometry.coordinates as unknown;

				let allCoords: number[][][] = [];

				if (geometry.type === "Polygon") {
					allCoords = coordsAny as number[][][];
				} else if (geometry.type === "MultiPolygon") {
					const multiCoords = coordsAny as number[][][][];
					if (multiCoords) {
						allCoords = multiCoords.filter(
							(c) => c[0]?.[0],
						) as unknown as number[][][];
					}
				}

				if (allCoords.length === 0) return;

				let minX = Infinity,
					maxX = -Infinity;
				let minY = Infinity,
					maxY = -Infinity;

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				allCoords.forEach((polygon: any) => {
					const ring = polygon[0];
					if (!ring) return;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					ring.forEach((coord: any) => {
						if (coord[0] < minX) minX = coord[0];
						if (coord[0] > maxX) maxX = coord[0];
						if (coord[1] < minY) minY = coord[1];
						if (coord[1] > maxY) maxY = coord[1];
					});
				});

				if (minX === Infinity) return;

				const bounds = L.latLngBounds([
					[minY, minX],
					[maxY, maxX],
				]);

				const center = map.latLngToContainerPoint(bounds.getCenter());
				const size = map.latLngToContainerPoint(bounds.getNorthEast());
				const width = Math.abs(size.x - center.x) * 2; // Удваиваем ширину для полного размера
				const height = Math.abs(size.y - center.y) * 2; // Удваиваем высоту для полного размера

				// Минимальные размеры теперь зависят от масштаба карты
				const zoom = map.getZoom();
				const minRequiredWidth = Math.max(30, 150 / zoom); // Уменьшаем требования к ширине при увеличении
				const minRequiredHeight = Math.max(10, 50 / zoom); // Уменьшаем требования к высоте при увеличении

				if (width < minRequiredWidth || height < minRequiredHeight) return;

				// Только для очень маленьких государств показываем сокращенное название или аббревиатуру
				let displayName = name;
				if (width < 60 || height < 30) {
				  // Используем имя или аббревиатуру, если доступна
				  const abbrev = feature.properties.ABBREVN;
				  if (abbrev && abbrev.length < name.length) {
				    displayName = abbrev;
				  } else if (name.length > 10) {
				    // Для длинных названий на маленьких территориях - делаем сокращение
				    displayName = name.substring(0, 6) + "...";
				  }
				}

				const svg = `
					<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
						<text 
							x="50%" 
							y="50%" 
							text-anchor="middle" 
							dominant-baseline="middle"
							fill="rgba(255,255,255,0.9)"
							font-size="${fontSize}px"
							font-weight="bold"
							font-family="sans-serif"
							style="text-shadow: 1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9); pointer-events: none;"
						>${displayName}</text>
					</svg>
				`;

				const icon = L.divIcon({
					html: svg,
					className: "country-label-svg",
					iconSize: [width, height],
					iconAnchor: [width / 2, height / 2],
				});

				const marker = L.marker(bounds.getCenter(), { icon }).addTo(map);
				labelsRef.current.push(marker);
			});
		}

		updateLabels();

		map.on("zoomend", updateLabels);
		map.on("moveend", updateLabels);

		return () => {
			map.off("zoomend", updateLabels);
			map.off("moveend", updateLabels);
			labelsRef.current.forEach((layer) => {
				layer.remove();
			});
		};
	}, [map, data]);

	return null;
}

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
	initialYear = 1915,
	className = "",
	alternativeData = null,
}: SupabaseMapProps) {
	const [mapData, setMapData] = useState<FeatureCollection | null>(null);
	const [currentYear, setCurrentYear] = useState(initialYear);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Обновляем текущий год при изменении initialYear
	useEffect(() => {
		setCurrentYear(initialYear);
	}, [initialYear]);

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

	const shouldShowPartOf = (
		government: string | undefined,
		partOf: string | undefined,
		countryName: string,
	) => {
		if (!partOf || partOf === countryName) return false;

		const governmentText = (government || "").toLowerCase();
		return /(марионет|протекторат|оккуп|в изгнании|клиент)/.test(governmentText);
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
			const parentState = part_of || PARTOF;
			const showPartOf = shouldShowPartOf(government, parentState, countryName);

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
            ${showPartOf ? `<p class="text-sm"><strong>Часть:</strong> ${parentState}</p>` : ""}
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

				{mapData && mapData.features && <CountryLabels data={mapData} />}

				{mapData && mapData.features && (
					<>
						{/* Сначала рендерим Римскую империю (фон) */}
						<GeoJSON
							key={`${currentYear}-roman-empire`}
							data={
								{
									type: "FeatureCollection",
									features: mapData.features.filter(
										(feature) =>
											feature.properties?.name === "Римская империя" ||
											feature.properties?.name_en === "Roman Empire",
									),
								} as FeatureCollection
							}
							style={countryStyle}
							onEachFeature={onEachCountry}
						/>

						{/* Затем рендерим остальные государства (поверх) */}
						<GeoJSON
							key={`${currentYear}-other-countries`}
							data={
								{
									type: "FeatureCollection",
									features: mapData.features.filter(
										(feature) =>
											feature.properties?.name !== "Римская империя" &&
											feature.properties?.name_en !== "Roman Empire",
									),
								} as FeatureCollection
							}
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
							dashArray: "5, 5",
						})}
					/>
				)}
			</MapContainer>
		</div>
	);
}
