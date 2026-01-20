import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

const FileUploader = ({ onFileLoad }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {

    if (!file.name.endsWith('.csv')) {
      alert('❌ Ошибка: Поддерживаются только CSV файлы');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ Ошибка: Размер файла превышает 5MB');
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);

        if (results.errors.length > 0) {
          console.error('Ошибки парсинга:', results.errors);
          alert('⚠️ Файл загружен с предупреждениями. Проверьте консоль.');
        }

        if (results.data.length === 0) {
          alert('❌ Ошибка: Файл не содержит данных');
          return;
        }

        setUploadedFileName(file.name);
        onFileLoad(results.data, file.name);
      },
      error: (error) => {
        setIsProcessing(false);
        console.error('Ошибка парсинга:', error);
        alert('❌ Ошибка при чтении файла');
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      { }
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12
          transition-all duration-300 ease-in-out cursor-pointer
          ${isDragging
            ? 'border-sakura-500 bg-sakura-50 scale-105'
            : 'border-gray-300 bg-gradient-to-br from-sakura-50 to-white hover:border-sakura-400 hover:shadow-lg'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => document.getElementById('file-input').click()}
      >
        { }
        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />

        { }
        <div className="flex flex-col items-center justify-center space-y-4">
          { }
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${isDragging
              ? 'bg-sakura-500 scale-110'
              : 'bg-gradient-to-br from-sakura-400 to-sakura-600'
            }
          `}>
            <Upload className="w-12 h-12 text-white" />
          </div>

          { }
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {isProcessing
                ? 'Обработка файла...'
                : 'Перетащите CSV файл или нажмите для выбора'
              }
            </p>
            <p className="text-sm text-gray-500">
              Максимальный размер: 5MB
            </p>
          </div>

          { }
          {!isProcessing && (
            <button
              className="
                px-6 py-3 bg-gradient-to-r from-sakura-400 to-sakura-600
                text-white font-medium rounded-lg shadow-md
                hover:shadow-xl hover:scale-105
                transition-all duration-300
              "
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-input').click();
              }}
            >
              Выбрать файл
            </button>
          )}
        </div>
      </div>

      { }
      {uploadedFileName && !isProcessing && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                Загружен файл:
              </p>
              <p className="text-sm text-gray-600 truncate">
                {uploadedFileName}
              </p>
            </div>
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      { }
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Формат CSV:</strong> Первая строка должна содержать заголовки столбцов.
            Данные автоматически преобразуются в числа, где возможно.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
