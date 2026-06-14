import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Image,
  Wallet,
  CalendarDays,
  StickyNote,
  Settings,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '仪表盘' },
  { path: '/family', icon: Users, label: '家庭树' },
  { path: '/album', icon: Image, label: '相册' },
  { path: '/assets', icon: Wallet, label: '资产' },
  { path: '/schedule', icon: CalendarDays, label: '日程' },
  { path: '/memo', icon: StickyNote, label: '备忘' },
  { path: '/settings', icon: Settings, label: '导入导出' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-card flex flex-col h-screen sticky top-0 no-print">
      <div className="p-6 border-b border-warm-100">
        <h1 className="text-2xl font-bold text-primary-500 font-display flex items-center gap-2">
          <span className="text-3xl">🏠</span>
          家庭空间
        </h1>
        <p className="text-xs text-gray-400 mt-1">私密 · 安全 · 温暖</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warm-100">
        <div className="bg-gradient-to-r from-primary-50 to-warm-100 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700">本地存储</p>
          <p className="text-xs text-gray-500 mt-1">数据安全保存在您的设备上</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
