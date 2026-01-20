import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Table2,
  Map,
  Type,
  TrendingUp,
  Square,
  Circle,
  Minus,
  Plus,
  GripVertical,
  Image as ImageIcon
} from 'lucide-react';

/**
 * Палитра элементов для добавления на canvas
 * Организована по категориям: графики, таблицы, карты, текст, KPI, фигуры, изображения
 */
function ElementPalette({ datasets, onAddElement }) {
  // Состояние открытых/закрытых секций
  const [expandedSections, setExpandedSections] = useState({
    charts: true,
    tables: true,
    maps: true,
    text: true,
    kpi: true,
    shapes: true,
    images: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Проверка наличия датасетов с картами
  const hasMapDatasets = datasets.some(d => d.hasMap);

  // ========================
  // HANDLERS
  // ========================

  const handleAddChart = (dataset, chart) => {
    onAddElement({
      type: 'chart',
      datasetId: dataset.id,
      config: {
        chartId: chart.id,
        title: chart.title,
        type: chart.type,
        xField: chart.xField,
        yField: chart.yField
      }
    });
  };

  const handleAddTable = (dataset) => {
    onAddElement({
      type: 'table',
      datasetId: dataset.id,
      config: {
        columns: Object.keys(dataset.data[0] || {}),
        rowsPerPage: 10
      }
    });
  };

  const handleAddMap = (dataset) => {
    onAddElement({
      type: 'map',
      datasetId: dataset.id,
      width: 500,
      height: 400,
      config: {
        mode: 'markers'
      }
    });
  };

  const handleAddText = (textType) => {
    const configs = {
      h1: { 
        content: 'Заголовок', 
        fontSize: '32px', 
        fontWeight: 'bold' 
      },
      p: { 
        content: 'Текст параграфа...', 
        fontSize: '16px', 
        fontWeight: 'normal' 
      },
      list: { 
        content: '• Элемент 1\n• Элемент 2\n• Элемент 3', 
        fontSize: '16px', 
        fontWeight: 'normal' 
      }
    };

    onAddElement({
      type: 'text',
      width: 400,
      height: textType === 'h1' ? 80 : 150,
      config: configs[textType]
    });
  };

  const handleAddKPI = () => {
    onAddElement({
      type: 'kpi',
      width: 250,
      height: 200,
      config: {
        label: 'KPI Метрика',
        value: '0',
        icon: '📈',
        color: '#3b82f6'
      }
    });
  };

  const handleAddShape = (shapeType) => {
    const sizes = {
      rectangle: { width: 300, height: 200 },
      circle: { width: 200, height: 200 },
      line: { width: 300, height: 5 }
    };

    onAddElement({
      type: 'shape',
      width: sizes[shapeType].width,
      height: sizes[shapeType].height,
      config: {
        shape: shapeType,
        fill: '#3b82f6',
        opacity: 1
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        onAddElement({
          type: 'image',
          width: 400,
          height: 300,
          config: {
            imageUrl: event.target.result,
            altText: file.name,
            objectFit: 'contain'
          }
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // ========================
  // КОМПОНЕНТЫ
  // ========================

  const Section = ({ id, title, icon: Icon, children, count }) => {
    const isExpanded = expandedSections[id];

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-800 text-sm">{title}</span>
            {count !== undefined && (
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 py-2 space-y-2">
            {children}
          </div>
        )}
      </div>
    );
  };

  const DraggableItem = ({ onClick, icon, label, color = 'blue', dragData }) => {
    const colorClasses = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700',
      gray: 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
    };

    const handleDragStart = (e) => {
      if (dragData) {
        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
      }
    };

    return (
      <button
        onClick={onClick}
        draggable
        onDragStart={handleDragStart}
        className={`w-full px-3 py-2 rounded-lg border-2 transition-all cursor-move flex items-center space-x-2 ${colorClasses[color]}`}
      >
        <GripVertical className="w-3 h-3 opacity-50" />
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium flex-1 text-left truncate">{label}</span>
      </button>
    );
  };

  // ========================
  // RENDER
  // ========================

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto h-full flex flex-col">
      {/* Заголовок */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-white">
        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
          <Plus className="w-5 h-5 text-pink-600" />
          <span>Палитра элементов</span>
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Перетащите элементы на холст
        </p>
      </div>

      {/* Секции */}
      <div className="flex-1">
        {/* ГРАФИКИ */}
        <Section 
          id="charts" 
          title="Графики" 
          icon={BarChart3}
          count={datasets.reduce((sum, d) => sum + d.charts.length, 0)}
        >
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <div key={dataset.id} className="space-y-2">
                {/* Заголовок датасета */}
                <div className="flex items-center space-x-2 mt-3 mb-2">
                  <div className="h-px bg-gray-300 flex-1" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    🏷️ {dataset.name}
                  </span>
                  <div className="h-px bg-gray-300 flex-1" />
                </div>

                {/* Графики датасета */}
                {dataset.charts.length > 0 ? (
                  dataset.charts.map(chart => (
                    <DraggableItem
                      key={chart.id}
                      onClick={() => handleAddChart(dataset, chart)}
                      icon="📊"
                      label={chart.title}
                      color="blue"
                      dragData={{
                        type: 'chart',
                        datasetId: dataset.id,
                        config: {
                          chartId: chart.id,
                          title: chart.title,
                          type: chart.type,
                          xField: chart.xField,
                          yField: chart.yField
                        }
                      }}
                    />
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-2">
                    Графиков нет
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-3">
              Загрузите датасет для создания графиков
            </p>
          )}

          {/* Кнопка создания нового графика */}
          <button className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Создать новый график</span>
          </button>
        </Section>

        {/* ТАБЛИЦЫ */}
        <Section id="tables" title="Таблицы" icon={Table2} count={datasets.length}>
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <DraggableItem
                key={dataset.id}
                onClick={() => handleAddTable(dataset)}
                icon="📋"
                label={`Таблица: ${dataset.name}`}
                color="green"
                dragData={{
                  type: 'table',
                  datasetId: dataset.id,
                  config: {
                    columns: Object.keys(dataset.data[0] || {}),
                    rowsPerPage: 10
                  }
                }}
              />
            ))
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-3">
              Загрузите датасет для добавления таблиц
            </p>
          )}
        </Section>

        {/* КАРТЫ */}
        <Section id="maps" title="Карты" icon={Map} count={datasets.filter(d => d.hasMap).length}>
          {hasMapDatasets ? (
            datasets
              .filter(d => d.hasMap)
              .map(dataset => (
                <DraggableItem
                  key={dataset.id}
                  onClick={() => handleAddMap(dataset)}
                  icon="🗺️"
                  label={`Карта: ${dataset.name}`}
                  color="purple"
                  dragData={{
                    type: 'map',
                    datasetId: dataset.id,
                    width: 500,
                    height: 400,
                    config: { mode: 'markers' }
                  }}
                />
              ))
          ) : (
            <p className="text-xs text-gray-500 italic text-center py-3">
              Нет датасетов с координатами
            </p>
          )}
        </Section>

        {/* ТЕКСТ */}
        <Section id="text" title="Текст" icon={Type}>
          <DraggableItem
            onClick={() => handleAddText('h1')}
            icon="H1"
            label="Заголовок"
            color="gray"
            dragData={{
              type: 'text',
              width: 400,
              height: 80,
              config: { content: 'Заголовок', fontSize: '32px', fontWeight: 'bold' }
            }}
          />
          <DraggableItem
            onClick={() => handleAddText('p')}
            icon="P"
            label="Параграф"
            color="gray"
            dragData={{
              type: 'text',
              width: 400,
              height: 150,
              config: { content: 'Текст параграфа...', fontSize: '16px', fontWeight: 'normal' }
            }}
          />
          <DraggableItem
            onClick={() => handleAddText('list')}
            icon="≡"
            label="Список"
            color="gray"
            dragData={{
              type: 'text',
              width: 400,
              height: 150,
              config: { content: '• Элемент 1\n• Элемент 2\n• Элемент 3', fontSize: '16px', fontWeight: 'normal' }
            }}
          />
        </Section>

        {/* KPI МЕТРИКИ */}
        <Section id="kpi" title="KPI Метрики" icon={TrendingUp}>
          <DraggableItem
            onClick={handleAddKPI}
            icon="📈"
            label="Новая KPI карточка"
            color="pink"
            dragData={{
              type: 'kpi',
              width: 250,
              height: 200,
              config: {
                label: 'KPI Метрика',
                value: '0',
                icon: '📈',
                color: '#3b82f6'
              }
            }}
          />
        </Section>

        {/* ФИГУРЫ */}
        <Section id="shapes" title="Фигуры" icon={Square}>
          <DraggableItem
            onClick={() => handleAddShape('rectangle')}
            icon="▭"
            label="Прямоугольник"
            color="gray"
            dragData={{
              type: 'shape',
              width: 300,
              height: 200,
              config: { shape: 'rectangle', fill: '#3b82f6', opacity: 1 }
            }}
          />
          <DraggableItem
            onClick={() => handleAddShape('circle')}
            icon="●"
            label="Круг"
            color="gray"
            dragData={{
              type: 'shape',
              width: 200,
              height: 200,
              config: { shape: 'circle', fill: '#3b82f6', opacity: 1 }
            }}
          />
          <DraggableItem
            onClick={() => handleAddShape('line')}
            icon="─"
            label="Линия"
            color="gray"
            dragData={{
              type: 'shape',
              width: 300,
              height: 5,
              config: { shape: 'line', fill: '#3b82f6', opacity: 1 }
            }}
          />
        </Section>

        {/* ИЗОБРАЖЕНИЯ */}
        <Section id="images" title="Изображения" icon={ImageIcon}>
          <div className="space-y-2">
            <label className="block cursor-pointer">
              <div className="w-full px-3 py-3 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all bg-blue-50 hover:bg-blue-100">
                <div className="flex flex-col items-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Загрузить изображение</span>
                  <span className="text-xs text-blue-600">JPG, PNG, GIF до 5MB</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </Section>
      </div>

      {/* Подсказка внизу */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-900">Совет</p>
            <p className="text-xs text-blue-700 mt-1">
              Нажмите на элемент или перетащите его на холст
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ElementPalette;