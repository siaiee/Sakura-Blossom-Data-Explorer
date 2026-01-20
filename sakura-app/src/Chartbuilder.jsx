import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, PieChart, ScatterChart, AreaChart, Info } from 'lucide-react';

const CHART_TYPES = [
  {
    id: 'bar',
    name: 'Столбчатый',
    icon: BarChart3,
    description: 'Сравнение категорий',
    xTypes: ['string', 'date', 'number'],
    yTypes: ['number'],
    color: 'blue'
  },
  {
    id: 'line',
    name: 'Линейный',
    icon: LineChart,
    description: 'Тренды и динамика',
    xTypes: ['string', 'date', 'number'],
    yTypes: ['number'],
    color: 'green'
  },
  {
    id: 'pie',
    name: 'Круговой',
    icon: PieChart,
    description: 'Доли от целого',
    xTypes: ['string'],
    yTypes: ['number'],
    color: 'purple'
  },
  {
    id: 'scatter',
    name: 'Точечный',
    icon: ScatterChart,
    description: 'Корреляция данных',
    xTypes: ['number'],
    yTypes: ['number'],
    color: 'indigo'
  },
  {
    id: 'area',
    name: 'Область',
    icon: AreaChart,
    description: 'Объем во времени',
    xTypes: ['string', 'date', 'number'],
    yTypes: ['number'],
    color: 'cyan'
  }
];

const ChartBuilder = ({ dataTypes, onChartConfig }) => {
  const [selectedType, setSelectedType] = useState('bar');
  const [xField, setXField] = useState('');
  const [yField, setYField] = useState('');
  const [title, setTitle] = useState('');

  const selectedChart = useMemo(
    () => CHART_TYPES.find(t => t.id === selectedType),
    [selectedType]
  );

  const availableXFields = useMemo(() => {
    if (!dataTypes || !selectedChart) return [];

    return Object.entries(dataTypes)
      .filter(([_, info]) => selectedChart.xTypes.includes(info.type))
      .map(([field, info]) => ({
        field,
        label: info.label,
        type: info.type
      }));
  }, [dataTypes, selectedChart]);

  const availableYFields = useMemo(() => {
    if (!dataTypes || !selectedChart) return [];

    return Object.entries(dataTypes)
      .filter(([_, info]) => selectedChart.yTypes.includes(info.type))
      .map(([field, info]) => ({
        field,
        label: info.label,
        type: info.type
      }));
  }, [dataTypes, selectedChart]);

  const isValid = useMemo(() => {
    if (!xField || !yField) return false;

    const xType = dataTypes[xField]?.type;
    const yType = dataTypes[yField]?.type;

    return (
      selectedChart.xTypes.includes(xType) &&
      selectedChart.yTypes.includes(yType)
    );
  }, [xField, yField, dataTypes, selectedChart]);

  const handleCreate = () => {
    if (!isValid) return;

    const config = {
      type: selectedType,
      xField,
      yField,
      title: title || `${selectedChart.name} график`
    };

    onChartConfig(config);

    setXField('');
    setYField('');
    setTitle('');
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);

    setXField('');
    setYField('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-sakura-200">
      { }
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Создать визуализацию
        </h3>
        <p className="text-sm text-gray-600">
          Выберите тип графика и настройте параметры
        </p>
      </div>

      { }
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Тип графика:
        </label>
        <div className="grid grid-cols-5 gap-3">
          {CHART_TYPES.map((chart) => {
            const Icon = chart.icon;
            const isSelected = selectedType === chart.id;

            return (
              <button
                key={chart.id}
                onClick={() => handleTypeChange(chart.id)}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  isSelected
                    ? `border-${chart.color}-500 bg-${chart.color}-50 ring-2 ring-${chart.color}-500`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                title={chart.description}
              >
                <Icon
                  className={`w-8 h-8 mx-auto mb-2 ${
                    isSelected ? `text-${chart.color}-600` : 'text-gray-600'
                  }`}
                />
                <div className={`text-xs font-medium ${
                  isSelected ? `text-${chart.color}-700` : 'text-gray-700'
                }`}>
                  {chart.name}
                </div>
              </button>
            );
          })}
        </div>

        { }
        {selectedChart && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {selectedChart.description}
            </p>
          </div>
        )}
      </div>

      { }
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Название графика (опционально):
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${selectedChart?.name} график`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
      </div>

      { }
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ось X:
        </label>
        <select
          value={xField}
          onChange={(e) => setXField(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        >
          <option value="">Выберите поле</option>
          {availableXFields.map(({ field, label, type }) => (
            <option key={field} value={field}>
              {label} ({type})
            </option>
          ))}
        </select>

        {availableXFields.length === 0 && (
          <p className="mt-2 text-xs text-red-600">
            Нет подходящих полей для оси X (требуется: {selectedChart?.xTypes.join(', ')})
          </p>
        )}
      </div>

      { }
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ось Y:
        </label>
        <select
          value={yField}
          onChange={(e) => setYField(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        >
          <option value="">Выберите поле</option>
          {availableYFields.map(({ field, label, type }) => (
            <option key={field} value={field}>
              {label} ({type})
            </option>
          ))}
        </select>

        {availableYFields.length === 0 && (
          <p className="mt-2 text-xs text-red-600">
            Нет подходящих полей для оси Y (требуется: {selectedChart?.yTypes.join(', ')})
          </p>
        )}
      </div>

      { }
      <button
        onClick={handleCreate}
        disabled={!isValid}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          isValid
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isValid ? 'Создать график' : 'Выберите поля для создания графика'}
      </button>
    </div>
  );
};

export default ChartBuilder;
