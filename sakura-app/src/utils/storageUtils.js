const STORAGE_KEYS = {
  DATASETS: 'sakura_datasets',
  SETTINGS: 'sakura_settings'
};

const CURRENT_VERSION = '2.0.0';

export const saveDatasets = (datasets) => {
  try {
    const data = {
      version: CURRENT_VERSION,
      timestamp: Date.now(),
      datasets: datasets
    };
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения датасетов:', error);
    return false;
  }
};

export const loadDatasets = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DATASETS);
    if (!stored) return [];

    const data = JSON.parse(stored);
    return data.datasets || [];
  } catch (error) {
    console.error('Ошибка загрузки датасетов:', error);
    return [];
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    return false;
  }
};

export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error);
    return null;
  }
};

export const exportProject = (datasets, _, settings) => {
  const project = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    datasets: datasets,
    settings: settings
  };

  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sakura_datasets_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importProject = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target.result);

        if (!project.version) {
          throw new Error('Неверный формат файла проекта');
        }

        if (!project.datasets) {
          throw new Error('Отсутствуют данные датасетов');
        }

        resolve({
          datasets: project.datasets,
          settings: project.settings || {}
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};

export const clearAllData = () => {
  if (window.confirm('Вы уверены? Все данные будут удалены.')) {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  }
  return false;
};
