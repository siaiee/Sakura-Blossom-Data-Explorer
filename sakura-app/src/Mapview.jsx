import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.heat';
import {
  Map as MapIcon,
  Flame,
  Users,
  Layers,
  Target,
  BarChart3,
  X,
  Filter,
  Download,
  Maximize2,
  ChevronRight,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  Search,
  AlertCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapBoundsAdjuster({ points, mode }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0 && mode === 'markers') {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, mode, map]);

  return null;
}

function HeatmapLayer({ points, radius, blur, gradient }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: radius || 25,
      blur: blur || 15,
      maxZoom: 17,
      max: 1.0,
      gradient: gradient || {
        0.0: '#3b82f6',
        0.3: '#10b981',
        0.5: '#f59e0b',
        0.7: '#ef4444',
        1.0: '#dc2626'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, blur, gradient]);

  return null;
}

const generateColors = (count) => {
  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];
  return colors.slice(0, Math.min(count, colors.length));
};

const createColoredIcon = (color) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

function MapView({ data, dataTypes, filteredData }) {
  const activeData = filteredData || data;

  const [mapMode, setMapMode] = useState('markers');
  const [selectedLatField, setSelectedLatField] = useState(null);
  const [selectedLonField, setSelectedLonField] = useState(null);
  const [colorByField, setColorByField] = useState(null);
  const [sizeByField, setSizeByField] = useState(null);
  const [visibleFields, setVisibleFields] = useState({});
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [heatmapIntensityField, setHeatmapIntensityField] = useState(null);
  const [heatmapRadius, setHeatmapRadius] = useState(25);
  const [routeByField, setRouteByField] = useState(null);
  const [showCircles, setShowCircles] = useState(false);
  const [circleRadius, setCircleRadius] = useState(5000);

  const coordinateFields = useMemo(() => {
    if (!dataTypes) return { latFields: [], lonFields: [] };

    const latFields = Object.entries(dataTypes)
      .filter(([field, type]) => {
        const fieldLower = field.toLowerCase();
        return type === 'coordinate' ||
               type === 'latitude' ||
               fieldLower.includes('lat') ||
               fieldLower === 'latitude' ||
               fieldLower === 'широта';
      })
      .map(([field]) => field);

    const lonFields = Object.entries(dataTypes)
      .filter(([field, type]) => {
        const fieldLower = field.toLowerCase();
        return type === 'coordinate' ||
               type === 'longitude' ||
               fieldLower.includes('lon') ||
               fieldLower.includes('lng') ||
               fieldLower === 'longitude' ||
               fieldLower === 'долгота';
      })
      .map(([field]) => field);

    if (latFields.length === 0 && lonFields.length === 0) {
      const coordFields = Object.entries(dataTypes)
        .filter(([_, type]) => type === 'coordinate')
        .map(([field]) => field);

      if (coordFields.length >= 2) {

        return {
          latFields: [coordFields[0]],
          lonFields: [coordFields[1]]
        };
      }
    }

    return { latFields, lonFields };
  }, [dataTypes]);

  useEffect(() => {
    if (coordinateFields.latFields.length > 0 && !selectedLatField) {
      setSelectedLatField(coordinateFields.latFields[0]);
    }
    if (coordinateFields.lonFields.length > 0 && !selectedLonField) {
      setSelectedLonField(coordinateFields.lonFields[0]);
    }
  }, [coordinateFields, selectedLatField, selectedLonField]);

  useEffect(() => {
    if (data && data.length > 0 && Object.keys(visibleFields).length === 0) {
      const fields = Object.keys(data[0]);
      const initial = {};
      fields.slice(0, 5).forEach(field => {
        initial[field] = true;
      });
      setVisibleFields(initial);
    }
  }, [data, visibleFields]);

  const mapPoints = useMemo(() => {
    if (!selectedLatField || !selectedLonField || !activeData) return [];

    return activeData
      .map((row, index) => {
        const lat = parseFloat(row[selectedLatField]);
        const lng = parseFloat(row[selectedLonField]);

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
  }, [activeData, selectedLatField, selectedLonField]);

  const filteredPoints = useMemo(() => {
    if (!searchQuery) return mapPoints;

    const query = searchQuery.toLowerCase();
    return mapPoints.filter(point => {
      return Object.values(point.data).some(value =>
        String(value).toLowerCase().includes(query)
      );
    });
  }, [mapPoints, searchQuery]);

  const colorMapping = useMemo(() => {
    if (!colorByField || filteredPoints.length === 0) return {};

    const uniqueValues = [...new Set(filteredPoints.map(p => p.data[colorByField]))];
    const colors = generateColors(uniqueValues.length);

    const mapping = {};
    uniqueValues.forEach((value, index) => {
      mapping[value] = colors[index] || '#6b7280';
    });

    return mapping;
  }, [colorByField, filteredPoints]);

  const getSizeForPoint = (point) => {
    if (!sizeByField) return 5000;
    const value = parseFloat(point.data[sizeByField]);
    if (isNaN(value)) return 5000;

    const values = filteredPoints.map(p => parseFloat(p.data[sizeByField])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);

    return 3000 + ((value - min) / (max - min)) * 12000;
  };

  const heatmapPoints = useMemo(() => {
    if (!heatmapIntensityField) {
      return filteredPoints.map(p => [p.lat, p.lng, 1]);
    }

    const values = filteredPoints.map(p => parseFloat(p.data[heatmapIntensityField])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);

    return filteredPoints.map(p => {
      const value = parseFloat(p.data[heatmapIntensityField]);
      const normalized = isNaN(value) ? 0.5 : (value - min) / (max - min);
      return [p.lat, p.lng, normalized];
    });
  }, [filteredPoints, heatmapIntensityField]);

  const routeGroups = useMemo(() => {
    if (!routeByField || mapMode !== 'routes') return [];

    const groups = {};
    filteredPoints.forEach(point => {
      const groupValue = point.data[routeByField];
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push([point.lat, point.lng]);
    });

    return Object.entries(groups).map(([name, positions], index) => ({
      name,
      positions,
      color: generateColors(Object.keys(groups).length)[index]
    }));
  }, [filteredPoints, routeByField, mapMode]);

  const overallStats = useMemo(() => {
    if (filteredPoints.length === 0) return null;

    const numericFields = Object.entries(dataTypes || {})
      .filter(([_, type]) => type === 'number')
      .map(([field]) => field);

    const stats = {};
    numericFields.forEach(field => {
      const values = filteredPoints
        .map(p => parseFloat(p.data[field]))
        .filter(v => !isNaN(v));

      if (values.length > 0) {
        stats[field] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          sum: values.reduce((a, b) => a + b, 0)
        };
      }
    });

    return stats;
  }, [filteredPoints, dataTypes]);

  const exportMapData = () => {
    const csvContent = [
      ['Широта', 'Долгота', ...Object.keys(filteredPoints[0]?.data || {})].join(','),
      ...filteredPoints.map(p =>
        [p.lat, p.lng, ...Object.values(p.data)].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map_data_export.csv';
    link.click();
  };

  if (coordinateFields.latFields.length === 0 || coordinateFields.lonFields.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Координаты не обнаружены
        </h3>
        <p className="text-gray-600">
          В данных отсутствуют поля с координатами (широта/долгота)
        </p>
      </div>
    );
  }

  if (mapPoints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Нет валидных координат
        </h3>
        <p className="text-gray-600">
          В выбранных полях отсутствуют корректные географические координаты
        </p>
      </div>
    );
  }

  const center = [mapPoints[0].lat, mapPoints[0].lng];

  const hasSearchResults = filteredPoints.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;

  return (
    <div className="relative h-screen flex">
      { }
      <div className={`bg-white shadow-2xl transition-all duration-300 overflow-y-auto ${
        isControlPanelOpen ? 'w-80' : 'w-0'
      }`}>
        {isControlPanelOpen && (
          <div className="p-6 space-y-6">
            { }
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5 text-pink-600" />
                <h3 className="font-bold text-gray-800">Настройки карты</h3>
              </div>
              <button
                onClick={() => setIsControlPanelOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Поиск на карте
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите запрос..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              {isSearchActive && (
                <div className="mt-2">
                  {hasSearchResults ? (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Найдено: {filteredPoints.length} из {mapPoints.length}
                    </p>
                  ) : (
                    <p className="text-xs text-orange-600 font-medium">
                      ⚠ Ничего не найдено
                    </p>
                  )}
                </div>
              )}
            </div>

            { }
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Layers className="w-4 h-4 inline mr-1" />
                Режим отображения
              </label>
              <div className="space-y-2">
                {[
                  { value: 'markers', label: 'Точки на карте', icon: MapPin },
                  { value: 'heatmap', label: 'Тепловая карта', icon: Flame },
                  { value: 'clusters', label: 'Кластеры', icon: Users },
                  { value: 'routes', label: 'Маршруты', icon: TrendingUp }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMapMode(value)}
                    className={`w-full px-4 py-2 rounded-lg text-left flex items-center space-x-2 transition-colors ${
                      mapMode === value
                        ? 'bg-pink-100 text-pink-700 font-medium'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            { }
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Поле широты
                </label>
                <select
                  value={selectedLatField || ''}
                  onChange={(e) => setSelectedLatField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {coordinateFields.latFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Поле долготы
                </label>
                <select
                  value={selectedLonField || ''}
                  onChange={(e) => setSelectedLonField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  {coordinateFields.lonFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>

            { }
            {mapMode === 'markers' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цвет по полю
                </label>
                <select
                  value={colorByField || ''}
                  onChange={(e) => setColorByField(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Без цветового кодирования</option>
                  {Object.keys(data[0] || {})
                    .filter(f => f !== selectedLatField && f !== selectedLonField)
                    .map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                </select>

                {colorByField && colorMapping && Object.keys(colorMapping).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 font-medium">Легенда:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {Object.entries(colorMapping).map(([value, color]) => (
                        <div key={value} className="flex items-center space-x-2 text-xs">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-gray-700 truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            { }
            {(mapMode === 'markers' || showCircles) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showCircles ? 'Радиус кругов по полю' : 'Размер маркеров по полю'}
                </label>
                <select
                  value={sizeByField || ''}
                  onChange={(e) => setSizeByField(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Одинаковый размер</option>
                  {Object.entries(dataTypes || {})
                    .filter(([_, type]) => type === 'number')
                    .map(([field]) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                </select>
              </div>
            )}

            { }
            {mapMode === 'heatmap' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Интенсивность по полю
                  </label>
                  <select
                    value={heatmapIntensityField || ''}
                    onChange={(e) => setHeatmapIntensityField(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="">Равномерная</option>
                    {Object.entries(dataTypes || {})
                      .filter(([_, type]) => type === 'number')
                      .map(([field]) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Радиус размытия: {heatmapRadius}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={heatmapRadius}
                    onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            { }
            {mapMode === 'routes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Группировать маршруты по полю
                </label>
                <select
                  value={routeByField || ''}
                  onChange={(e) => setRouteByField(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Выберите поле</option>
                  {Object.keys(data[0] || {})
                    .filter(f => f !== selectedLatField && f !== selectedLonField)
                    .map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                </select>

                {routeByField && routeGroups.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      Маршруты ({routeGroups.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {routeGroups.map((group) => (
                        <div key={group.name} className="flex items-center space-x-2 text-xs">
                          <div
                            className="w-3 h-0.5"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-gray-700 truncate">
                            {group.name} ({group.positions.length} точек)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            { }
            {mapMode === 'markers' && (
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCircles}
                    onChange={(e) => setShowCircles(e.target.checked)}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Показать радиусы</span>
                </label>
                {showCircles && !sizeByField && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Радиус: {(circleRadius / 1000).toFixed(1)} км
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={circleRadius}
                      onChange={(e) => setCircleRadius(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            { }
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поля в popup
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {Object.keys(data[0] || {}).map(field => (
                  <label key={field} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleFields[field] || false}
                      onChange={(e) => setVisibleFields({
                        ...visibleFields,
                        [field]: e.target.checked
                      })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            { }
            <div className="space-y-2 pt-4 border-t">
              <button
                onClick={() => setIsStatsPanelOpen(!isStatsPanelOpen)}
                className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Статистика</span>
              </button>

              <button
                onClick={exportMapData}
                disabled={filteredPoints.length === 0}
                className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                  filteredPoints.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-50 hover:bg-green-100 text-green-700'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Экспорт CSV</span>
              </button>
            </div>

            { }
            <div className="pt-4 border-t">
              <div className="bg-pink-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-pink-600">
                  {filteredPoints.length}
                </p>
                <p className="text-xs text-gray-600">
                  {isSearchActive ? 'найдено точек' : 'точек на карте'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      { }
      {!isControlPanelOpen && (
        <button
          onClick={() => setIsControlPanelOpen(true)}
          className="absolute left-4 top-4 z-[1000] bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      { }
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsAdjuster points={hasSearchResults ? filteredPoints : mapPoints} mode={mapMode} />

          { }
          {mapMode === 'markers' && filteredPoints.map((point) => {
            const color = colorByField ? colorMapping[point.data[colorByField]] : '#ef4444';
            const icon = createColoredIcon(color);
            const radius = sizeByField ? getSizeForPoint(point) : circleRadius;

            return (
              <React.Fragment key={point.id}>
                <Marker position={[point.lat, point.lng]} icon={icon}>
                  <Popup>
                    <div className="max-w-xs">
                      <h4 className="font-bold text-gray-800 mb-2 text-sm">
                        Точка #{point.id + 1}
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(point.data)
                          .filter(([field]) => visibleFields[field])
                          .map(([field, value]) => (
                            <div key={field} className="text-xs">
                              <span className="font-medium text-gray-600">{field}:</span>{' '}
                              <span className="text-gray-800">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {showCircles && (
                  <Circle
                    center={[point.lat, point.lng]}
                    radius={radius}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.2,
                      weight: 2
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          { }
          {mapMode === 'heatmap' && heatmapPoints.length > 0 && (
            <HeatmapLayer
              points={heatmapPoints}
              radius={heatmapRadius}
              blur={15}
              gradient={{
                0.0: '#3b82f6',
                0.3: '#10b981',
                0.5: '#f59e0b',
                0.7: '#ef4444',
                1.0: '#dc2626'
              }}
            />
          )}

          { }
          {mapMode === 'clusters' && (
            <MarkerClusterGroup>
              {filteredPoints.map((point) => {
                const color = colorByField ? colorMapping[point.data[colorByField]] : '#ef4444';
                const icon = createColoredIcon(color);

                return (
                  <Marker key={point.id} position={[point.lat, point.lng]} icon={icon}>
                    <Popup>
                      <div className="max-w-xs">
                        <h4 className="font-bold text-gray-800 mb-2 text-sm">
                          Точка #{point.id + 1}
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(point.data)
                            .filter(([field]) => visibleFields[field])
                            .map(([field, value]) => (
                              <div key={field} className="text-xs">
                                <span className="font-medium text-gray-600">{field}:</span>{' '}
                                <span className="text-gray-800">{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}

          { }
          {mapMode === 'routes' && routeGroups.map((group) => (
            <React.Fragment key={group.name}>
              <Polyline
                positions={group.positions}
                pathOptions={{
                  color: group.color,
                  weight: 3,
                  opacity: 0.7
                }}
              />
              {group.positions.map((pos, idx) => (
                <Marker
                  key={`${group.name}-${idx}`}
                  position={pos}
                  icon={createColoredIcon(group.color)}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold">{group.name}</p>
                      <p>Точка {idx + 1} из {group.positions.length}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}
        </MapContainer>

        { }
        {isSearchActive && !hasSearchResults && (
          <div className="absolute inset-0 bg-white bg-opacity-90 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Ничего не найдено
              </h3>
              <p className="text-gray-600 mb-4">
                По запросу "<span className="font-semibold">{searchQuery}</span>" не найдено ни одной точки
              </p>
              <p className="text-sm text-gray-500">
                Попробуйте изменить поисковый запрос или очистить поле поиска
              </p>
            </div>
          </div>
        )}

        { }
        <div className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-lg px-4 py-2">
          <p className="text-sm font-medium text-gray-700">
            {mapMode === 'markers' && '📍 Точки на карте'}
            {mapMode === 'heatmap' && '🔥 Тепловая карта'}
            {mapMode === 'clusters' && '👥 Кластеры'}
            {mapMode === 'routes' && '📈 Маршруты'}
          </p>
        </div>
      </div>

      { }
      {isStatsPanelOpen && (
        <div className="w-80 bg-white shadow-2xl overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Статистика</h3>
              </div>
              <button
                onClick={() => setIsStatsPanelOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            { }
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700 uppercase">
                Общие данные
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-pink-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Всего точек</p>
                  <p className="text-xl font-bold text-pink-600">{mapPoints.length}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">На карте</p>
                  <p className="text-xl font-bold text-blue-600">{filteredPoints.length}</p>
                </div>
              </div>
            </div>

            { }
            {overallStats && Object.keys(overallStats).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase">
                  По числовым полям
                </h4>
                <div className="space-y-3">
                  {Object.entries(overallStats).map(([field, stats]) => (
                    <div key={field} className="border border-gray-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-2">{field}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Мин</p>
                          <p className="font-semibold text-gray-700">
                            {stats.min.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Макс</p>
                          <p className="font-semibold text-gray-700">
                            {stats.max.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Средн</p>
                          <p className="font-semibold text-gray-700">
                            {stats.avg.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Сумма</p>
                          <p className="font-semibold text-gray-700">
                            {stats.sum.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            { }
            {colorByField && colorMapping && Object.keys(colorMapping).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase">
                  Распределение: {colorByField}
                </h4>
                <div className="space-y-2">
                  {Object.entries(
                    filteredPoints.reduce((acc, point) => {
                      const value = point.data[colorByField];
                      acc[value] = (acc[value] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([value, count]) => (
                      <div key={value} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colorMapping[value] }}
                          />
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {value}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
