import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фикс иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Компонент для автоматической подстройки карты под маркеры
function MapBoundsAdjuster({ points }) {
  const map = useMap();
  
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [points, map]);
  
  return null;
}

/**
 * Компактная версия MapView для использования в дашбордах
 * Только карта без панелей управления и статистики
 */
const MapViewCompact = ({ data, dataTypes, mode = 'markers' }) => {
  // Извлечение полей координат
  const coordinateFields = useMemo(() => {
    if (!dataTypes) return { latField: null, lonField: null };
    
    const latField = Object.entries(dataTypes).find(([field, info]) => {
      const fieldLower = field.toLowerCase();
      return info.type === 'coordinate' || 
             info.type === 'latitude' || 
             fieldLower.includes('lat') ||
             fieldLower === 'latitude';
    })?.[0];
    
    const lonField = Object.entries(dataTypes).find(([field, info]) => {
      const fieldLower = field.toLowerCase();
      return info.type === 'coordinate' || 
             info.type === 'longitude' || 
             fieldLower.includes('lon') ||
             fieldLower.includes('lng') ||
             fieldLower === 'longitude';
    })?.[0];
    
    return { latField, lonField };
  }, [dataTypes]);

  // Подготовка точек для карты
  const mapPoints = useMemo(() => {
    if (!coordinateFields.latField || !coordinateFields.lonField || !data) return [];
    
    return data
      .map((row, index) => {
        const lat = parseFloat(row[coordinateFields.latField]);
        const lng = parseFloat(row[coordinateFields.lonField]);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return null;
        }
        
        return {
          id: index,
          lat,
          lng,
          data: row
        };
      })
      .filter(point => point !== null);
  }, [data, coordinateFields]);

  // Если нет точек
  if (mapPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Нет корректных координат для отображения
      </div>
    );
  }

  // Центр карты
  const center = [mapPoints[0].lat, mapPoints[0].lng];

  return (
    <div className="w-full h-full" style={{ minWidth: '200px', minHeight: '200px' }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsAdjuster points={mapPoints} />

        {/* Режим: Точки */}
        {mode === 'markers' && mapPoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]}>
            <Popup>
              <div className="text-xs max-w-xs">
                <div className="font-semibold mb-1">Точка #{point.id + 1}</div>
                <div className="space-y-0.5">
                  {Object.entries(point.data)
                    .slice(0, 5)
                    .map(([field, value]) => (
                      <div key={field}>
                        <span className="font-medium text-gray-600">{field}:</span>{' '}
                        <span className="text-gray-800">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Режим: Кластеры */}
        {mode === 'clusters' && (
          <MarkerClusterGroup>
            {mapPoints.map((point) => (
              <Marker key={point.id} position={[point.lat, point.lng]}>
                <Popup>
                  <div className="text-xs max-w-xs">
                    <div className="font-semibold mb-1">Точка #{point.id + 1}</div>
                    <div className="space-y-0.5">
                      {Object.entries(point.data)
                        .slice(0, 5)
                        .map(([field, value]) => (
                          <div key={field}>
                            <span className="font-medium text-gray-600">{field}:</span>{' '}
                            <span className="text-gray-800">{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>
    </div>
  );
};

export default MapViewCompact;