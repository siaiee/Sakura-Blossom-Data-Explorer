import React, { useState } from 'react';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

/**
 * Компонент управления страницами дашборда
 * Позволяет добавлять, удалять, дублировать и переключаться между страницами
 */
function PageManager({ pages, currentPageIndex, onPageChange, onAddPage, onDeletePage, onDuplicatePage, onReorderPages }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const draggedPage = newPages[draggedIndex];
    newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    onReorderPages(newPages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {isExpanded ? (
        /* Развернутая панель */
        <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 min-w-[600px]">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>📄</span>
              <span>Страницы дашборда</span>
              <span className="text-sm text-gray-500">({pages.length})</span>
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Список страниц */}
          <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative flex-shrink-0 w-40 h-28 border-2 rounded-lg cursor-move transition-all ${
                  currentPageIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : draggedIndex === index
                    ? 'border-gray-400 bg-gray-100 opacity-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => onPageChange(index)}
              >
                {/* Миниатюра */}
                <div className="p-2 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    {page.elements?.length || 0} элем.
                  </div>

                  <input
                    type="text"
                    value={page.name || `Страница ${index + 1}`}
                    onChange={(e) => {
                      const newPages = [...pages];
                      newPages[index] = { ...newPages[index], name: e.target.value };
                      onReorderPages(newPages);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 text-xs px-1 py-0.5 border border-gray-200 rounded w-full focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Действия */}
                {currentPageIndex === index && (
                  <div className="absolute -top-2 -right-2 flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(index);
                      }}
                      className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
                      title="Дублировать"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Удалить эту страницу?')) {
                            onDeletePage(index);
                          }
                        }}
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded shadow"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Кнопка добавления страницы */}
            <button
              onClick={onAddPage}
              className="flex-shrink-0 w-40 h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Новая страница</span>
            </button>
          </div>

          {/* Подсказка */}
          <div className="text-xs text-gray-500 text-center">
            💡 Перетаскивайте для изменения порядка страниц
          </div>
        </div>
      ) : (
        /* Свернутая панель */
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 px-4 py-2 flex items-center space-x-3">
          <button
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-sm font-medium text-gray-700">
            Страница {currentPageIndex + 1} / {pages.length}
          </div>

          <button
            onClick={() => onPageChange(Math.min(pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === pages.length - 1}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-300" />

          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Управление ▼
          </button>
        </div>
      )}
    </div>
  );
}

export default PageManager;