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

			if (!data?.features || data.features.length === 0) return;

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

				// Функция для вычисления приблизительной площади полигона
				const getPolygonArea = (polygon: number[][][]): number => {
					if (!polygon || polygon.length === 0) return 0;
					
					const ring = polygon[0]; // Внешнее кольцо полигона
					if (!ring || ring.length < 3) return 0;
					
					// Используем формулу площади многоугольника (формула трапеций или шнуровая формула)
					let area = 0;
					for (let i = 0; i < ring.length - 1; i++) {
						area += ring[i][0] * ring[i + 1][1];  // x_i * y_{i+1}
						area -= ring[i][1] * ring[i + 1][0];  // y_i * x_{i+1}
					}
					area += ring[ring.length - 1][0] * ring[0][1];  // x_{n-1} * y_0
					area -= ring[ring.length - 1][1] * ring[0][0];  // y_{n-1} * x_0
					
					return Math.abs(area) / 2;
				};

				// Функция для вычисления центра полигона методом средней точки
				const getPolygonCentroid = (polygon: number[][][]): [number, number] | null => {
					if (!polygon || polygon.length === 0) return null;
					
					const ring = polygon[0]; // Внешнее кольцо полигона
					if (!ring || ring.length === 0) return null;
					
					let xSum = 0, ySum = 0, count = 0;
					for (const coord of ring) {
						if (coord && coord.length >= 2) {
							xSum += coord[0]; // долгота
							ySum += coord[1]; // широта
							count++;
						}
					}
					
					if (count === 0) return null;
					return [ySum / count, xSum / count]; // [широта, долгота]
				};

				// Для MultiPolygon вычисляем суммарную площадь и центр
				let centroid: [number, number] | null = null;
				let totalArea = 0;
				
				if (geometry.type === "Polygon" && allCoords.length > 0) {
					totalArea = getPolygonArea(allCoords[0]);
					centroid = getPolygonCentroid(allCoords[0]);
				} else if (geometry.type === "MultiPolygon" && allCoords.length > 0) {
					let weightedX = 0, weightedY = 0;
					for (const poly of allCoords) {
						const area = getPolygonArea([poly[0]]); // только внешнее кольцо
						totalArea += area;
						
						const polyCentroid = getPolygonCentroid([poly[0]]);
						if (polyCentroid && area > 0) {
							weightedX += polyCentroid[0] * area;
							weightedY += polyCentroid[1] * area;
						}
					}
					
					if (totalArea > 0) {
						centroid = [weightedX / totalArea, weightedY / totalArea];
					} else {
						// Если вычисление площади не работает, используем центр первого полигона
						centroid = getPolygonCentroid(allCoords[0]);
					}
				}

				// Если не удалось вычислить центр, пробуем расчет по bounding box
				if (!centroid) {
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

					// Рассчитываем геометрический центр полигона более точно
					centroid = [minY + (maxY - minY) / 2, minX + (maxX - minX) / 2];
				}

				if (!centroid) return;
				
				// Создаем bounds на основе реального размера территории
				const bounds = L.latLngBounds([
					[centroid[0] - 2, centroid[1] - 2], // базовые границы
					[centroid[0] + 2, centroid[1] + 2],
				]);

				// Преобразуем географические координаты в пиксельные для определения размера территории на карте
				const northWest = map.latLngToContainerPoint(bounds.getNorthWest());
				const southEast = map.latLngToContainerPoint(bounds.getSouthEast());
				const width = Math.abs(southEast.x - northWest.x);
				const height = Math.abs(southEast.y - northWest.y);

				// Определение отношения сторон для определения вытянутости территории
				const aspectRatio = width > height ? width / height : height / width;
				const isElongated = aspectRatio > 2.5; // Если отношение сторон > 2.5, то территория считается вытянутой
				const orientation = width > height ? 'horizontal' : 'vertical'; // Определяем ориентацию

				// Нормализуем размер шрифта в зависимости от площади территории с учётом сбалансированного масштабирования
				const referenceArea = 200; // эталонная площадь (условная) для масштабирования
				const minAcceptableSize = 0.5; // минимальный размер относительно эталонного
				const maxAcceptableSize = 2.0; // максимальный размер относительно эталонного
				
				let sizeFactor = 1.0;
				
				if (totalArea > 0) {
					// Используем степенную функцию для более сбалансированного масштабирования
					// Это уменьшает разницу между размерами текста для больших и маленьких стран
					sizeFactor = Math.pow(totalArea / referenceArea, 0.3);
					// Ограничиваем фактор масштабирования разумными пределами
					sizeFactor = Math.max(minAcceptableSize, Math.min(maxAcceptableSize, sizeFactor));
				}

				// Уменьшаем минимальные требования для отображения названий стран
				const zoom = map.getZoom();
				const minRequiredWidth = Math.max(10, 50 / zoom); // Значительно снижаем требования к ширине
				const minRequiredHeight = Math.max(5, 20 / zoom); // Значительно снижаем требования к высоте

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

				// Расчет размера шрифта с учетом размера территории
				const baseFontSize = 10 * sizeFactor; // Уменьшаем базовый размер шрифта
				const minFontSize = Math.max(5, 6 * sizeFactor); // Уменьшаем минимальный размер шрифта
				const maxFontSize = Math.min(height * 0.6, 24); // Уменьшаем максимальный размер
				const fontSize = Math.max(minFontSize, Math.min(baseFontSize, maxFontSize));

				// Увеличиваем размер SVG-контейнера, чтобы избежать обрезания текста
				const paddedWidth = Math.max(width * 1.2, fontSize * displayName.length * 0.8); // Уменьшаем увеличение
				const paddedHeight = Math.max(height * 1.2, fontSize * 1.3); // Уменьшаем увеличение

				// Определяем угол поворота для вытянутых территорий
				let rotationAngle = 0;
				if (isElongated) {
					// Поворачиваем текст в зависимости от ориентации территории
					rotationAngle = orientation === 'horizontal' ? 0 : -90; // Горизонтальная - без поворота, вертикальная - на -90 градусов
				}

				const svg = `
					<svg width="${paddedWidth}" height="${paddedHeight}" xmlns="http://www.w3.org/2000/svg">
						<text 
							x="50%" 
							y="50%" 
							text-anchor="middle" 
							dominant-baseline="middle"
							transform="rotate(${rotationAngle} 50% 50%)"
							fill="rgba(255,255,255,0.95)"
							font-size="${fontSize}px"
							font-weight="bold"
							font-family="sans-serif"
							style="text-shadow: 1px 1px 3px rgba(0,0,0,1), -1px -1px 3px rgba(0,0,0,1); pointer-events: none;"
						>${displayName}</text>
					</svg>
				`;

				// Корректируем размер иконки
				const adjustedWidth = paddedWidth;
				const adjustedHeight = paddedHeight;

				const icon = L.divIcon({
					html: svg,
					className: "country-label-svg",
					iconSize: [adjustedWidth, adjustedHeight],
					iconAnchor: [adjustedWidth / 2, adjustedHeight / 2],
				});

				const marker = L.marker(L.latLng(centroid[0], centroid[1]), { icon }).addTo(map);
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

				{mapData && mapData.features && mapData.features.length > 0 && <CountryLabels data={mapData} />}

				{mapData && mapData.features && mapData.features.length > 0 && (
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
