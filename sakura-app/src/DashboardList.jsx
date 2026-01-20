import React, { useState } from 'react';
import { Plus, Trash2, Edit, Eye, Calendar, Layers, Copy } from 'lucide-react';

/**
 * Компонент списка дашбордов
 * Управление и создание финальных презентаций
 */
function DashboardList({ dashboards, onCreateDashboard, onOpenDashboard, onDeleteDashboard, onDuplicateDashboard }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const templates = [
    {
      id: 'blank',
      name: 'Пустой холст',
      description: 'Начните с чистого листа',
      icon: '📄',
      preview: 'Полная свобода творчества'
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'KPI карточки и ключевые метрики',
      icon: '📊',
      preview: '4 KPI + 2 графика'
    },
    {
      id: 'detailed',
      name: 'Детальный отчет',
      description: 'Таблицы и подробные данные',
      icon: '📋',
      preview: 'Заголовок + таблица + примечания'
    },
    {
      id: 'analytics',
      name: 'Аналитический',
      description: 'Фокус на графиках и трендах',
      icon: '📈',
      preview: '6 графиков разных типов'
    },
    {
      id: 'geo',
      name: 'Географический',
      description: 'Карта с дополнениями',
      icon: '🗺️',
      preview: 'Карта + статистика по регионам'
    }
  ];

  const handleCreate = () => {
    if (!newDashboardName.trim()) {
      alert('Введите название дашборда');
      return;
    }

    onCreateDashboard({
      name: newDashboardName,
      template: selectedTemplate
    });

    setNewDashboardName('');
    setSelectedTemplate('blank');
    setShowCreateModal(false);
  };

  // Хелпер для подсчета элементов (поддержка старой и новой структуры)
  const getElementsCount = (dashboard) => {
    if (dashboard.pages) {
      return dashboard.pages.reduce((sum, page) => sum + (page.elements?.length || 0), 0);
    }
    return dashboard.elements?.length || 0;
  };

  // Хелпер для получения всех элементов
  const getAllElements = (dashboard) => {
    if (dashboard.pages) {
      return dashboard.pages.flatMap(page => page.elements || []);
    }
    return dashboard.elements || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎨 Мои дашборды
            </h1>
            <p className="text-gray-600">
              Создавайте и управляйте финальными презентациями
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Создать дашборд</span>
          </button>
        </div>

        {/* Список дашбордов */}
        {dashboards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => {
              const elementsCount = getElementsCount(dashboard);
              const allElements = getAllElements(dashboard);
              
              return (
                <div
                  key={dashboard.id}
                  onMouseEnter={() => setHoveredId(dashboard.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-pink-400"
                >
                  {/* Превью canvas */}
                  <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {elementsCount > 0 ? (
                        <div className="text-center">
                          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {elementsCount} элемент(ов)
                          </p>
                          {dashboard.pages && dashboard.pages.length > 1 && (
                            <p className="text-xs text-gray-500 mt-1">
                              на {dashboard.pages.length} страницах
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Edit className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Пустой дашборд
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Бейдж формата */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-gray-700">
                      {dashboard.canvasFormat === '16:9' ? '16:9' : 'A4'}
                    </div>
                  </div>

                  {/* Информация */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                      {dashboard.name}
                    </h3>
                    
                    {dashboard.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {dashboard.description}
                      </p>
                    )}

                    {/* Статистика */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <p className="text-xs text-gray-600">
                          {dashboard.pages ? 'Страниц' : 'Элементов'}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {dashboard.pages ? dashboard.pages.length : elementsCount}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                        <p className="text-xs text-gray-600">
                          {dashboard.pages ? 'Элементов' : 'Датасетов'}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {dashboard.pages 
                            ? elementsCount
                            : new Set(allElements.map(e => e.datasetId).filter(Boolean)).size
                          }
                        </p>
                      </div>
                    </div>

                    {/* Даты */}
                    <div className="flex items-center text-xs text-gray-500 space-x-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(dashboard.lastModified || dashboard.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onOpenDashboard(dashboard.id, 'edit')}
                        className="px-3 py-1.5 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition-colors flex items-center space-x-1"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Редактировать</span>
                      </button>
                      
                      <button
                        onClick={() => onOpenDashboard(dashboard.id, 'preview')}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                        title="Предпросмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => onDuplicateDashboard(dashboard.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Дублировать"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить дашборд "${dashboard.name}"?`)) {
                            onDeleteDashboard(dashboard.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Пустое состояние */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Создайте свой первый дашборд
              </h3>
              <p className="text-gray-600 mb-6">
                Объедините графики, таблицы и карты из ваших датасетов в красивую презентацию
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Создать дашборд</span>
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно создания */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Хедер */}
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Создать новый дашборд
                </h2>
              </div>

              {/* Контент */}
              <div className="p-6 space-y-6">
                {/* Название */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Название дашборда
                  </label>
                  <input
                    type="text"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    placeholder="Например: Q4 Sales Overview"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                    autoFocus
                  />
                </div>

                {/* Шаблоны */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Выберите шаблон
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate === template.id
                            ? 'border-pink-500 bg-pink-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">{template.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">
                              {template.description}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              {template.preview}
                            </p>
                          </div>
                          {selectedTemplate === template.id && (
                            <div className="bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                              <span className="text-sm">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Футер */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDashboardName('');
                    setSelectedTemplate('blank');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newDashboardName.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    newDashboardName.trim()
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardList;