import React, { useMemo } from 'react';
import { Table2, Hash, Calendar, Type, MapPin, Info, CheckCircle } from 'lucide-react';
import { detectDataTypes } from './utils/detectDataTypes';

const TYPE_CONFIG = {
  number: {
    icon: Hash,
    label: 'Число',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  date: {
    icon: Calendar,
    label: 'Дата',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300'
  },
  coordinate: {
    icon: MapPin,
    label: 'Координата',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300'
  },
  boolean: {
    icon: CheckCircle,
    label: 'Булево',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300'
  },
  string: {
    icon: Type,
    label: 'Текст',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300'
  }
};

const TypeBadge = ({ type }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.string;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </div>
  );
};

const TypeStats = ({ types }) => {
  const stats = useMemo(() => {
    const counts = { number: 0, date: 0, coordinate: 0, string: 0 };
    Object.values(types).forEach(({ type }) => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [types]);

  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(stats)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          const config = TYPE_CONFIG[type];
          const Icon = config.icon;

          return (
            <div
              key={type}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <Icon className={`w-4 h-4 ${config.textColor}`} />
              <div>
                <div className={`text-xs font-medium ${config.textColor}`}>
                  {config.label}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {count}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

const formatNumber = (value, separator = ' ') => {
  if (typeof value !== 'number') return value;

  const parts = value.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let formattedInteger = integerPart;
  if (separator) {
    formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  const cleanDecimal = decimalPart.replace(/0+$/, '');

  return cleanDecimal ? `${formattedInteger}.${cleanDecimal}` : formattedInteger;
};

const formatDate = (value, format = 'DD.MM.YYYY') => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD.MM.YYYY':
      default:
        return `${day}.${month}.${year}`;
    }
  } catch {
    return String(value);
  }
};

const DataPreview = ({ data, settings }) => {

  const types = useMemo(() => detectDataTypes(data), [data]);

  const allColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const visibleColumns = useMemo(() => {
    if (!settings || !settings.tableSettings || !settings.tableSettings.hiddenColumns) {
      return allColumns;
    }
    return allColumns.filter(col => !settings.tableSettings.hiddenColumns.includes(col));
  }, [allColumns, settings]);

  const rowsPerPage = settings?.tableSettings?.rowsPerPage || 25;
  const previewData = useMemo(() => {
    return data.slice(0, rowsPerPage === 1000 ? data.length : rowsPerPage);
  }, [data, rowsPerPage]);

  const striped = settings?.tableSettings?.striped !== false;

  const dateFormat = settings?.exportSettings?.dateFormat || 'DD.MM.YYYY';
  const numberSeparator = settings?.exportSettings?.numberSeparator || ' ';

  const stats = useMemo(() => ({
    totalRows: data.length,
    totalColumns: visibleColumns.length,
    hiddenColumns: allColumns.length - visibleColumns.length,
    previewRows: previewData.length
  }), [data, visibleColumns, allColumns, previewData]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Table2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      { }
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Table2 className="w-6 h-6 text-sakura-600" />
              Превью данных
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Загружено <span className="font-semibold text-gray-700">{stats.totalRows}</span> строк,
              <span className="font-semibold text-gray-700"> {stats.totalColumns}</span> видимых полей
              {stats.hiddenColumns > 0 && (
                <span className="text-orange-600"> ({stats.hiddenColumns} скрыто)</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-sakura-50 px-4 py-2 rounded-lg border border-sakura-200">
            <Info className="w-4 h-4 text-sakura-600" />
            <span className="text-sm text-gray-700">
              {rowsPerPage === 1000 ? 'Все строки' : `Первые ${stats.previewRows} строк`}
            </span>
          </div>
        </div>

        { }
        <TypeStats types={types} />
      </div>

      { }
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-sakura-50 to-sakura-100 border-b-2 border-sakura-300">
                {visibleColumns.map((col) => {
                  const fieldType = types[col]?.type || 'string';

                  return (
                    <th key={col} className="px-4 py-4 text-left">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-800">
                          {types[col]?.label || col}
                        </div>
                        <TypeBadge type={fieldType} />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-gray-200 hover:bg-sakura-50 transition-colors ${
                    striped && rowIdx % 2 === 0 ? 'bg-white' : striped ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  {visibleColumns.map((col) => {
                    const value = row[col];
                    const fieldType = types[col]?.type || 'string';

                    let displayValue = '-';

                    if (value !== null && value !== undefined && value !== '') {
                      if (fieldType === 'number') {
                        const numValue = typeof value === 'number' ? value : parseFloat(value);
                        displayValue = !isNaN(numValue) ? formatNumber(numValue, numberSeparator) : value;
                      } else if (fieldType === 'date') {
                        displayValue = formatDate(value, dateFormat);
                      } else if (fieldType === 'boolean') {

                        const boolValue = String(value).toLowerCase();
                        const isTrue = boolValue === 'true' || boolValue === 'yes' || boolValue === '1' || value === true;
                        displayValue = (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            isTrue
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isTrue ? '✓ Да' : '✗ Нет'}
                          </span>
                        );
                      } else {
                        displayValue = String(value);
                      }
                    }

                    return (
                      <td
                        key={col}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {fieldType === 'boolean' ? (
                          displayValue
                        ) : (
                          <div className="max-w-xs truncate" title={displayValue}>
                            {displayValue}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        { }
        {stats.totalRows > stats.previewRows && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              Показано {stats.previewRows} из {stats.totalRows} строк
              <span className="text-gray-400 ml-2">
                ({Math.round((stats.previewRows / stats.totalRows) * 100)}% данных)
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPreview;
