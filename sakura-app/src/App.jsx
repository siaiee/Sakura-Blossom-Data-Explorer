import React, { useState, useEffect } from 'react';
import { FileUp, Database, Settings as SettingsIcon, Download, Upload, Home } from 'lucide-react';
import FileUploader from './Fileuploader.jsx';
import DataPreview from './DataPreview.jsx';
import ChartBuilder from './Chartbuilder.jsx';
import ChartRenderer from './Chartrenderer.jsx';
import MapView from './Mapview.jsx';
import FilterPanel from './FilterPanel.jsx';
import DatasetManager from './DatasetManager.jsx';
import { detectDataTypes, hasCoordinates } from './utils/detectDataTypes';
import { applyFilters } from './utils/applyFilters';
import {
  saveDatasets,
  loadDatasets,
  saveSettings,
  loadSettings,
  exportProject,
  importProject
} from './utils/storageUtils';
import './styles/common.css';

function App() {

  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [mainView, setMainView] = useState('welcome');
  const [datasetView, setDatasetView] = useState('table');
  const [globalSettings, setGlobalSettings] = useState({
    theme: 'sakura-pink'
  });

  useEffect(() => {
    const storedDatasets = loadDatasets();
    const storedSettings = loadSettings();

    if (storedDatasets.length > 0) setDatasets(storedDatasets);
    if (storedSettings) setGlobalSettings(storedSettings);
  }, []);

  useEffect(() => {
    if (datasets.length > 0) saveDatasets(datasets);
  }, [datasets]);

  useEffect(() => {
    saveSettings(globalSettings);
  }, [globalSettings]);

  const handleFileLoad = (parsedData, loadedFileName) => {
    if (parsedData && parsedData.length > 0) {
      const detectedTypes = detectDataTypes(parsedData);

      const newDataset = {
        id: `dataset_${Date.now()}`,
        name: loadedFileName.replace(/\.[^/.]+$/, ''),
        fileName: loadedFileName,
        data: parsedData,
        dataTypes: detectedTypes,
        filteredData: null,
        filters: {},
        charts: [],
        hasMap: hasCoordinates(detectedTypes),
        createdAt: Date.now()
      };

      setDatasets(prev => [...prev, newDataset]);
      setActiveDatasetId(newDataset.id);
      setMainView('datasets');
      setDatasetView('table');
    }
  };

  const handleDeleteDataset = (datasetId) => {
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    if (activeDatasetId === datasetId) {
      setActiveDatasetId(null);
      setMainView('datasets');
    }
  };

  const updateDataset = (datasetId, updates) => {
    setDatasets(prev => prev.map(d =>
      d.id === datasetId ? { ...d, ...updates } : d
    ));
  };

  const handleRenameDataset = (datasetId, newName) => {
    if (!newName.trim()) return;
    updateDataset(datasetId, { name: newName.trim() });
  };

  const handleChartConfig = (config) => {
    if (!activeDataset) return;

    const newChart = {
      id: `chart_${Date.now()}`,
      ...config
    };

    updateDataset(activeDataset.id, {
      charts: [...activeDataset.charts, newChart]
    });
  };

  const handleRemoveChart = (chartId) => {
    if (!activeDataset) return;
    updateDataset(activeDataset.id, {
      charts: activeDataset.charts.filter(c => c.id !== chartId)
    });
  };

  const handleFilterChange = (newFilters) => {
    if (!activeDataset) return;
    const filtered = applyFilters(activeDataset.data, newFilters);
    updateDataset(activeDataset.id, {
      filters: newFilters,
      filteredData: filtered
    });
  };

  const handleExportProject = () => {
    exportProject(datasets, [], globalSettings);
  };

  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importProject(file)
      .then((project) => {
        if (window.confirm('Импортировать проект? Текущие данные будут заменены.')) {
          setDatasets(project.datasets);
          setGlobalSettings(prev => ({ ...prev, ...project.settings }));
          alert('Проект успешно импортирован!');
        }
      })
      .catch((error) => {
        alert(`Ошибка импорта: ${error.message}`);
      });

    e.target.value = '';
  };

  const activeDataset = datasets.find(d => d.id === activeDatasetId);

  return (
    <div className="container-main">
      { }
      <header className="bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
        <div className="container-section py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sakura Blossom</h1>
                <p className="text-sm text-pink-100">Data Explorer</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportProject}
                disabled={datasets.length === 0}
                className="btn-secondary text-white bg-white/20 hover:bg-white/30 border-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Экспорт
              </button>

              <label className="btn-secondary text-white bg-white/20 hover:bg-white/30 border-0 cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                Импорт
                <input type="file" accept=".json" onChange={handleImportProject} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </header>

      { }
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-section py-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setMainView('welcome')}
              className={`nav-tab ${mainView === 'welcome' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Главная
            </button>

            <button
              onClick={() => setMainView('datasets')}
              className={`nav-tab ${mainView === 'datasets' ? 'nav-tab-active' : 'nav-tab-inactive'}`}
            >
              <Database className="w-4 h-4 inline mr-2" />
              Датасеты
              {datasets.length > 0 && (
                <span className="badge badge-pink ml-2">{datasets.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      { }
      <main>
        { }
        {mainView === 'welcome' && (
          <div className="container-section py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl">🌸</span>
              </div>

              <h2 className="heading-1 mb-4">Добро пожаловать в Sakura Blossom</h2>
              <p className="text-xl text-secondary mb-12">
                Исследуйте и визуализируйте ваши данные
              </p>

              <FileUploader onFileLoad={handleFileLoad} />

              {datasets.length > 0 && (
                <div className="card mt-12">
                  <div className="card-body">
                    <h3 className="heading-3 mb-4">Быстрый доступ</h3>
                    <button
                      onClick={() => setMainView('datasets')}
                      className="stat-box stat-box-pink p-6 w-full text-left hover:shadow-lg transition-shadow"
                    >
                      <Database className="w-6 h-6 text-pink-600 mb-2" />
                      <p className="font-semibold text-gray-800">
                        {datasets.length} датасет(ов)
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        { }
        {mainView === 'datasets' && !activeDataset && (
          <DatasetManager
            datasets={datasets}
            onSelectDataset={setActiveDatasetId}
            onDeleteDataset={handleDeleteDataset}
            onRenameDataset={handleRenameDataset}
            onFileLoad={handleFileLoad}
          />
        )}

        { }
        {mainView === 'datasets' && activeDataset && (
          <div>
            { }
            <div className="bg-white border-b border-gray-200">
              <div className="container-section py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveDatasetId(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Назад
                    </button>
                    <div>
                      <h2 className="font-bold text-gray-800">{activeDataset.name}</h2>
                      <p className="text-sm text-muted">{activeDataset.data.length} строк</p>
                    </div>
                  </div>

                  <nav className="flex space-x-1">
                    {['table', 'charts', 'map'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setDatasetView(view)}
                        disabled={view === 'map' && !activeDataset.hasMap}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          datasetView === view
                            ? 'bg-pink-100 text-pink-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {view === 'table' && 'Таблица'}
                        {view === 'charts' && `Графики (${activeDataset.charts.length})`}
                        {view === 'map' && 'Карта'}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            { }
            <div className="container-section">
              {datasetView === 'table' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <FilterPanel
                      dataTypes={activeDataset.dataTypes}
                      data={activeDataset.data}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <DataPreview
                      data={activeDataset.filteredData || activeDataset.data}
                      settings={{ tableSettings: { rowsPerPage: 25, striped: true } }}
                    />
                  </div>
                </div>
              )}

              {datasetView === 'charts' && (
                <div className="space-y-6">
                  <ChartBuilder
                    dataTypes={activeDataset.dataTypes}
                    onChartConfig={handleChartConfig}
                  />

                  {activeDataset.charts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {activeDataset.charts.map((chart) => (
                        <ChartRenderer
                          key={chart.id}
                          data={activeDataset.filteredData || activeDataset.data}
                          config={chart}
                          settings={{ chartColors: ['#ec4899', '#3b82f6', '#10b981'] }}
                          onRemove={() => handleRemoveChart(chart.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body text-center py-12">
                        <p className="text-muted">
                          Графики ещё не созданы. Используйте конструктор выше.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {datasetView === 'map' && activeDataset.hasMap && (
                <MapView
                  data={activeDataset.data}
                  dataTypes={activeDataset.dataTypes}
                  filteredData={activeDataset.filteredData}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
