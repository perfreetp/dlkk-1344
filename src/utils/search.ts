import type { SearchResult } from '@/types';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useAssetsStore } from '@/store/useAssetsStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useMemoStore } from '@/store/useMemoStore';
import { getWeekDates, getWeekDayName } from '@/utils/date';

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
      member.note.toLowerCase().includes(lowerKeyword) ||
      member.address.toLowerCase().includes(lowerKeyword)
    ) {
      results.push({
        type: '家庭成员',
        item: member,
        title: member.name,
        description:
          member.relation +
          (member.phone ? ' · ' + member.phone : '') +
          (member.address ? ' · ' + member.address : ''),
        route: '/family',
        params: { memberId: member.id, tab: 'members' },
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
        route: '/family',
        params: { tab: 'dates' },
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
        route: '/album',
        params: { albumId: album.id },
      });
    }
  });

  albumState.photos.forEach((photo) => {
    if (
      photo.name.toLowerCase().includes(lowerKeyword) ||
      photo.tags.some((t) => t.toLowerCase().includes(lowerKeyword))
    ) {
      const album = albumState.albums.find((a) => a.id === photo.albumId);
      results.push({
        type: '照片',
        item: photo,
        title: photo.name,
        description:
          (album ? album.name + ' · ' : '') + photo.tags.join('、'),
        route: '/album',
        params: { albumId: photo.albumId, photoId: photo.id },
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
        route: '/assets',
        params: { tab: 'list' },
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
        route: '/assets',
        params: { tab: 'vehicle' },
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
        description:
          item.person + ' · ' + (item.type === 'lend' ? '借出' : '借入'),
        route: '/assets',
        params: { tab: 'borrow' },
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
        route: '/schedule',
        params: { tab: 'trips', tripId: trip.id },
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
        route: '/schedule',
        params: { tab: 'medications' },
      });
    }
  });

  if (scheduleState.menuPlan) {
    const { menuPlan } = scheduleState;
    const weekDates = getWeekDates(menuPlan.weekStart);
    const mealTypeNames: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
    };
    const weekNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const keywordIsMealType = ['早餐', '午餐', '晚餐'].some(
      (name) => name.includes(keyword.trim()) || keyword.trim().includes(name)
    );
    const keywordIsWeekday = weekNames.some(
      (name) => name.includes(keyword.trim()) || keyword.trim().includes(name)
    );

    menuPlan.meals.forEach((meal) => {
      const mealTypeName = mealTypeNames[meal.type];
      const weekName = weekNames[meal.day];
      const date = weekDates[meal.day];
      const dateStr = date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });

      const matchesDish = meal.dishes.some((dish) =>
        dish.toLowerCase().includes(lowerKeyword)
      );
      const matchesMealType =
        keywordIsMealType && mealTypeName.includes(keyword.trim());
      const matchesWeekday =
        keywordIsWeekday && weekName.includes(keyword.trim());

      if (matchesDish || matchesMealType || matchesWeekday) {
        const firstDish = meal.dishes[0] || '（空）';
        results.push({
          type: '周菜单',
          item: { ...meal },
          title: `🍽️ ${weekName}${mealTypeName}`,
          description: `${menuPlan.weekStart.slice(
            0,
            7
          )}周 · ${dateStr} · ${meal.dishes.join('、') || '暂无菜品'}`,
          route: '/schedule',
          params: {
            tab: 'menu',
            weekStart: menuPlan.weekStart,
            day: meal.day,
            mealType: meal.type,
          },
        });
      }
    });
  }

  const memoState = useMemoStore.getState();
  memoState.stickyNotes.forEach((note) => {
    if (note.content.toLowerCase().includes(lowerKeyword)) {
      results.push({
        type: '便签',
        item: note,
        title:
          note.content.slice(0, 20) +
          (note.content.length > 20 ? '...' : ''),
        description: '便签墙',
        route: '/memo',
        params: { tab: 'wall' },
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
