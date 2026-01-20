import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

const FilterPanel = ({ dataTypes, data, onFilterChange }) => {

  const [filters, setFilters] = useState({});

  const [expandedFields, setExpandedFields] = useState({});

  const [uniqueValues, setUniqueValues] = useState({});

  const [searchQueries, setSearchQueries] = useState({});

  useEffect(() => {
    if (!dataTypes || !data) return;

    const values = {};
    Object.entries(dataTypes).forEach(([field, typeInfo]) => {
      const type = typeof typeInfo === 'string' ? typeInfo : typeInfo.type;
      if (type === 'string') {
        const unique = [...new Set(data.map(row => row[field]).filter(v => v != null))];
        values[field] = unique.slice(0, 100);
      }
    });
    setUniqueValues(values);

    const initialExpanded = {};
    Object.keys(dataTypes).slice(0, 3).forEach(field => {
      initialExpanded[field] = true;
    });
    setExpandedFields(initialExpanded);
  }, [dataTypes, data]);

  const toggleField = (field) => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateFilter = (field, filterData) => {
    const newFilters = {
      ...filters,
      [field]: filterData
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const removeFilter = (field) => {
    const newFilters = { ...filters };
    delete newFilters[field];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetAllFilters = () => {
    setFilters({});
    setSearchQueries({});
    onFilterChange({});
  };

  const isFilterActive = (field) => {
    return filters[field] !== undefined;
  };

  const getFieldType = (typeInfo) => {
    return typeof typeInfo === 'string' ? typeInfo : typeInfo.type;
  };

  const renderRangeFilter = (field) => {
    const values = data.map(row => row[field]).filter(v => v != null && !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);

    const currentFilter = filters[field] || { type: 'range', min, max };

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Минимум</label>
            <input
              type="number"
              value={currentFilter.min}
              onChange={(e) => updateFilter(field, {
                ...currentFilter,
                min: parseFloat(e.target.value) || min
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder={min.toString()}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Максимум</label>
            <input
              type="number"
              value={currentFilter.max}
              onChange={(e) => updateFilter(field, {
                ...currentFilter,
                max: parseFloat(e.target.value) || max
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder={max.toString()}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Диапазон данных: {min.toFixed(2)} — {max.toFixed(2)}
        </div>
      </div>
    );
  };

  const renderSelectFilter = (field) => {
    const values = uniqueValues[field] || [];
    const currentFilter = filters[field] || { type: 'select', values: [] };
    const searchQuery = searchQueries[field] || '';

    const filteredValues = values.filter(val =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleValue = (value) => {
      const newValues = currentFilter.values.includes(value)
        ? currentFilter.values.filter(v => v !== value)
        : [...currentFilter.values, value];

      updateFilter(field, {
        type: 'select',
        values: newValues
      });
    };

    return (
      <div className="space-y-3">
        { }
        {values.length > 10 && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQueries(prev => ({
              ...prev,
              [field]: e.target.value
            }))}
            placeholder="Поиск значений..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        )}

        { }
        <div className="max-h-48 overflow-y-auto space-y-2">
          {filteredValues.length > 0 ? (
            filteredValues.map(value => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={currentFilter.values.includes(value)}
                  onChange={() => toggleValue(value)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">{value}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Не найдено</p>
          )}
        </div>

        { }
        {currentFilter.values.length > 0 && (
          <div className="text-xs text-pink-600 font-medium">
            Выбрано: {currentFilter.values.length}
          </div>
        )}
      </div>
    );
  };

  const renderDateFilter = (field) => {
    const dates = data.map(row => row[field]).filter(v => v != null);
    const sortedDates = dates.sort();
    const minDate = sortedDates[0];
    const maxDate = sortedDates[sortedDates.length - 1];

    const currentFilter = filters[field] || { type: 'date', from: minDate, to: maxDate };

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">От</label>
            <input
              type="date"
              value={currentFilter.from}
              onChange={(e) => updateFilter(field, {
                ...currentFilter,
                from: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">До</label>
            <input
              type="date"
              value={currentFilter.to}
              onChange={(e) => updateFilter(field, {
                ...currentFilter,
                to: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Диапазон данных: {minDate} — {maxDate}
        </div>
      </div>
    );
  };

  const renderFieldFilter = (field, typeInfo) => {
    const type = getFieldType(typeInfo);
    const label = typeof typeInfo === 'object' ? typeInfo.label : type;

    if (type === 'coordinate') return null;

    const isExpanded = expandedFields[field];
    const isActive = isFilterActive(field);

    return (
      <div key={field} className="border-b border-gray-200 last:border-b-0">
        { }
        <button
          onClick={() => toggleField(field)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium text-gray-800 text-sm">{field}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {type}
            </span>
          </div>

          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFilter(field);
              }}
              className="text-pink-600 hover:text-pink-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        { }
        {isExpanded && (
          <div className="px-4 pb-4">
            {type === 'number' && renderRangeFilter(field)}
            {type === 'string' && renderSelectFilter(field)}
            {type === 'date' && renderDateFilter(field)}
          </div>
        )}
      </div>
    );
  };

  if (!dataTypes) return null;

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      { }
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-bold text-gray-800">Фильтры</h3>
          </div>

          {activeFilterCount > 0 && (
            <span className="bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="w-full mt-2 px-3 py-2 bg-white hover:bg-gray-50 text-pink-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2 border border-pink-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Сбросить все фильтры</span>
          </button>
        )}
      </div>

      { }
      <div className="max-h-[600px] overflow-y-auto">
        {Object.entries(dataTypes).map(([field, typeInfo]) =>
          renderFieldFilter(field, typeInfo)
        )}
      </div>

      { }
      {Object.keys(dataTypes).length === 0 && (
        <div className="p-8 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Нет доступных полей для фильтрации
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
