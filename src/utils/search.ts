import type { SearchResult } from '@/types';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useAssetsStore } from '@/store/useAssetsStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useMemoStore } from '@/store/useMemoStore';

export const searchAll = (keyword: string): SearchResult[] => {
  if (!keyword.trim()) return [];
  
  const results: SearchResult[] = [];
  const lowerKeyword = keyword.toLowerCase();
  
  const familyState = useFamilyStore.getState();
  familyState.members.forEach((member) => {
    if (
      member.name.toLowerCase().includes(lowerKeyword) ||
      member.relation.toLowerCase().includes(lowerKeyword) ||
      member.phone.includes(keyword) ||
      member.email.toLowerCase().includes(lowerKeyword) ||
      member.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '家庭成员',
        item: member,
        title: member.name,
        description: member.relation + ' · ' + member.phone,
      });
    }
  });
  
  familyState.importantDates.forEach((date) => {
    if (
      date.title.toLowerCase().includes(lowerKeyword) ||
      date.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '重要日期',
        item: date,
        title: date.title,
        description: date.date + ' · ' + getDateTypeName(date.type),
      });
    }
  });
  
  const albumState = useAlbumStore.getState();
  albumState.albums.forEach((album) => {
    if (
      album.name.toLowerCase().includes(lowerKeyword) ||
      album.tags.some((t) => t.toLowerCase().includes(lowerKeyword))
    ) {
      results.push({
        type: '相册',
        item: album,
        title: album.name,
        description: album.tags.join('、'),
      });
    }
  });
  
  albumState.photos.forEach((photo) => {
    if (
      photo.name.toLowerCase().includes(lowerKeyword) ||
      photo.tags.some((t) => t.toLowerCase().includes(lowerKeyword))
    ) {
      results.push({
        type: '照片',
        item: photo,
        title: photo.name,
        description: photo.tags.join('、'),
      });
    }
  });
  
  const assetsState = useAssetsStore.getState();
  assetsState.assets.forEach((asset) => {
    if (
      asset.name.toLowerCase().includes(lowerKeyword) ||
      asset.brand.toLowerCase().includes(lowerKeyword) ||
      asset.model.toLowerCase().includes(lowerKeyword) ||
      asset.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '资产',
        item: asset,
        title: asset.name,
        description: asset.brand + ' ' + asset.model,
      });
    }
  });
  
  assetsState.vehicles.forEach((vehicle) => {
    if (
      vehicle.name.toLowerCase().includes(lowerKeyword) ||
      vehicle.plateNumber.includes(keyword) ||
      vehicle.brand.toLowerCase().includes(lowerKeyword) ||
      vehicle.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '车辆',
        item: vehicle,
        title: vehicle.name,
        description: vehicle.plateNumber + ' · ' + vehicle.brand,
      });
    }
  });
  
  assetsState.borrowItems.forEach((item) => {
    if (
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.person.toLowerCase().includes(lowerKeyword) ||
      item.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '借还物品',
        item: item,
        title: item.name,
        description: item.person + ' · ' + (item.type === 'lend' ? '借出' : '借入'),
      });
    }
  });
  
  const scheduleState = useScheduleStore.getState();
  scheduleState.trips.forEach((trip) => {
    if (
      trip.name.toLowerCase().includes(lowerKeyword) ||
      trip.destination.toLowerCase().includes(lowerKeyword) ||
      trip.note.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '旅行计划',
        item: trip,
        title: trip.name,
        description: trip.destination + ' · ' + trip.startDate,
      });
    }
  });
  
  scheduleState.medications.forEach((med) => {
    if (
      med.name.toLowerCase().includes(lowerKeyword) ||
      med.dosage.toLowerCase().includes(lowerKeyword) ||
      med.note.toLowerCase().includes(lowerKeyword)
    ) {
      const member = familyState.members.find((m) => m.id === med.memberId);
      results.push({
        type: '用药提醒',
        item: med,
        title: med.name,
        description: (member?.name || '') + ' · ' + med.dosage,
      });
    }
  });
  
  const memoState = useMemoStore.getState();
  memoState.stickyNotes.forEach((note) => {
    if (note.content.toLowerCase().includes(lowerKeyword)) {
      results.push({
        type: '便签',
        item: note,
        title: note.content.slice(0, 20) + (note.content.length > 20 ? '...' : ''),
        description: '便签',
      });
    }
  });
  
  return results;
};

const getDateTypeName = (type: string): string => {
  const map: Record<string, string> = {
    birthday: '生日',
    anniversary: '纪念日',
    festival: '节日',
    other: '其他',
  };
  return map[type] || type;
};
