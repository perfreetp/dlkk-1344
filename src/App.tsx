import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Lock, Shield } from 'lucide-react';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import FamilyPage from '@/pages/Family/FamilyPage';
import AlbumPage from '@/pages/Album/AlbumPage';
import AssetsPage from '@/pages/Assets/AssetsPage';
import SchedulePage from '@/pages/Schedule/SchedulePage';
import MemoPage from '@/pages/Memo/MemoPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import { useSettingsStore } from '@/store/useSettingsStore';
import { verifyPassword } from '@/utils/crypto';

function App() {
  const { settings, setUnlocked, isUnlocked } = useSettingsStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showFirstTime, setShowFirstTime] = useState(false);

  useEffect(() => {
    const hasData = localStorage.getItem('family-space-family');
    if (!settings.passwordHash && hasData) {
      setShowFirstTime(true);
    }
  }, [settings.passwordHash]);

  const handleUnlock = async () => {
    if (!settings.passwordHash) {
      setUnlocked(true);
      return;
    }

    try {
      const valid = await verifyPassword(password, settings.passwordHash);
      if (valid) {
        setUnlocked(true);
        setPassword('');
        setError('');
      } else {
        setError('密码错误，请重试');
      }
    } catch {
      setError('验证失败');
    }
  };

  const handleSkip = () => {
    setUnlocked(true);
    setShowFirstTime(false);
  };

  const needsPassword = settings.passwordHash && !isUnlocked;

  if (needsPassword || showFirstTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-50 to-primary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 font-display">
              家庭空间
            </h1>
            <p className="text-gray-500 mt-2">私密 · 安全 · 温暖</p>
          </div>

          <div className="bg-white rounded-3xl shadow-card p-8">
            {showFirstTime && !settings.passwordHash ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">欢迎使用！</h2>
                  <p className="text-gray-500 text-sm mt-2">
                    您的数据将安全地保存在本地设备上
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                    <span className="text-lg">🔒</span>
                    <p className="text-sm text-gray-600">所有数据仅保存在您的设备上</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                    <span className="text-lg">📦</span>
                    <p className="text-sm text-gray-600">支持导出备份，随时迁移</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
                    <span className="text-lg">🏠</span>
                    <p className="text-sm text-gray-600">记录家庭温馨时光</p>
                  </div>
                </div>

                <button
                  onClick={handleSkip}
                  className="btn btn-primary w-full text-lg py-3"
                >
                  开始使用
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  可在「导入导出」中设置密码保护
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} className="text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">请输入密码</h2>
                  <p className="text-gray-500 text-sm mt-2">验证密码以访问您的数据</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="请输入密码"
                      className="input text-center text-lg py-4"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUnlock();
                      }}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <button
                    onClick={handleUnlock}
                    className="btn btn-primary w-full"
                  >
                    解锁
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                  忘记密码？只能清空数据重新开始
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/album" element={<AlbumPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/memo" element={<MemoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
