import { useNavigate } from 'react-router-dom';
import {
  Users,
  Image,
  Wallet,
  StickyNote,
  CalendarDays,
  Gift,
  Pill,
  ArrowRight,
  Calendar,
  Car,
  Plane,
  Heart,
} from 'lucide-react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useAssetsStore } from '@/store/useAssetsStore';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useMemoStore } from '@/store/useMemoStore';
import { daysUntil, formatDateShort, isToday, getTodayStr } from '@/utils/date';
import Avatar from '@/components/Avatar/Avatar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { members, importantDates } = useFamilyStore();
  const { photos, albums } = useAlbumStore();
  const { assets, vehicles, borrowItems } = useAssetsStore();
  const { medications, trips } = useScheduleStore();
  const { stickyNotes } = useMemoStore();

  const todayDates = importantDates.filter((d) => {
    if (d.repeatYearly) {
      const date = new Date(d.date);
      const today = new Date();
      return date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    }
    return isToday(d.date);
  });

  const todayMedications = medications.filter((m) => {
    const start = new Date(m.startDate);
    const end = new Date(m.endDate);
    const today = new Date();
    return today >= start && today <= end;
  });

  const upcomingTrips = trips
    .filter((t) => new Date(t.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const upcomingBorrows = borrowItems
    .filter((b) => !b.returned)
    .sort((a, b) => new Date(a.expectedReturn).getTime() - new Date(b.expectedReturn).getTime())
    .slice(0, 3);

  const stats = [
    { label: '家庭成员', value: members.length, icon: Users, color: 'bg-primary-500', bg: 'bg-primary-50' },
    { label: '照片数量', value: photos.length + albums.length, icon: Image, color: 'bg-sky-500', bg: 'bg-sky-50' },
    { label: '资产总数', value: assets.length + vehicles.length, icon: Wallet, color: 'bg-mint-500', bg: 'bg-mint-50' },
    { label: '便签数量', value: stickyNotes.length, icon: StickyNote, color: 'bg-sakura-500', bg: 'bg-sakura-50' },
  ];

  const quickLinks = [
    { label: '家庭树', icon: Users, path: '/family', color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: '相册', icon: Image, path: '/album', color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: '资产', icon: Wallet, path: '/assets', color: 'text-mint-500', bg: 'bg-mint-50' },
    { label: '日程', icon: CalendarDays, path: '/schedule', color: 'text-sakura-500', bg: 'bg-sakura-50' },
    { label: '备忘', icon: StickyNote, path: '/memo', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '导入导出', icon: ArrowRight, path: '/settings', color: 'text-gray-500', bg: 'bg-gray-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            欢迎回来！<span className="text-primary-500">🏠</span>
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card card-content flex items-center gap-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <Icon className={stat.color.replace('text-', 'text-').replace('500', '500')} size={28} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card card-content">
            <h2 className="section-title">
              <CalendarDays className="text-primary-500" size={24} />
              今日提醒
            </h2>
            <div className="space-y-3">
              {todayDates.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                    <Gift size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">今日重要日子</p>
                    {todayDates.map((d) => (
                      <p key={d.id} className="text-sm text-gray-600">
                        {d.title} 🎉
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {todayMedications.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-mint-50 rounded-xl">
                  <div className="w-10 h-10 bg-mint-500 rounded-full flex items-center justify-center text-white">
                    <Pill size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">今日用药提醒</p>
                    {todayMedications.slice(0, 3).map((m) => (
                      <p key={m.id} className="text-sm text-gray-600">
                        {m.name} - {m.dosage} ({m.times.join(', ')})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {todayDates.length === 0 && todayMedications.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar size={40} className="mx-auto mb-2 opacity-50" />
                  <p>今天没有特别的提醒事项</p>
                </div>
              )}
            </div>
          </div>

          <div className="card card-content">
            <h2 className="section-title">
              <Plane className="text-sky-500" size={24} />
              即将到来的行程
            </h2>
            {upcomingTrips.length > 0 ? (
              <div className="space-y-3">
                {upcomingTrips.map((trip) => {
                  const days = daysUntil(trip.startDate);
                  return (
                    <div
                      key={trip.id}
                      className="flex items-center gap-4 p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/schedule')}
                    >
                      <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                        {days <= 0 ? '✈️' : days + '天'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{trip.name}</p>
                        <p className="text-sm text-gray-500">
                          {trip.destination} · {formatDateShort(trip.startDate)}
                        </p>
                      </div>
                      <ArrowRight size={20} className="text-sky-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Plane size={36} className="mx-auto mb-2 opacity-50" />
                <p>暂无旅行计划</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card card-content">
            <h2 className="section-title">
              <Heart className="text-sakura-500" size={24} />
              快捷入口
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    onClick={() => navigate(link.path)}
                    className={`${link.bg} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all hover:-translate-y-1`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.bg}`}>
                      <Icon className={link.color} size={22} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card card-content">
            <h2 className="section-title">
              <Car className="text-mint-500" size={24} />
              借还提醒
            </h2>
            {upcomingBorrows.length > 0 ? (
              <div className="space-y-2">
                {upcomingBorrows.map((item) => {
                  const days = daysUntil(item.expectedReturn);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.type === 'lend' ? '借给' : '借自'} {item.person}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        days <= 7 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {days > 0 ? `还剩${days}天` : '已到期'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Car size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无借还物品</p>
              </div>
            )}
          </div>

          <div className="card card-content">
            <h2 className="section-title">
              <Users className="text-primary-500" size={24} />
              家庭成员
            </h2>
            <div className="flex -space-x-3">
              {members.slice(0, 6).map((member) => (
                <div key={member.id} className="relative">
                  <Avatar name={member.name} gender={member.gender} size="md" />
                </div>
              ))}
              {members.length > 6 && (
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-sm font-medium border-2 border-white">
                  +{members.length - 6}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
