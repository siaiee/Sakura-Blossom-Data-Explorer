import React, { useState } from 'react';
import { FileUp, Trash2, FolderOpen, BarChart3, Map, Filter, ChevronRight, Edit2, Check, X, Plus } from 'lucide-react';
import FileUploader from './Fileuploader.jsx';

function DatasetManager({ datasets, onSelectDataset, onDeleteDataset, onRenameDataset, onFileLoad }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showUploader, setShowUploader] = useState(false);

  const handleStartEdit = (dataset) => {
    setEditingId(dataset.id);
    setEditName(dataset.name);
  };

  const handleSaveEdit = (datasetId) => {
    if (editName.trim()) {
      onRenameDataset(datasetId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        { }
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📊 Мои датасеты
            </h1>
            <p className="text-gray-600">
              Управляйте источниками данных для создания дашбордов
            </p>
          </div>

          { }
          <button
            onClick={() => setShowUploader(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Загрузить датасет</span>
          </button>
        </div>

        { }
        {datasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                onMouseEnter={() => setHoveredId(dataset.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-pink-400 cursor-pointer"
                onClick={() => editingId !== dataset.id && onSelectDataset(dataset.id)}
              >
                { }
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingId === dataset.id ? (

                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(dataset.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1 px-2 py-1 text-sm border-2 border-white rounded bg-white/20 text-white placeholder-pink-200 focus:outline-none focus:bg-white focus:text-gray-800"
                            placeholder="Название датасета"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(dataset.id)}
                            className="p-1 bg-green-500 hover:bg-green-600 rounded text-white"
                            title="Сохранить"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                            title="Отмена"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (

                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-white truncate flex-1">
                            {dataset.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(dataset);
                            }}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Переименовать"
                          >
                            <Edit2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                      <p className="text-pink-100 text-sm truncate mt-1">
                        {dataset.fileName}
                      </p>
                    </div>
                    {editingId !== dataset.id && (
                      <ChevronRight
                        className={`w-5 h-5 text-white transition-transform ml-2 ${
                          hoveredId === dataset.id ? 'translate-x-1' : ''
                        }`}
                      />
                    )}
                  </div>
                </div>

                { }
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Строк</p>
                      <p className="text-xl font-bold text-blue-600">
                        {dataset.data.length.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Колонок</p>
                      <p className="text-xl font-bold text-green-600">
                        {Object.keys(dataset.data[0] || {}).length}
                      </p>
                    </div>
                  </div>

                  { }
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <BarChart3 className="w-4 h-4" />
                        <span>Графиков</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {dataset.charts.length}
                      </span>
                    </div>

                    {dataset.hasMap && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Map className="w-4 h-4" />
                          <span>Карта</span>
                        </div>
                        <span className="font-semibold text-green-600">✓</span>
                      </div>
                    )}

                    {Object.keys(dataset.filters || {}).length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Filter className="w-4 h-4" />
                          <span>Фильтры</span>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {Object.keys(dataset.filters).length}
                        </span>
                      </div>
                    )}
                  </div>

                  { }
                  <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                    Создан: {new Date(dataset.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                { }
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDataset(dataset.id);
                    }}
                    className="text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    Открыть →
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Удалить датасет "${dataset.name}"?`)) {
                        onDeleteDataset(dataset.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    title="Удалить датасет"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (

          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Нет загруженных датасетов
            </h3>
            <p className="text-gray-600 mb-6">
              Загрузите CSV файл, чтобы начать работу с данными
            </p>
            <button
              onClick={() => setShowUploader(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <FileUp className="w-5 h-5" />
              <span>Загрузить датасет</span>
            </button>
          </div>
        )}

        { }
        {datasets.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Совет
                </h4>
                <p className="text-sm text-blue-800">
                  Вы можете использовать данные из нескольких датасетов в одном дашборде.
                  Просто создайте графики и таблицы для каждого датасета, а затем объедините их в редакторе дашборда.
                </p>
              </div>
            </div>
          </div>
        )}

        { }
        {showUploader && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
              { }
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Загрузить датасет
                </h2>
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              { }
              <div className="p-6">
                <FileUploader
                  onFileLoad={(data, fileName) => {
                    onFileLoad(data, fileName);
                    setShowUploader(false);
                  }}
                />
              </div>

              { }
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={() => setShowUploader(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatasetManager;
