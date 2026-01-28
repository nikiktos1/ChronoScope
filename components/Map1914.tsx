'use client';

import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';

// Компонент для установки вида карты
function SetViewOnLoad() {
  const map = useMap();
  
  useEffect(() => {
    map.setView([50, 15], 5);
  }, [map]);
  
  return null;
}

interface HistoricalMapProps {
  year: number;
}

// Маппинг годов к именам файлов
const getFileName = (year: number): string => {
  if (year < 0) {
    return `bc${Math.abs(year)}`;
  }
  return year.toString();
};

export default function Map1914({ year = 1914 }: HistoricalMapProps) {
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Загружаем данные для выбранного года
    const fileName = getFileName(year);
    const dataPath = `/data/historical/world_${fileName}.geojson`;
    
    fetch(dataPath)
      .then(res => res.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки данных:', err);
        setLoading(false);
      });
  }, [year]);

  // Стиль для каждой страны
  const countryStyle = (feature?: Feature) => {
    // Генерируем цвет на основе названия страны для консистентности
    const name = feature?.properties?.NAME || feature?.properties?.name || '';
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue = Math.abs(hash) % 360;
    const color = `hsl(${hue}, 70%, 50%)`;
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 0.8,
      color: '#ffffff',
      fillOpacity: 0.7
    };
  };

  // Обработчик для каждой страны
  const onEachCountry = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const { 
        NAME,
        SUBJECTO,
        ABBREVN,
        PARTOF,
        name,
        ruler, 
        capital, 
        government, 
        description, 
        period,
        originalName 
      } = feature.properties;
      
      // Используем переведенное name, если есть, иначе NAME из world файлов
      const countryName = name || NAME || 'Неизвестная территория';
      const displayName = originalName || SUBJECTO || '';
      
      // Popup с информацией
      const popupContent = `
        <div class="p-3 min-w-[280px]">
          <h3 class="font-bold text-lg mb-2 text-blue-400">${countryName}</h3>
          ${displayName ? `<p class="text-xs text-gray-400 mb-2">(${displayName})</p>` : ''}
          <div class="space-y-1 mb-3">
            ${ruler ? `<p class="text-sm"><strong>Правитель:</strong> ${ruler}</p>` : ''}
            ${capital ? `<p class="text-sm"><strong>Столица:</strong> ${capital}</p>` : ''}
            ${government ? `<p class="text-sm"><strong>Форма правления:</strong> ${government}</p>` : ''}
            ${PARTOF && PARTOF !== countryName ? `<p class="text-sm"><strong>Часть:</strong> ${PARTOF}</p>` : ''}
          </div>
          ${description ? `<p class="text-xs text-gray-300 mb-2 italic">${description}</p>` : ''}
          <p class="text-xs text-gray-500 mt-2">
            ${year > 0 ? `${year} год` : `${Math.abs(year)} до н.э.`}
            ${period ? ` • ${period}` : ''}
          </p>
        </div>
      `;
      
      layer.bindPopup(popupContent);
      
      // Подсветка при наведении
      layer.on({
        mouseover: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            fillOpacity: 0.9
          });
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 1,
            fillOpacity: 0.7
          });
        }
      });
    }
  };

  if (loading || !geoData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">
          {loading ? `Загрузка карты ${year} года...` : 'Загрузка исторических данных...'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
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

        {/* Отрисовка границ государств 1914 года из GeoJSON */}
        <GeoJSON
          data={geoData}
          style={countryStyle}
          onEachFeature={onEachCountry}
        />
      </MapContainer>
    </div>
  );
}
