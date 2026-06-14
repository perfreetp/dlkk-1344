import { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  Lock,
  Unlock,
  Shield,
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileJson,
  Settings,
  Users,
  Images,
  Package,
  StickyNote as StickyNoteIcon,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useAssetsStore } from '@/store/useAssetsStore';
import { useMemoStore } from '@/store/useMemoStore';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import {
  exportAllData,
  importAllData,
  downloadAsFile,
  readJsonFile,
  getExportFilename,
} from '@/utils/export';
import {
  getStorageSize,
  formatFileSize,
  clearAllZustandStorage,
} from '@/utils/storage';
import Modal from '@/components/Modal/Modal';
import type { AppData } from '@/types';

const SettingsPage = () => {
  const { settings, setPassword, setUnlocked, isUnlocked } =
    useSettingsStore();
  const { members } = useFamilyStore();
  const { photos } = useAlbumStore();
  const { assets } = useAssetsStore();
  const { stickyNotes } = useMemoStore();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [passwordMode, setPasswordMode] = useState<
    'set' | 'verify' | 'change'
  >('set');
  const [storageSize, setStorageSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<AppData | null>(null);

  const hasPassword = !!settings.passwordHash;

  useEffect(() => {
    setStorageSize(getStorageSize());
  }, []);

  const handleExport = async () => {
    if (hasPassword && !isUnlocked) {
      setPasswordMode('verify');
      setShowPasswordModal(true);
      return;
    }
    doExport();
  };

  const doExport = () => {
    const data = exportAllData();
    const filename = getExportFilename();
    downloadAsFile(data, filename);
    setStorageSize(getStorageSize());
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = (await readJsonFile(file)) as AppData;
      setImportData(data);
      setShowImportConfirm(true);
    } catch (err) {
      alert('导入失败：文件格式错误');
    }
    e.target.value = '';
  };

  const confirmImport = () => {
    if (importData) {
      importAllData(importData);
      setShowImportConfirm(false);
      setImportData(null);
      setStorageSize(getStorageSize());
      setTimeout(() => {
        alert('导入成功！数据已恢复，即将刷新页面...');
        window.location.reload();
      }, 300);
    }
  };

  const handleSetPassword = () => {
    if (hasPassword && !isUnlocked) {
      setPasswordMode('verify');
    } else {
      setPasswordMode(hasPassword ? 'change' : 'set');
    }
    setShowPasswordModal(true);
  };

  const handleClearData = () => {
    setShowClearConfirm(true);
  };

  const doClearData = () => {
    clearAllZustandStorage();
    setShowClearConfirm(false);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleUnlock = async (password: string) => {
    if (settings.passwordHash) {
      const valid = await verifyPassword(password, settings.passwordHash);
      if (valid) {
        setUnlocked(true);
        setShowPasswordModal(false);
        return true;
      }
      return false;
    }
    return false;
  };

  const handleSetNewPassword = async (password: string) => {
    const hash = await hashPassword(password);
    setPassword(hash);
    setUnlocked(true);
    setShowPasswordModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">导入导出 ⚙️</h1>
        <p className="text-gray-500 mt-1">数据管理和隐私设置</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card card-content">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <Download size={28} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">导出数据</h3>
              <p className="text-sm text-gray-500">
                将所有数据打包为JSON文件下载，包含密码设置
              </p>
            </div>
          </div>
          <button onClick={handleExport} className="btn btn-primary w-full">
            <Download size={20} />
            导出备份文件
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            建议定期备份数据，以防意外丢失
          </p>
        </div>

        <div className="card card-content">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Upload size={28} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">导入数据</h3>
              <p className="text-sm text-gray-500">
                从备份文件恢复所有数据和密码设置
              </p>
            </div>
          </div>
          <button onClick={handleImportClick} className="btn btn-secondary w-full">
            <Upload size={20} />
            选择文件导入
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-3 text-center">
            导入将覆盖当前所有数据，页面会自动刷新
          </p>
        </div>
      </div>

      <div className="card card-content">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              hasPassword ? 'bg-primary-100' : 'bg-gray-100'
            }`}
          >
            {hasPassword ? (
              <Lock size={28} className="text-primary-600" />
            ) : (
              <Unlock size={28} className="text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">隐私密码</h3>
            <p className="text-sm text-gray-500">
              {hasPassword
                ? '已设置密码保护，打开应用需要验证'
                : '未设置密码，任何人都可以查看'}
            </p>
          </div>
          <button onClick={handleSetPassword} className="btn btn-secondary">
            <Settings size={18} />
            {hasPassword ? '修改密码' : '设置密码'}
          </button>
        </div>

        <div
          className={`p-4 rounded-xl ${
            hasPassword ? 'bg-green-50' : 'bg-amber-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {hasPassword ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600" />
            )}
            <span
              className={`text-sm ${
                hasPassword ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {hasPassword
                ? '您的隐私数据已受密码保护，密码已包含在备份文件中'
                : '建议设置密码来保护您的隐私数据'}
            </span>
          </div>
        </div>
      </div>

      <div className="card card-content">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Database size={28} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">存储信息</h3>
            <p className="text-sm text-gray-500">
              当前占用空间：
              <span className="font-semibold text-gray-700 ml-1">
                {formatFileSize(storageSize)}
              </span>
            </p>
          </div>
          <button
            onClick={() => setStorageSize(getStorageSize())}
            className="btn btn-ghost"
          >
            刷新
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-warm-50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Users size={18} className="text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-primary-500">
              {members.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">家庭成员</p>
          </div>
          <div className="p-4 bg-sky-50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Images size={18} className="text-sky-500" />
            </div>
            <p className="text-2xl font-bold text-sky-500">{photos.length}</p>
            <p className="text-xs text-gray-500 mt-1">照片数量</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Package size={18} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{assets.length}</p>
            <p className="text-xs text-gray-500 mt-1">资产数量</p>
          </div>
          <div className="p-4 bg-pink-50 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <StickyNoteIcon size={18} className="text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-pink-500">
              {stickyNotes.filter((n) => n.content).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">便签数量</p>
          </div>
        </div>
      </div>

      <div className="card card-content border-red-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <Trash2 size={28} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">危险操作</h3>
            <p className="text-sm text-gray-500">
              清空所有本地数据，重新进入将是全新的空白状态
            </p>
          </div>
        </div>
        <button
          onClick={handleClearData}
          className="btn w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
        >
          <Trash2 size={20} />
          清空所有数据
        </button>
        <p className="text-xs text-red-400 mt-2 text-center">
          此操作不可恢复，建议先导出备份
        </p>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={
          passwordMode === 'set'
            ? '设置密码'
            : passwordMode === 'verify'
            ? '验证密码'
            : '修改密码'
        }
      >
        <PasswordModal
          mode={passwordMode}
          onVerify={handleUnlock}
          onSet={handleSetNewPassword}
          hasPassword={hasPassword}
          onClose={() => setShowPasswordModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showImportConfirm}
        onClose={() => setShowImportConfirm(false)}
        title="确认导入"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-amber-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium text-amber-800">重要提醒</p>
                <p className="text-sm text-amber-700 mt-1">
                  导入数据将覆盖当前所有数据，包含密码设置。
                  导入完成后页面将自动刷新，请耐心等待。
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <FileJson size={24} className="text-blue-500" />
            <div>
              <p className="font-medium text-gray-800">备份文件</p>
              <p className="text-sm text-gray-500">
                包含{importData ? '：' + importData.familyMembers?.length + '位成员，' + importData.photos?.length + '张照片等' : '所有家庭数据和密码设置'}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowImportConfirm(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={confirmImport} className="btn btn-primary">
              确认导入
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认清空所有数据"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium text-red-800">
                  此操作将永久删除所有数据！
                </p>
                <p className="text-sm text-red-700 mt-1">
                  包括家庭成员、照片、资产、日程、便签和密码设置。
                  页面将自动刷新，进入全新的空白状态。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="confirm1"
                className="w-4 h-4 text-red-500 rounded"
              />
              <span>我知道我在做什么，不是误操作</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                id="confirm2"
                className="w-4 h-4 text-red-500 rounded"
              />
              <span>我已经导出了必要的备份文件（可选）</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={doClearData} className="btn bg-red-500 text-white hover:bg-red-600">
              确认清空
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface PasswordModalProps {
  mode: 'set' | 'verify' | 'change';
  onVerify: (password: string) => Promise<boolean>;
  onSet: (password: string) => Promise<void>;
  hasPassword: boolean;
  onClose: () => void;
}

const PasswordModal = ({
  mode,
  onVerify,
  onSet,
  hasPassword,
}: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleVerify = async () => {
    const valid = await onVerify(password);
    if (valid) {
      if (mode === 'change') {
        setStep(2);
        setPassword('');
      }
    } else {
      setError('密码错误');
    }
  };

  const handleSet = async () => {
    if (!newPassword) {
      setError('请输入新密码');
      return;
    }
    if (newPassword.length < 4) {
      setError('密码至少4位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    await onSet(newPassword);
  };

  const showStep1 = mode === 'verify' || (mode === 'change' && step === 1);
  const showStep2 = mode === 'set' || (mode === 'change' && step === 2);

  return (
    <div className="space-y-4">
      {showStep1 && (
        <>
          <div>
            <label className="label">输入密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="input"
              placeholder="请输入密码"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setPassword('');
              }}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button onClick={handleVerify} className="btn btn-primary">
              验证
            </button>
          </div>
        </>
      )}

      {showStep2 && (
        <>
          <div>
            <label className="label">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              className="input"
              placeholder="请输入新密码"
              autoFocus
            />
          </div>
          <div>
            <label className="label">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="input"
              placeholder="请再次输入密码"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSet();
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <p className="text-xs text-gray-400">
            密码用于保护您的隐私数据，请牢记密码。
            忘记密码将无法恢复数据，只能清空重置。
            密码设置将包含在导出备份中。
          </p>
          <div className="flex justify-end gap-3 pt-2">
            {mode === 'change' && step === 2 && (
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                返回
              </button>
            )}
            <button onClick={handleSet} className="btn btn-primary">
              设置
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsPage;
