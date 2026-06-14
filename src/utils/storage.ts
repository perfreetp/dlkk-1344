import type { AppData } from '@/types';

const STORAGE_KEY = 'family-space-data';

const ALL_STORAGE_KEYS = [
  STORAGE_KEY,
  'family-space-family',
  'family-space-album',
  'family-space-assets',
  'family-space-schedule',
  'family-space-memo',
  'family-space-settings',
];

export const loadData = (): AppData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存数据失败:', e);
  }
};

export const clearData = (): void => {
  ALL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
  sessionStorage.clear();
};

export const clearAllZustandStorage = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('family-space-') || key === STORAGE_KEY)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();
};

export const generateId = (): string => {
  return (
    Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  );
};

export const getStorageSize = (): number => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length * 2;
    }
  }
  return total;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
