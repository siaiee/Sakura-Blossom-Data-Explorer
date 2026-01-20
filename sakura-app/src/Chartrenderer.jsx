import React, { useMemo } from 'react';
import { X } from 'lucide-react';
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

const ChartRenderer = ({ data, config, settings, onRemove }) => {

  const chartColors = settings?.chartColors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const chartStyle = settings?.chartStyle || {
    rounded: true,
    grid: true,
    legend: 'bottom',
    animation: true
  };

  const chartData = useMemo(() => {
    if (!data || !config) return [];

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

    return data.map(item => ({
      [config.xField]: item[config.xField],
      [config.yField]: Number(item[config.yField]) || 0
    }));
  }, [data, config]);

  const legendProps = useMemo(() => {
    if (chartStyle.legend === 'none') {
      return null;
    }

    const positions = {
      top: { verticalAlign: 'top', height: 36 },
      bottom: { verticalAlign: 'bottom', height: 36 },
      right: { layout: 'vertical', verticalAlign: 'middle', align: 'right' }
    };

    return positions[chartStyle.legend] || positions.bottom;
  }, [chartStyle.legend]);

  const renderChart = () => {
    const commonProps = {
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const gridProps = chartStyle.grid ? {
      strokeDasharray: "3 3",
      stroke: "#e5e7eb"
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis
                dataKey={config.xField}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {legendProps && <Legend {...legendProps} />}
              <Bar
                dataKey={config.yField}
                fill={chartColors[0]}
                radius={chartStyle.rounded ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis
                dataKey={config.xField}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {legendProps && <Legend {...legendProps} />}
              <Line
                type="monotone"
                dataKey={config.yField}
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart {...animationProps}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
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
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {legendProps && <Legend {...legendProps} />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis
                type="number"
                dataKey={config.xField}
                name={config.xField}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                type="number"
                dataKey={config.yField}
                name={config.yField}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {legendProps && <Legend {...legendProps} />}
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} {...commonProps} {...animationProps}>
              {chartStyle.grid && <CartesianGrid {...gridProps} />}
              <XAxis
                dataKey={config.xField}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {legendProps && <Legend {...legendProps} />}
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
          <div className="flex items-center justify-center h-64 text-gray-400">
            Неизвестный тип графика: {config.type}
          </div>
        );
    }
  };

  if (!data || !config) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 hover:border-sakura-300 transition-all">
      { }
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sakura-50 to-white">
        <h4 className="text-lg font-bold text-gray-800">
          {config.title}
        </h4>

        <button
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          title="Удалить график"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      { }
      <div className="p-6">
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Нет данных для отображения
          </div>
        )}
      </div>

      { }
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Ось X: <span className="font-semibold">{config.xField}</span>
          </span>
          <span>
            Ось Y: <span className="font-semibold">{config.yField}</span>
          </span>
          <span>
            Точек данных: <span className="font-semibold">{chartData.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChartRenderer;
