import { useFamilyStore } from '@/store/useFamilyStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useAssetsStore } from '@/store/useAssetsStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useMemoStore } from '@/store/useMemoStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { AppData } from '@/types';
import { clearAllZustandStorage } from './storage';

export const exportAllData = (): AppData => {
  const family = useFamilyStore.getState();
  const album = useAlbumStore.getState();
  const assets = useAssetsStore.getState();
  const schedule = useScheduleStore.getState();
  const memo = useMemoStore.getState();
  const settings = useSettingsStore.getState();

  return {
    familyMembers: family.members,
    importantDates: family.importantDates,
    albums: album.albums,
    photos: album.photos,
    assets: assets.assets,
    vehicles: assets.vehicles,
    borrowItems: assets.borrowItems,
    trips: schedule.trips,
    medications: schedule.medications,
    menuPlan: schedule.menuPlan,
    stickyNotes: memo.stickyNotes,
    settings: settings.settings,
  };
};

export const importAllData = (data: AppData): void => {
  clearAllZustandStorage();

  if (data.familyMembers !== undefined) {
    useFamilyStore.setState({
      members: data.familyMembers || [],
      importantDates: data.importantDates || [],
    });
  }

  if (data.albums !== undefined) {
    useAlbumStore.setState({
      albums: data.albums || [],
      photos: data.photos || [],
    });
  }

  if (data.assets !== undefined) {
    useAssetsStore.setState({
      assets: data.assets || [],
      vehicles: data.vehicles || [],
      borrowItems: data.borrowItems || [],
    });
  }

  if (data.trips !== undefined) {
    useScheduleStore.setState({
      trips: data.trips || [],
      medications: data.medications || [],
      menuPlan: data.menuPlan || null,
    });
  }

  if (data.stickyNotes !== undefined) {
    useMemoStore.setState({
      stickyNotes: data.stickyNotes || [],
    });
  }

  if (data.settings !== undefined) {
    useSettingsStore.setState({
      settings: data.settings,
      isUnlocked: false,
    });
  }
};

export const downloadAsFile = (data: unknown, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readJsonFile = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (err) {
        reject(new Error('文件格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
};

export const getExportFilename = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  return `family-space-backup-${dateStr}.json`;
};
