import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rnd } from 'react-rnd';
import {
  Undo,
  Redo,
  Eye,
  Edit,
  ZoomIn,
  ZoomOut,
  Download,
  Save,
  ArrowLeft,
  Trash2,
  Copy,
  Grid3x3,
  AlertCircle,
  FileDown
} from 'lucide-react';
import ChartRendererCompact from './Chartrenderercompact.jsx';
import DataPreviewCompact from './DataPreviewCompact.jsx';
import MapViewCompact from './MapView_compact.jsx';

/**
 * Визуальный редактор дашборда с drag-n-drop
 * Поддерживает различные типы элементов: графики, таблицы, текст, KPI, фигуры, карты
 */
function DashboardEditor({ dashboard, datasets, onUpdate, onBack, onAddElement, selectedElement, onSelectElement }) {
  // ========================
  // СОСТОЯНИЕ
  // ========================
  
  const [elements, setElements] = useState(dashboard.elements || []);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'
  const [zoom, setZoom] = useState(100); // 50, 100, 150
  const [showGrid, setShowGrid] = useState(true);
  const [history, setHistory] = useState([dashboard.elements || []]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const canvasRef = useRef(null);

  // Синхронизация элементов с dashboard при изменении извне
  useEffect(() => {
    setElements(dashboard.elements || []);
  }, [dashboard.elements]);

  // Используем внешний onAddElement если передан
  useEffect(() => {
    if (onAddElement) {
      // Этот эффект просто для того чтобы проп был использован
    }
  }, [onAddElement]);

  // Синхронизация выбранного элемента
  const handleSelectElement = useCallback((elementId) => {
    setSelectedElementId(elementId);
    if (onSelectElement) {
      const element = elements.find(el => el.id === elementId);
      onSelectElement(element);
    }
  }, [elements, onSelectElement]);

  // ========================
  // РАЗМЕРЫ CANVAS
  // ========================
  
  const getCanvasDimensions = () => {
    const formats = {
      'a4-portrait': { width: 794, height: 1123 },
      'a4-landscape': { width: 1123, height: 794 },
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1024, height: 768 }
    };
    
    return formats[dashboard.canvasFormat] || formats['a4-portrait'];
  };

  const canvasDimensions = getCanvasDimensions();
  const scaledWidth = (canvasDimensions.width * zoom) / 100;
  const scaledHeight = (canvasDimensions.height * zoom) / 100;

  // ========================
  // ИСТОРИЯ (UNDO/REDO)
  // ========================
  
  const addToHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  // ========================
  // ОПЕРАЦИИ С ЭЛЕМЕНТАМИ
  // ========================
  
  const addElement = useCallback((elementData) => {
    const newElement = {
      id: `element_${Date.now()}`,
      x: 50,
      y: 50,
      width: 400,
      height: 300,
      ...elementData
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElementId(newElement.id);
    
    onUpdate(dashboard.id, { elements: newElements });
  }, [elements, addToHistory, dashboard.id, onUpdate]);

  const updateElement = useCallback((elementId, updates) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(newElements);
  }, [elements]);

  const deleteElement = useCallback((elementId) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [elements, selectedElementId, addToHistory]);

  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...JSON.parse(JSON.stringify(element)),
      id: `element_${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElementId(newElement.id);
  }, [elements, addToHistory]);

  // ========================
  // ГОРЯЧИЕ КЛАВИШИ
  // ========================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Только в режиме редактирования
      if (mode !== 'edit') return;
      
      // Ctrl/Cmd + Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl/Cmd + Shift + Z или Ctrl/Cmd + Y - Redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      
      // Delete - удалить выбранный элемент
      if (e.key === 'Delete' && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      }
      
      // Ctrl/Cmd + D - дублировать
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      }
      
      // Ctrl/Cmd + S - сохранить
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, undo, redo, mode]);

  // ========================
  // СОХРАНЕНИЕ
  // ========================
  
  const handleSave = useCallback(() => {
    onUpdate(dashboard.id, { elements });
    // Визуальная обратная связь
    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.classList.add('bg-green-600');
      setTimeout(() => btn.classList.remove('bg-green-600'), 500);
    }
  }, [dashboard.id, elements, onUpdate]);

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (elements.length > 0) {
        onUpdate(dashboard.id, { elements });
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dashboard.id, elements, onUpdate]);

  // ========================
  // ZOOM
  // ========================
  
  const zoomLevels = [50, 75, 100, 125, 150];
  const currentZoomIndex = zoomLevels.indexOf(zoom);

  const zoomIn = () => {
    if (currentZoomIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentZoomIndex + 1]);
    }
  };

  const zoomOut = () => {
    if (currentZoomIndex > 0) {
      setZoom(zoomLevels[currentZoomIndex - 1]);
    }
  };

  // ========================
  // ЭКСПОРТ В PDF
  // ========================
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Динамически импортируем библиотеки
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      if (!canvasRef.current) {
        throw new Error('Canvas не найден');
      }

      // Временно убираем выделение и сетку
      const wasGrid = showGrid;
      const wasSelected = selectedElementId;
      setShowGrid(false);
      setSelectedElementId(null);
      
      // Ждем рендеринга
      await new Promise(resolve => setTimeout(resolve, 100));

      // Создаем изображение canvas
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: dashboard.settings?.background || '#ffffff'
      });

      // Создаем PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvasDimensions.width > canvasDimensions.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasDimensions.width, canvasDimensions.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvasDimensions.width, canvasDimensions.height);
      pdf.save(`${dashboard.name || 'dashboard'}.pdf`);

      // Восстанавливаем состояние
      setShowGrid(wasGrid);
      setSelectedElementId(wasSelected);
      
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert(`Ошибка экспорта в PDF: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // ========================
  // РЕНДЕР ЭЛЕМЕНТА
  // ========================
  
  const renderElement = (element) => {
    const isSelected = mode === 'edit' && selectedElementId === element.id;

    // Базовый стиль элемента с улучшенной визуализацией выделения
    const baseStyle = {
      border: isSelected ? '3px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      boxShadow: isSelected 
        ? '0 0 0 4px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      cursor: mode === 'preview' ? 'default' : 'move',
      transition: 'all 0.15s ease'
    };

    // Контент в зависимости от типа элемента
    let content = null;

    switch (element.type) {
      case 'chart':
        const chartDataset = datasets.find(d => d.id === element.datasetId);
        
        if (!chartDataset || !chartDataset.data) {
          content = (
            <div className="w-full h-full flex items-center justify-center bg-yellow-50 p-4 drag-handle" style={baseStyle}>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Датасет не найден</p>
                <p className="text-xs text-gray-600 mt-1">Выберите датасет в свойствах</p>
              </div>
            </div>
          );
        } else {
          let chartConfig = element.config || {};
          if (element.config?.chartId) {
            const chart = chartDataset.charts.find(c => c.id === element.config.chartId);
            if (chart) {
              chartConfig = {
                ...chart,
                title: element.config.title || chart.title
              };
            }
          }
          
          content = (
            <div className="w-full h-full drag-handle" style={{...baseStyle, overflow: 'hidden'}}>
              <ChartRendererCompact
                data={chartDataset.data}
                config={chartConfig}
                settings={{
                  chartColors: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                  chartStyle: {
                    rounded: true,
                    grid: element.config?.showGrid !== false,
                    legend: element.config?.showLegend ? 'bottom' : 'none',
                    animation: mode === 'preview'
                  }
                }}
                width={element.width}
                height={element.height}
              />
            </div>
          );
        }
        break;

      case 'table':
        const tableDataset = datasets.find(d => d.id === element.datasetId);
        
        if (!tableDataset || !tableDataset.data) {
          content = (
            <div className="w-full h-full flex items-center justify-center bg-yellow-50 p-4 drag-handle" style={baseStyle}>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Датасет не найден</p>
                <p className="text-xs text-gray-600 mt-1">Выберите датасет в свойствах</p>
              </div>
            </div>
          );
        } else {
          content = (
            <div className="w-full h-full drag-handle" style={{...baseStyle, overflow: 'hidden'}}>
              <DataPreviewCompact
                data={tableDataset.data}
                columns={element.config?.columns}
                rowsPerPage={element.config?.rowsPerPage || 10}
                striped={element.config?.striped !== false}
                dataTypes={tableDataset.dataTypes}
                showHeader={element.config?.showHeader !== false}
              />
            </div>
          );
        }
        break;

      case 'map':
        const mapDataset = datasets.find(d => d.id === element.datasetId);
        
        if (!mapDataset || !mapDataset.data || !mapDataset.hasMap) {
          content = (
            <div className="w-full h-full flex items-center justify-center bg-yellow-50 p-4 drag-handle" style={baseStyle}>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">
                  {!mapDataset ? 'Датасет не найден' : 'Нет координат'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {!mapDataset ? 'Выберите датасет в свойствах' : 'Датасет не содержит координат'}
                </p>
              </div>
            </div>
          );
        } else {
          content = (
            <div 
              className="w-full h-full drag-handle" 
              style={{
                ...baseStyle, 
                overflow: 'hidden',
                minWidth: '200px',
                minHeight: '200px'
              }}
            >
              <MapViewCompact
                data={mapDataset.data}
                dataTypes={mapDataset.dataTypes}
                mode={element.config?.mode || 'markers'}
              />
            </div>
          );
        }
        break;

      case 'text':
        content = (
          <div className="w-full h-full p-4 drag-handle" style={baseStyle}>
            <div 
              className="w-full h-full"
              style={{
                fontSize: element.config?.fontSize || '16px',
                fontWeight: element.config?.fontWeight || 'normal',
                fontStyle: element.config?.fontStyle || 'normal',
                textAlign: element.config?.textAlign || 'left',
                color: element.config?.color || '#000000',
                whiteSpace: 'pre-wrap',
                overflow: 'auto'
              }}
            >
              {element.config?.content || 'Введите текст...'}
            </div>
          </div>
        );
        break;

      case 'kpi':
        content = (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 p-6 drag-handle" style={baseStyle}>
            <div className="text-5xl mb-3">{element.config?.icon || '📈'}</div>
            <div className="text-4xl font-bold text-gray-800 mb-2" style={{ color: element.config?.color || '#3b82f6' }}>
              {element.config?.value || '0'}
            </div>
            <div className="text-sm font-semibold text-gray-600">
              {element.config?.label || 'KPI Метрика'}
            </div>
          </div>
        );
        break;

      case 'shape':
        const shapeType = element.config?.shape || 'rectangle';
        
        if (shapeType === 'line') {
          content = (
            <div className="w-full h-full relative">
              <div 
                className="drag-handle absolute inset-0 cursor-move"
                style={{
                  minHeight: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
              <div 
                className="w-full absolute top-1/2 -translate-y-1/2"
                style={{
                  ...baseStyle,
                  height: element.height || 3,
                  backgroundColor: element.config?.fill || '#3b82f6',
                  opacity: element.config?.opacity || 1,
                  pointerEvents: 'none'
                }}
              />
            </div>
          );
        } else {
          content = (
            <div 
              className="w-full h-full drag-handle"
              style={{
                ...baseStyle,
                backgroundColor: element.config?.fill || '#3b82f6',
                borderRadius: shapeType === 'circle' ? '50%' : baseStyle.borderRadius,
                opacity: element.config?.opacity || 1
              }}
            />
          );
        }
        break;

      case 'image':
        if (!element.config?.imageUrl) {
          content = (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4 drag-handle" style={baseStyle}>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Изображение не загружено</p>
                <p className="text-xs text-gray-600 mt-1">Загрузите изображение в свойствах</p>
              </div>
            </div>
          );
        } else {
          content = (
            <div className="w-full h-full drag-handle" style={{...baseStyle, overflow: 'hidden', padding: 0, backgroundColor: '#f9fafb'}}>
              <img 
                src={element.config.imageUrl}
                alt={element.config.altText || 'Изображение'}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.config?.objectFit || 'contain',
                  objectPosition: 'center',
                  pointerEvents: 'none'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-xs">Ошибка загрузки изображения</div>';
                  }
                }}
              />
            </div>
          );
        }
        break;

      default:
        content = (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 drag-handle" style={baseStyle}>
            <p className="text-gray-500">Неизвестный тип: {element.type}</p>
          </div>
        );
    }

    return content;
  };

  // ========================
  // RENDER
  // ========================

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* TOOLBAR */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Левая группа */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Назад</span>
            </button>

            <div className="h-6 w-px bg-gray-300" />

            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0 || mode === 'preview'}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Отменить (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1 || mode === 'preview'}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Повторить (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            {/* Переключатель режима */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('edit');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  mode === 'edit'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Edit className="w-4 h-4" />
                <span>Редактировать</span>
              </button>
              <button
                onClick={() => {
                  setMode('preview');
                  setSelectedElementId(null);
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  mode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Просмотр</span>
              </button>
            </div>
          </div>

          {/* Центральная группа */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                disabled={currentZoomIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Уменьшить"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {zoomLevels.map(level => (
                  <option key={level} value={level}>{level}%</option>
                ))}
              </select>
              
              <button
                onClick={zoomIn}
                disabled={currentZoomIndex === zoomLevels.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Увеличить"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {mode === 'edit' && (
              <>
                <div className="h-6 w-px bg-gray-300" />

                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-colors ${
                    showGrid 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title="Показать/скрыть сетку"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Правая группа */}
          <div className="flex items-center space-x-2">
            <button
              id="save-btn"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
              title="Сохранить (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Экспорт...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS CONTAINER */}
      <div className="flex-1 overflow-auto bg-gray-200 p-8">
        <div className="flex items-center justify-center min-h-full">
          <div
            ref={canvasRef}
            className="relative bg-white shadow-2xl"
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`,
              backgroundImage: showGrid && mode === 'edit'
                ? `repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px),
                   repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 19px, #e5e7eb 20px)`
                : 'none',
              backgroundSize: showGrid && mode === 'edit' ? `${20 * zoom / 100}px ${20 * zoom / 100}px` : 'auto'
            }}
            onClick={(e) => {
              if (mode === 'edit' && e.target === e.currentTarget) {
                handleSelectElement(null);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              if (mode !== 'edit') return;
              
              e.preventDefault();
              try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / zoom) * 100;
                  const y = ((e.clientY - rect.top) / zoom) * 100;
                  
                  const newElement = {
                    ...data,
                    id: `element_${Date.now()}`,
                    x: Math.max(0, Math.min(x, canvasDimensions.width - (data.width || 400))),
                    y: Math.max(0, Math.min(y, canvasDimensions.height - (data.height || 300)))
                  };
                  
                  const newElements = [...elements, newElement];
                  setElements(newElements);
                  addToHistory(newElements);
                  handleSelectElement(newElement.id);
                  onUpdate(dashboard.id, { elements: newElements });
                }
              } catch (err) {
                console.error('Ошибка при drop:', err);
              }
            }}
          >
            {/* Информация о формате */}
            {mode === 'edit' && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md text-sm font-medium text-gray-700 pointer-events-none">
                {dashboard.canvasFormat.toUpperCase()} • {canvasDimensions.width} × {canvasDimensions.height}px
              </div>
            )}

            {/* Элементы */}
            {elements.map((element) => (
              mode === 'edit' ? (
                <Rnd
                  key={element.id}
                  size={{ width: element.width, height: element.height }}
                  position={{ x: element.x, y: element.y }}
                  onDragStart={(e) => {
                    setIsDragging(true);
                    handleSelectElement(element.id);
                  }}
                  onDragStop={(e, d) => {
                    setIsDragging(false);
                    const newElements = elements.map(el =>
                      el.id === element.id ? { ...el, x: d.x, y: d.y } : el
                    );
                    setElements(newElements);
                    addToHistory(newElements);
                  }}
                  onResizeStart={() => {
                    handleSelectElement(element.id);
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    const newElements = elements.map(el =>
                      el.id === element.id
                        ? {
                            ...el,
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                            x: position.x,
                            y: position.y
                          }
                        : el
                    );
                    setElements(newElements);
                    addToHistory(newElements);
                  }}
                  bounds="parent"
                  enableResizing={true}
                  disableDragging={false}
                  dragHandleClassName="drag-handle"
                  scale={zoom / 100}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectElement(element.id);
                  }}
                >
                  <div 
                    className="w-full h-full drag-handle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectElement(element.id);
                    }}
                  >
                    {renderElement(element)}
                  </div>
                </Rnd>
              ) : (
                <div
                  key={element.id}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height
                  }}
                >
                  {renderElement(element)}
                </div>
              )
            ))}

            {/* Placeholder если нет элементов */}
            {elements.length === 0 && mode === 'edit' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Холст пуст
                  </h3>
                  <p className="text-gray-600">
                    Добавьте элементы из палитры слева, чтобы начать создание дашборда
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информация о выбранном элементе */}
      {mode === 'edit' && selectedElementId && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-300 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-blue-900 font-bold text-sm">
                Выбран: {(() => {
                  const typeNames = {
                    chart: '📊 График',
                    table: '📋 Таблица', 
                    text: '📝 Текст',
                    kpi: '📈 KPI',
                    map: '🗺️ Карта',
                    shape: '🎨 Фигура',
                    image: '🖼️ Изображение'
                  };
                  return typeNames[elements.find(el => el.id === selectedElementId)?.type] || 'Элемент';
                })()}
              </span>
              <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">
                {elements.find(el => el.id === selectedElementId)?.width} × {elements.find(el => el.id === selectedElementId)?.height}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-blue-700">
              <button
                onClick={() => duplicateElement(selectedElementId)}
                className="flex items-center space-x-1 hover:text-blue-900 bg-blue-200 hover:bg-blue-300 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                title="Дублировать (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
                <span>Дублировать</span>
              </button>
              <button
                onClick={() => deleteElement(selectedElementId)}
                className="flex items-center space-x-1 hover:text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium text-red-600"
                title="Удалить (Delete)"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardEditor;