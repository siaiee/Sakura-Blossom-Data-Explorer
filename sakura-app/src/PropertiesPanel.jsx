import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import {
  Settings,
  Trash2,
  Type,
  Palette,
  Move,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  TrendingUp
} from 'lucide-react';

/**
 * Панель свойств для редактирования выбранного элемента
 * Отображает разные настройки в зависимости от типа элемента
 */
function PropertiesPanel({ element, datasets, onUpdate, onDelete }) {
  const [localConfig, setLocalConfig] = useState(element?.config || {});
  const [localGeometry, setLocalGeometry] = useState({
    x: element?.x || 0,
    y: element?.y || 0,
    width: element?.width || 0,
    height: element?.height || 0
  });

  // Обновляем локальный конфиг и геометрию при смене элемента
  useEffect(() => {
    if (element) {
      setLocalConfig(element.config || {});
      setLocalGeometry({
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 0,
        height: element.height || 0
      });
    }
  }, [element?.id]); // Только при смене ID элемента!

  // Обновление конфига элемента
  const updateConfig = (updates) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    // НЕ вызываем onUpdate сразу - это сбивает выделение
  };

  const applyConfig = () => {
    onUpdate(element.id, { config: localConfig });
  };

  // Обновление позиции/размера - сначала локально, потом применяем
  const updateGeometry = (field, value) => {
    const numValue = Number(value);
    setLocalGeometry(prev => ({ ...prev, [field]: numValue }));
  };

  // Применение изменений геометрии при потере фокуса или Enter
  const applyGeometry = () => {
    onUpdate(element.id, localGeometry);
  };

  // Если элемент не выбран
  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Нет выбранного элемента
          </h3>
          <p className="text-sm text-gray-600">
            Выберите элемент на холсте, чтобы увидеть его свойства
          </p>
        </div>
      </div>
    );
  }

  // Получаем датасет элемента
  const dataset = datasets.find(d => d.id === element.datasetId);

  // ========================
  // КОМПОНЕНТЫ
  // ========================

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, onBlur, type = 'text', ...props }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onBlur) {
            onBlur();
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        {...props}
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ColorPicker = ({ label, value, onChange }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
        />
      </div>
    </div>
  );

  // ========================
  // РЕНДЕР СВОЙСТВ ПО ТИПУ
  // ========================

  const renderProperties = () => {
    switch (element.type) {
      case 'chart':
        return (
          <>
            <Section title="📊 График">
              <SelectField
                label="Датасет"
                value={element.datasetId || ''}
                onChange={(val) => onUpdate(element.id, { datasetId: val })}
                options={[
                  { value: '', label: 'Выберите датасет' },
                  ...datasets.map(d => ({ value: d.id, label: d.name }))
                ]}
              />

              {dataset && (
                <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-blue-900 font-medium">
                    📋 {dataset.name}
                  </p>
                  <p className="text-blue-700 mt-1">
                    {dataset.data.length} строк • {Object.keys(dataset.data[0] || {}).length} колонок
                  </p>
                </div>
              )}

              <InputField
                label="Заголовок"
                value={localConfig.title || ''}
                onChange={(val) => updateConfig({ title: val })}
                placeholder="Название графика"
              />
            </Section>
          </>
        );

      case 'table':
        return (
          <>
            <Section title="📋 Таблица">
              <SelectField
                label="Датасет"
                value={element.datasetId || ''}
                onChange={(val) => onUpdate(element.id, { datasetId: val })}
                options={[
                  { value: '', label: 'Выберите датасет' },
                  ...datasets.map(d => ({ value: d.id, label: d.name }))
                ]}
              />

              <SelectField
                label="Строк на странице"
                value={localConfig.rowsPerPage || 10}
                onChange={(val) => updateConfig({ rowsPerPage: Number(val) })}
                options={[
                  { value: 5, label: '5 строк' },
                  { value: 10, label: '10 строк' },
                  { value: 25, label: '25 строк' },
                  { value: 50, label: '50 строк' }
                ]}
              />

              {dataset && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Отображаемые колонки
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                    {Object.keys(dataset.data[0] || {}).map(col => (
                      <label key={col} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(localConfig.columns || []).includes(col)}
                          onChange={(e) => {
                            const cols = localConfig.columns || Object.keys(dataset.data[0] || {});
                            const newCols = e.target.checked
                              ? [...cols, col]
                              : cols.filter(c => c !== col);
                            updateConfig({ columns: newCols });
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-700">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </>
        );

        case 'image':
          return (
            <>
              <Section title="🖼️ Изображение">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Загрузить новое изображение
                  </label>
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">Выбрать файл</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.size <= 5 * 1024 * 1024) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            updateConfig({ 
                              imageUrl: event.target.result,
                              altText: file.name 
                            });
                          };
                          reader.readAsDataURL(file);
                        } else {
                          alert('Файл слишком большой (max 5MB)');
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
        
                <InputField
                  label="Альтернативный текст"
                  value={localConfig.altText || ''}
                  onChange={(val) => updateConfig({ altText: val })}
                  placeholder="Описание изображения"
                />
        
                <SelectField
                  label="Режим отображения"
                  value={localConfig.objectFit || 'contain'}
                  onChange={(val) => updateConfig({ objectFit: val })}
                  options={[
                    { value: 'contain', label: 'Вписать (contain)' },
                    { value: 'cover', label: 'Заполнить (cover)' },
                    { value: 'fill', label: 'Растянуть (fill)' },
                    { value: 'none', label: 'Оригинальный размер' }
                  ]}
                />
        
                {localConfig.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Предпросмотр:</p>
                    <img 
                      src={localConfig.imageUrl}
                      alt="preview"
                      className="w-full h-32 object-contain border border-gray-200 rounded"
                    />
                  </div>
                )}
              </Section>
            </>
          );

      case 'text':
        return (
          <>
            <Section title="📝 Текст">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Содержимое
                </label>
                <textarea
                  value={localConfig.content || ''}
                  onChange={(e) => updateConfig({ content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Введите текст..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SelectField
                  label="Размер шрифта"
                  value={localConfig.fontSize || '16px'}
                  onChange={(val) => updateConfig({ fontSize: val })}
                  options={[
                    { value: '12px', label: '12px' },
                    { value: '14px', label: '14px' },
                    { value: '16px', label: '16px' },
                    { value: '18px', label: '18px' },
                    { value: '24px', label: '24px' },
                    { value: '32px', label: '32px' },
                    { value: '48px', label: '48px' }
                  ]}
                />

                <ColorPicker
                  label="Цвет"
                  value={localConfig.color || '#000000'}
                  onChange={(val) => updateConfig({ color: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Стиль текста
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateConfig({ 
                      fontWeight: localConfig.fontWeight === 'bold' ? 'normal' : 'bold' 
                    })}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      localConfig.fontWeight === 'bold'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateConfig({ 
                      fontStyle: localConfig.fontStyle === 'italic' ? 'normal' : 'italic' 
                    })}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      localConfig.fontStyle === 'italic'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Выравнивание
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight }
                  ].map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => updateConfig({ textAlign: value })}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 transition-colors flex items-center justify-center ${
                        localConfig.textAlign === value
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </Section>
          </>
        );

      case 'kpi':
        return (
          <>
            <Section title="📈 KPI Метрика">
              <SelectField
                label="Датасет"
                value={element.datasetId || ''}
                onChange={(val) => onUpdate(element.id, { datasetId: val })}
                options={[
                  { value: '', label: 'Вручную' },
                  ...datasets.map(d => ({ value: d.id, label: d.name }))
                ]}
              />

              {dataset && (
                <>
                  <SelectField
                    label="Поле для расчета"
                    value={localConfig.field || ''}
                    onChange={(val) => updateConfig({ field: val })}
                    options={[
                      { value: '', label: 'Выберите поле' },
                      ...Object.entries(dataset.dataTypes || {})
                        .filter(([_, type]) => type === 'number')
                        .map(([field]) => ({ value: field, label: field }))
                    ]}
                  />

                  <SelectField
                    label="Функция"
                    value={localConfig.function || 'sum'}
                    onChange={(val) => updateConfig({ function: val })}
                    options={[
                      { value: 'sum', label: 'Сумма' },
                      { value: 'avg', label: 'Среднее' },
                      { value: 'max', label: 'Максимум' },
                      { value: 'min', label: 'Минимум' },
                      { value: 'count', label: 'Количество' }
                    ]}
                  />
                </>
              )}

              <InputField
                label="Значение (вручную)"
                value={localConfig.value || ''}
                onChange={(val) => updateConfig({ value: val })}
                placeholder="0"
                disabled={!!element.datasetId}
              />

              <InputField
                label="Подпись"
                value={localConfig.label || ''}
                onChange={(val) => updateConfig({ label: val })}
                placeholder="Название метрики"
              />

              <InputField
                label="Иконка (эмодзи)"
                value={localConfig.icon || ''}
                onChange={(val) => updateConfig({ icon: val })}
                placeholder="📈"
              />

              <ColorPicker
                label="Цвет"
                value={localConfig.color || '#3b82f6'}
                onChange={(val) => updateConfig({ color: val })}
              />
            </Section>
          </>
        );

      case 'map':
        return (
          <>
            <Section title="🗺️ Карта">
              <SelectField
                label="Датасет"
                value={element.datasetId || ''}
                onChange={(val) => onUpdate(element.id, { datasetId: val })}
                options={[
                  { value: '', label: 'Выберите датасет' },
                  ...datasets.filter(d => d.hasMap).map(d => ({ value: d.id, label: d.name }))
                ]}
              />

              <SelectField
                label="Режим отображения"
                value={localConfig.mode || 'markers'}
                onChange={(val) => updateConfig({ mode: val })}
                options={[
                  { value: 'markers', label: 'Точки на карте' },
                  { value: 'heatmap', label: 'Тепловая карта' },
                  { value: 'clusters', label: 'Кластеры' },
                  { value: 'routes', label: 'Маршруты' }
                ]}
              />
            </Section>
          </>
        );

      case 'shape':
        return (
          <>
            <Section title="🎨 Фигура">
              <SelectField
                label="Тип фигуры"
                value={localConfig.shape || 'rectangle'}
                onChange={(val) => updateConfig({ shape: val })}
                options={[
                  { value: 'rectangle', label: 'Прямоугольник' },
                  { value: 'circle', label: 'Круг' },
                  { value: 'line', label: 'Линия' }
                ]}
              />

              <ColorPicker
                label="Цвет заливки"
                value={localConfig.fill || '#3b82f6'}
                onChange={(val) => updateConfig({ fill: val })}
              />

              <InputField
                label="Прозрачность"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localConfig.opacity || 1}
                onChange={(val) => updateConfig({ opacity: Number(val) })}
              />
            </Section>
          </>
        );

      default:
        return (
          <div className="text-sm text-gray-500 text-center py-6">
            Неизвестный тип элемента: {element.type}
          </div>
        );
    }
  };

  // ========================
  // RENDER
  // ========================

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full flex flex-col">
      {/* Заголовок */}
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <h3 className="font-bold text-gray-800 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Свойства элемента</span>
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {element.type === 'chart' && '📊 График'}
          {element.type === 'table' && '📋 Таблица'}
          {element.type === 'text' && '📝 Текст'}
          {element.type === 'kpi' && '📈 KPI Метрика'}
          {element.type === 'map' && '🗺️ Карта'}
          {element.type === 'shape' && '🎨 Фигура'}
        </p>
      </div>

      {/* Контент */}
      <div className="flex-1 px-4 py-4">
        {/* Геометрия (общая для всех) */}
        <Section title="📐 Размеры и позиция">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Ширина (px)"
              type="number"
              value={localGeometry.width}
              onChange={(val) => updateGeometry('width', val)}
              onBlur={applyGeometry}
            />
            <InputField
              label="Высота (px)"
              type="number"
              value={localGeometry.height}
              onChange={(val) => updateGeometry('height', val)}
              onBlur={applyGeometry}
            />
            <InputField
              label="X позиция"
              type="number"
              value={localGeometry.x}
              onChange={(val) => updateGeometry('x', val)}
              onBlur={applyGeometry}
            />
            <InputField
              label="Y позиция"
              type="number"
              value={localGeometry.y}
              onChange={(val) => updateGeometry('y', val)}
              onBlur={applyGeometry}
            />
          </div>
        </Section>

        {/* Специфичные свойства */}
        {renderProperties()}
      </div>

      {/* Футер с кнопкой удаления */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            if (window.confirm('Удалить этот элемент?')) {
              onDelete(element.id);
            }
          }}
          className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Удалить элемент</span>
        </button>
      </div>
    </div>
  );
}

export default PropertiesPanel;