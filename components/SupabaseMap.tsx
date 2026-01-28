'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { getMapForYear, getAvailableYears } from '@/lib/maps'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Компонент для установки вида карты
function SetViewOnLoad() {
  const map = useMap();
  
  useEffect(() => {
    map.setView([50, 15], 5);
  }, [map]);
  
  return null;
}

interface SupabaseMapProps {
  initialYear?: number
  className?: string
}

export default function SupabaseMap({ initialYear = 1914, className = '' }: SupabaseMapProps) {
  const [mapData, setMapData] = useState<FeatureCollection | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Обновляем текущий год при изменении initialYear
  useEffect(() => {
    setCurrentYear(initialYear)
  }, [initialYear])

  // Загрузка доступных лет
  useEffect(() => {
    async function loadYears() {
      try {
        const years = await getAvailableYears()
        setAvailableYears(years)
      } catch (err) {
        console.error('Ошибка загрузки лет:', err)
        setError('Не удалось загрузить список лет')
      }
    }
    loadYears()
  }, [])

  // Загрузка карты для текущего года
  useEffect(() => {
    async function loadMap() {
      setLoading(true)
      setError(null)
      
      try {
        const data = await getMapForYear(currentYear)
        if (data) {
          setMapData(data as FeatureCollection)
        } else {
          setError(`Карта для ${currentYear} года не найдена`)
        }
      } catch (err) {
        console.error('Ошибка загрузки карты:', err)
        setError('Не удалось загрузить карту')
      } finally {
        setLoading(false)
      }
    }
    
    loadMap()
  }, [currentYear])

  // Стиль для стран (как в Map1914)
  const countryStyle = (feature?: Feature) => {
    // Генерируем цвет на основе названия страны для консистентности
    const name = feature?.properties?.name || feature?.properties?.name_en || '';
    const hash = name.split('').reduce((a: number, b: string) => {
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
  }

  // Обработчик клика по стране (как в Map1914)
  const onEachCountry = (feature: Feature, layer: L.Layer) => {
    if (feature.properties) {
      const { 
        name,
        name_en,
        ruler, 
        capital, 
        government,
        ABBREVN,
        PARTOF
      } = feature.properties;
      
      const countryName = name || name_en || 'Неизвестная территория';
      
      // Popup с информацией
      const popupContent = `
        <div class="p-3 min-w-[280px]">
          <h3 class="font-bold text-lg mb-2 text-blue-400">${countryName}</h3>
          <div class="space-y-1 mb-3">
            ${ruler ? `<p class="text-sm"><strong>Правитель:</strong> ${ruler}</p>` : ''}
            ${capital ? `<p class="text-sm"><strong>Столица:</strong> ${capital}</p>` : ''}
            ${government ? `<p class="text-sm"><strong>Форма правления:</strong> ${government}</p>` : ''}
            ${PARTOF && PARTOF !== countryName ? `<p class="text-sm"><strong>Часть:</strong> ${PARTOF}</p>` : ''}
          </div>
          <p class="text-xs text-gray-500 mt-2">
            ${currentYear > 0 ? `${currentYear} год` : `${Math.abs(currentYear)} до н.э.`}
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
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen bg-gray-900 ${className}`}>
        <div className="text-white text-xl">
          Загрузка карты {currentYear > 0 ? `${currentYear} года` : `${Math.abs(currentYear)} до н.э.`}...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen bg-gray-900 ${className}`}>
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className={className}>
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
          <GeoJSON
            key={currentYear} // Принудительное обновление при смене года
            data={mapData}
            style={countryStyle}
            onEachFeature={onEachCountry}
          />
        )}
      </MapContainer>
    </div>
  )
}