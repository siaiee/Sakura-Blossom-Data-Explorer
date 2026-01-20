import React, { useMemo } from 'react';

/**
 * Компактная версия DataPreview для использования в дашбордах
 * Убрана вся статистика и лишний UI, только чистая таблица
 */
const DataPreviewCompact = ({ data, columns, rowsPerPage = 10, striped = true, dataTypes, showHeader = true }) => {
  // Фильтруем колонки если указаны
  const displayColumns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const allColumns = Object.keys(data[0]);
    return columns && columns.length > 0 ? columns : allColumns;
  }, [data, columns]);

  // Ограничиваем количество строк
  const displayData = useMemo(() => {
    return data.slice(0, rowsPerPage);
  }, [data, rowsPerPage]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Нет данных для отображения
      </div>
    );
  }

  if (displayColumns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        Выберите колонки для отображения
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full border-collapse text-xs">
        {showHeader && (
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {displayColumns.map((col) => (
                <th key={col} className="px-2 py-1.5 text-left font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  <div className="truncate" title={dataTypes?.[col]?.label || col}>
                    {dataTypes?.[col]?.label || col}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {displayData.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                striped && rowIdx % 2 === 0 ? 'bg-white' : striped ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {displayColumns.map((col) => {
                const value = row[col];
                let displayValue = '-';
                
                if (value !== null && value !== undefined && value !== '') {
                  displayValue = String(value);
                }
                
                return (
                  <td key={col} className="px-2 py-1 text-gray-700 border-r border-gray-200 last:border-r-0">
                    <div className="truncate" title={displayValue}>
                      {displayValue}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Индикатор если данных больше чем показано */}
      {data.length > rowsPerPage && (
        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-300 px-2 py-1 text-center text-xs text-gray-600">
          Показано {displayData.length} из {data.length} строк
        </div>
      )}
    </div>
  );
};

export default DataPreviewCompact;