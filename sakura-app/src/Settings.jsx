import React, { useState } from 'react';
import { Check, Palette, Table2, Download, Sliders } from 'lucide-react';

function Settings({ settings, onSettingsChange, columns = [] }) {
  const [activeTab, setActiveTab] = useState('general');
  const [localSettings, setLocalSettings] = useState(settings);

  const themes = [
    { id: 'sakura-pink', name: 'Sakura Pink', primary: '#ec4899', gradient: 'from-pink-400 to-pink-600' },
    { id: 'ocean-blue', name: 'Ocean Blue', primary: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
    { id: 'forest-green', name: 'Forest Green', primary: '#10b981', gradient: 'from-green-400 to-green-600' },
    { id: 'sunset-orange', name: 'Sunset Orange', primary: '#f59e0b', gradient: 'from-orange-400 to-orange-600' }
  ];

  const colorPalettes = {
    vibrant: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    pastel: ['#fbbf24', '#a78bfa', '#34d399', '#fb923c', '#60a5fa', '#f472b6'],
    dark: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
    earth: ['#78350f', '#92400e', '#a16207', '#047857', '#065f46', '#164e63']
  };

  const handleChange = (section, key, value) => {
    const updated = {
      ...localSettings,
      [section]: {
        ...localSettings[section],
        [key]: value
      }
    };
    setLocalSettings(updated);
  };

  const handleSimpleChange = (key, value) => {
    const updated = {
      ...localSettings,
      [key]: value
    };
    setLocalSettings(updated);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  const handleColumnToggle = (column) => {
    const hiddenColumns = localSettings.tableSettings.hiddenColumns || [];
    const updated = hiddenColumns.includes(column)
      ? hiddenColumns.filter(c => c !== column)
      : [...hiddenColumns, column];
    
    handleChange('tableSettings', 'hiddenColumns', updated);
  };

  const isColumnHidden = (column) => {
    return (localSettings.tableSettings.hiddenColumns || []).includes(column);
  };

  const tabs = [
    { id: 'general', name: 'Общие', icon: Sliders },
    { id: 'charts', name: 'Графики', icon: Palette },
    { id: 'table', name: 'Таблица', icon: Table2 },
    { id: 'export', name: 'Экспорт', icon: Download }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Sliders className="w-6 h-6 mr-2" />
          Настройки дашборда
        </h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Название дашборда
              </label>
              <input
                type="text"
                value={localSettings.title}
                onChange={(e) => handleSimpleChange('title', e.target.value)}
                placeholder="Введите название..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={localSettings.description}
                onChange={(e) => handleSimpleChange('description', e.target.value)}
                placeholder="Опишите данные или цель дашборда..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Цветовая схема
              </label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSimpleChange('theme', theme.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      localSettings.theme === theme.id
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-lg`} />
                      <div className="text-left">
                        <div className="font-semibold text-gray-800">{theme.name}</div>
                        <div className="text-xs text-gray-500">{theme.primary}</div>
                      </div>
                    </div>
                    {localSettings.theme === theme.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chart Settings */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Цветовая палитра графиков
              </label>
              <div className="space-y-3">
                {Object.entries(colorPalettes).map(([key, colors]) => (
                  <button
                    key={key}
                    onClick={() => handleSimpleChange('chartColors', colors)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      JSON.stringify(localSettings.chartColors) === JSON.stringify(colors)
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 capitalize">{key}</span>
                      <div className="flex space-x-1">
                        {colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Стиль графиков
              </label>
              <div className="space-y-3">
                <ToggleOption
                  label="Скругленные углы"
                  checked={localSettings.chartStyle.rounded}
                  onChange={(val) => handleChange('chartStyle', 'rounded', val)}
                />
                <ToggleOption
                  label="Показывать сетку"
                  checked={localSettings.chartStyle.grid}
                  onChange={(val) => handleChange('chartStyle', 'grid', val)}
                />
                <ToggleOption
                  label="Анимация"
                  checked={localSettings.chartStyle.animation}
                  onChange={(val) => handleChange('chartStyle', 'animation', val)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Позиция легенды
              </label>
              <select
                value={localSettings.chartStyle.legend}
                onChange={(e) => handleChange('chartStyle', 'legend', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="top">Сверху</option>
                <option value="bottom">Снизу</option>
                <option value="right">Справа</option>
                <option value="none">Скрыть</option>
              </select>
            </div>
          </div>
        )}

        {/* Table Settings */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Строк на странице
              </label>
              <select
                value={localSettings.tableSettings.rowsPerPage}
                onChange={(e) => handleChange('tableSettings', 'rowsPerPage', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value={10}>10 строк</option>
                <option value={25}>25 строк</option>
                <option value={50}>50 строк</option>
                <option value={100}>100 строк</option>
                <option value={1000}>Все строки</option>
              </select>
            </div>

            <ToggleOption
              label="Чередование цветов строк"
              checked={localSettings.tableSettings.striped}
              onChange={(val) => handleChange('tableSettings', 'striped', val)}
            />

            {columns.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Видимость колонок
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {columns.map((column) => (
                      <label
                        key={column}
                        className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!isColumnHidden(column)}
                          onChange={() => handleColumnToggle(column)}
                          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700">{column}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Скрытые колонки не будут отображаться в таблице
                </p>
              </div>
            )}
          </div>
        )}

        {/* Export Settings */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Формат даты
              </label>
              <select
                value={localSettings.exportSettings.dateFormat}
                onChange={(e) => handleChange('exportSettings', 'dateFormat', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="DD.MM.YYYY">ДД.ММ.ГГГГ (31.12.2024)</option>
                <option value="MM/DD/YYYY">ММ/ДД/ГГГГ (12/31/2024)</option>
                <option value="YYYY-MM-DD">ГГГГ-ММ-ДД (2024-12-31)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Разделитель тысяч
              </label>
              <select
                value={localSettings.exportSettings.numberSeparator}
                onChange={(e) => handleChange('exportSettings', 'numberSeparator', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value=" ">Пробел (1 000 000)</option>
                <option value=",">Запятая (1,000,000)</option>
                <option value=".">Точка (1.000.000)</option>
                <option value="">Без разделителя (1000000)</option>
              </select>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Включить в экспорт
              </label>
              <div className="space-y-3">
                <ToggleOption
                  label="Таблица данных"
                  checked={localSettings.exportSettings.includeTable}
                  onChange={(val) => handleChange('exportSettings', 'includeTable', val)}
                />
                <ToggleOption
                  label="Все графики"
                  checked={localSettings.exportSettings.includeCharts}
                  onChange={(val) => handleChange('exportSettings', 'includeCharts', val)}
                />
                <ToggleOption
                  label="Карта (если доступна)"
                  checked={localSettings.exportSettings.includeMap}
                  onChange={(val) => handleChange('exportSettings', 'includeMap', val)}
                />
                <ToggleOption
                  label="Описание дашборда"
                  checked={localSettings.exportSettings.includeDescription}
                  onChange={(val) => handleChange('exportSettings', 'includeDescription', val)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Изменения применяются в реальном времени
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>Сохранить настройки</span>
        </button>
      </div>
    </div>
  );
}

function ToggleOption({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-pink-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;