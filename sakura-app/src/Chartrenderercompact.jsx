import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Форматирование чисел на осях - убирает странные дробные части
 */
const formatAxisNumber = (value) => {
  if (typeof value !== 'number') return value;
  
  // Если число очень близко к целому (разница < 0.01), округляем
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return Math.round(value);
  }
  
  // Иначе округляем до 2 знаков после запятой
  return Number(value.toFixed(2));
};

/**
 * Компактная версия ChartRenderer для использования в дашбордах
 * Убран весь лишний UI, график масштабируется под размер контейнера
 */
const ChartRendererCompact = ({ data, config, settings, width, height }) => {
  // Получаем настройки графиков
  const chartColors = settings?.chartColors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const chartStyle = settings?.chartStyle || {
    rounded: true,
    grid: true,
    legend: 'none',
    animation: false
  };

  // Подготовка данных для графика
  const chartData = useMemo(() => {
    if (!data || !config) return [];
    
    // Для круговой диаграммы нужна особая структура
    if (config.type === 'pie') {
      const grouped = data.reduce((acc, item) => {
        const key = String(item[config.xField] || 'Не указано');
        const value = Number(item[config.yField]) || 0;
        
        if (!acc[key]) {
          acc[key] = { name: key, value: 0 };
        }
        acc[key].value += value;
        
        return acc;
      }, {});
      
      return Object.values(grouped);
    }
    
    // Для остальных типов графиков
    return data.map(item => ({
      [config.xField]: item[config.xField],
      [config.yField]: Number(item[config.yField]) || 0
    }));
  }, [data, config]);

  // Вычисляем границы для оси Y (чтобы график не строился с большим запасом)
  const yAxisDomain = useMemo(() => {
    if (config.type === 'pie') return undefined;
    
    const values = chartData.map(item => item[config.yField]).filter(v => !isNaN(v) && v !== null);
    if (values.length === 0) return undefined;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Добавляем 10% запаса сверху и снизу
    const range = max - min;
    const padding = range * 0.1;
    
    return [
      Math.max(0, min - padding),
      max + padding
    ];
  }, [chartData, config]);

  // Получаем позицию легенды
  const legendProps = useMemo(() => {
    if (chartStyle.legend === 'none') {
      return null;
    }
    
    const positions = {
      top: { verticalAlign: 'top', height: 24 },
      bottom: { verticalAlign: 'bottom', height: 24 },
      right: { layout: 'vertical', verticalAlign: 'middle', align: 'right' }
    };
    
    return positions[chartStyle.legend] || null;
  }, [chartStyle.legend]);

  // Адаптивные размеры шрифтов в зависимости от размера элемента
  const fontSize = useMemo(() => {
    const minDimension = Math.min(width || 400, height || 300);
    if (minDimension < 200) return 8;
    if (minDimension < 300) return 10;
    return 12;
  }, [width, height]);

  // Рендер графика в зависимости от типа
  const renderChart = () => {
    const commonProps = {
      margin: { top: 10, right: 10, left: 10, bottom: 10 }
    };

    const gridProps = chartStyle.grid ? {
      strokeDasharray: "3 3",
      stroke: "#e5e7eb",
      strokeOpacity: 0.5
    } : null;

    const animationProps = chartStyle.animation ? {
      animationDuration: 800,
      isAnimationActive: true
    } : {
      isAnimationActive: false
    };

    switch (config.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={config.xField} 
                tick={{ fontSize }}
                stroke="#6b7280"
                tickFormatter={formatAxisNumber}
              />
              <YAxis 
                tick={{ fontSize }}
                stroke="#6b7280"
                domain={yAxisDomain}
                tickFormatter={formatAxisNumber}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: fontSize
                }}
              />
              {legendProps && <Legend {...legendProps} wrapperStyle={{ fontSize }} />}
              <Bar 
                dataKey={config.yField} 
                fill={chartColors[0]}
                radius={chartStyle.rounded ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={config.xField}
                tick={{ fontSize }}
                stroke="#6b7280"
                tickFormatter={formatAxisNumber}
              />
              <YAxis 
                tick={{ fontSize }}
                stroke="#6b7280"
                domain={yAxisDomain}
                tickFormatter={formatAxisNumber}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: fontSize
                }}
              />
              {legendProps && <Legend {...legendProps} wrapperStyle={{ fontSize }} />}
              <Line 
                type="monotone"
                dataKey={config.yField} 
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart {...animationProps}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: fontSize
                }}
              />
              {legendProps && <Legend {...legendProps} wrapperStyle={{ fontSize }} />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis 
                type="number"
                dataKey={config.xField}
                name={config.xField}
                tick={{ fontSize }}
                stroke="#6b7280"
                tickFormatter={formatAxisNumber}
              />
              <YAxis 
                type="number"
                dataKey={config.yField}
                name={config.yField}
                tick={{ fontSize }}
                stroke="#6b7280"
                domain={yAxisDomain}
                tickFormatter={formatAxisNumber}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: fontSize
                }}
              />
              {legendProps && <Legend {...legendProps} wrapperStyle={{ fontSize }} />}
              <Scatter 
                name={config.yField}
                data={chartData} 
                fill={chartColors[4]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis 
                dataKey={config.xField}
                tick={{ fontSize }}
                stroke="#6b7280"
                tickFormatter={formatAxisNumber}
              />
              <YAxis 
                tick={{ fontSize }}
                stroke="#6b7280"
                domain={yAxisDomain}
                tickFormatter={formatAxisNumber}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: fontSize
                }}
              />
              {legendProps && <Legend {...legendProps} wrapperStyle={{ fontSize }} />}
              <Area 
                type="monotone"
                dataKey={config.yField} 
                stroke={chartColors[0]}
                fill={chartColors[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            Неизвестный тип графика: {config.type}
          </div>
        );
    }
  };

  if (!data || !config || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Нет данных для отображения
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Заголовок (опционально, только если указан) */}
      {config.title && (
        <div className="px-2 py-1 border-b border-gray-200 bg-gray-50">
          <h4 className="text-xs font-semibold text-gray-800 truncate">
            {config.title}
          </h4>
        </div>
      )}

      {/* График */}
      <div style={{ 
        height: config.title ? 'calc(100% - 28px)' : '100%',
        width: '100%'
      }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartRendererCompact;