import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Tv,
  Car,
  Package,
  Repeat,
  Calendar,
  Shield,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  Smartphone,
  Gem,
  Sofa,
} from 'lucide-react';
import { useAssetsStore } from '@/store/useAssetsStore';
import type { Asset, Vehicle, BorrowItem } from '@/types';
import { formatDate, daysUntil } from '@/utils/date';
import Modal from '@/components/Modal/Modal';
import Empty from '@/components/Empty/Empty';

type TabType = 'appliances' | 'vehicles' | 'assets' | 'borrow';

interface AssetsPageProps {
  initialTab?: string;
}

const AssetsPage = ({ initialTab }: AssetsPageProps) => {
  const tabMap: Record<string, TabType> = {
    list: 'assets',
    vehicle: 'vehicles',
    borrow: 'borrow',
    appliances: 'appliances',
    vehicles: 'vehicles',
    assets: 'assets',
  };

  const [activeTab, setActiveTab] = useState<TabType>(
    (initialTab && tabMap[initialTab]) || 'appliances'
  );

  useEffect(() => {
    if (initialTab && tabMap[initialTab]) {
      setActiveTab(tabMap[initialTab]);
    }
  }, [initialTab]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingBorrow, setEditingBorrow] = useState<BorrowItem | null>(null);

  const { assets, vehicles, borrowItems, addAsset, updateAsset, deleteAsset, addVehicle, updateVehicle, deleteVehicle, addBorrowItem, updateBorrowItem, deleteBorrowItem } = useAssetsStore();

  const tabs = [
    { key: 'appliances' as TabType, label: '家电保修', icon: Tv },
    { key: 'vehicles' as TabType, label: '车辆年检', icon: Car },
    { key: 'assets' as TabType, label: '资产清单', icon: Package },
    { key: 'borrow' as TabType, label: '借还登记', icon: Repeat },
  ];

  const applianceAssets = assets.filter((a) => a.category === 'appliance' || a.category === 'digital');
  const otherAssets = assets.filter((a) => a.category !== 'appliance' && a.category !== 'digital');

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
  };

  const handleSaveAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assetData = {
      name: formData.get('name') as string,
      category: formData.get('category') as Asset['category'],
      image: '',
      purchaseDate: formData.get('purchaseDate') as string,
      price: Number(formData.get('price')) || 0,
      warrantyPeriod: formData.get('warrantyPeriod') as string,
      warrantyExpiry: formData.get('warrantyExpiry') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      note: formData.get('note') as string,
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
    } else {
      addAsset(assetData);
    }
    setShowAssetModal(false);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const vehicleData = {
      name: formData.get('name') as string,
      plateNumber: formData.get('plateNumber') as string,
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      purchaseDate: formData.get('purchaseDate') as string,
      insuranceExpiry: formData.get('insuranceExpiry') as string,
      inspectionDate: formData.get('inspectionDate') as string,
      note: formData.get('note') as string,
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }
    setShowVehicleModal(false);
  };

  const handleAddBorrow = () => {
    setEditingBorrow(null);
    setShowBorrowModal(true);
  };

  const handleEditBorrow = (item: BorrowItem) => {
    setEditingBorrow(item);
    setShowBorrowModal(true);
  };

  const handleSaveBorrow = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const borrowData = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'lend' | 'borrow',
      person: formData.get('person') as string,
      date: formData.get('date') as string,
      expectedReturn: formData.get('expectedReturn') as string,
      returned: false,
      note: formData.get('note') as string,
    };

    if (editingBorrow) {
      updateBorrowItem(editingBorrow.id, borrowData);
    } else {
      addBorrowItem(borrowData);
    }
    setShowBorrowModal(false);
  };

  const getWarrantyStatus = (expiryDate: string) => {
    const days = daysUntil(expiryDate);
    if (days < 0) return { label: '已过保', color: 'bg-gray-100 text-gray-500', icon: AlertCircle };
    if (days <= 30) return { label: `还剩${days}天`, color: 'bg-red-100 text-red-600', icon: AlertCircle };
    if (days <= 90) return { label: `还剩${days}天`, color: 'bg-amber-100 text-amber-600', icon: Clock };
    return { label: '保修中', color: 'bg-green-100 text-green-600', icon: Shield };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appliance': return Tv;
      case 'digital': return Smartphone;
      case 'jewelry': return Gem;
      case 'furniture': return Sofa;
      default: return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'appliance': return 'bg-sky-100 text-sky-600';
      case 'digital': return 'bg-purple-100 text-purple-600';
      case 'jewelry': return 'bg-amber-100 text-amber-600';
      case 'furniture': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalValue = assets.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">资产 💰</h1>
          <p className="text-gray-500 mt-1">管理家庭资产和物品</p>
        </div>
      </div>

      <div className="card">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'appliances' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  共 {applianceAssets.length} 件家电/数码产品
                </p>
                <button onClick={handleAddAsset} className="btn btn-primary">
                  <Plus size={18} />
                  添加
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applianceAssets.map((asset) => {
                  const status = getWarrantyStatus(asset.warrantyExpiry);
                  const StatusIcon = status.icon;
                  const CategoryIcon = getCategoryIcon(asset.category);
                  return (
                    <div
                      key={asset.id}
                      className="p-4 bg-warm-50 rounded-2xl hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${getCategoryColor(asset.category)} rounded-xl flex items-center justify-center`}>
                          <CategoryIcon size={24} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除这个资产吗？')) {
                                deleteAsset(asset.id);
                              }
                            }}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800">{asset.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {asset.brand} {asset.model}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`badge ${status.color} flex items-center gap-1`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          ¥{asset.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {applianceAssets.length === 0 && (
                <Empty
                  icon={<Tv size={32} className="text-gray-400" />}
                  title="还没有家电/数码产品"
                  description="添加家电来管理保修信息"
                  action={
                    <button onClick={handleAddAsset} className="btn btn-primary">
                      <Plus size={18} />
                      添加
                    </button>
                  }
                />
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  共 {vehicles.length} 辆车
                </p>
                <button onClick={handleAddVehicle} className="btn btn-primary">
                  <Plus size={18} />
                  添加车辆
                </button>
              </div>
              <div className="space-y-4">
                {vehicles.map((vehicle) => {
                  const insuranceDays = daysUntil(vehicle.insuranceExpiry);
                  const inspectionDays = daysUntil(vehicle.inspectionDate);
                  return (
                    <div
                      key={vehicle.id}
                      className="p-5 bg-warm-50 rounded-2xl hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center">
                            <Car size={28} className="text-sky-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {vehicle.brand} {vehicle.model} · {vehicle.plateNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditVehicle(vehicle)}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除这辆车吗？')) {
                                deleteVehicle(vehicle.id);
                              }
                            }}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className={insuranceDays <= 30 ? 'text-red-500' : 'text-green-500'} />
                          <div>
                            <p className="text-xs text-gray-500">保险到期</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(vehicle.insuranceExpiry)}
                              {insuranceDays <= 30 && (
                                <span className="ml-2 text-red-500 text-xs">
                                  ({insuranceDays}天后)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className={inspectionDays <= 30 ? 'text-red-500' : 'text-green-500'} />
                          <div>
                            <p className="text-xs text-gray-500">年检日期</p>
                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(vehicle.inspectionDate)}
                              {inspectionDays <= 30 && (
                                <span className="ml-2 text-red-500 text-xs">
                                  ({inspectionDays}天后)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {vehicles.length === 0 && (
                <Empty
                  icon={<Car size={32} className="text-gray-400" />}
                  title="还没有车辆信息"
                  description="添加车辆来管理保险和年检提醒"
                  action={
                    <button onClick={handleAddVehicle} className="btn btn-primary">
                      <Plus size={18} />
                      添加车辆
                    </button>
                  }
                />
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    共 {otherAssets.length} 项资产
                  </p>
                  <p className="text-lg font-bold text-primary-500">
                    总价值: ¥{totalValue.toLocaleString()}
                  </p>
                </div>
                <button onClick={handleAddAsset} className="btn btn-primary">
                  <Plus size={18} />
                  添加资产
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherAssets.map((asset) => {
                  const CategoryIcon = getCategoryIcon(asset.category);
                  return (
                    <div
                      key={asset.id}
                      className="p-4 bg-warm-50 rounded-2xl hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${getCategoryColor(asset.category)} rounded-xl flex items-center justify-center`}>
                          <CategoryIcon size={24} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除这个资产吗？')) {
                                deleteAsset(asset.id);
                              }
                            }}
                            className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800">{asset.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {asset.brand} {asset.model}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          购买于 {formatDate(asset.purchaseDate)}
                        </span>
                        <span className="text-lg font-bold text-primary-500">
                          ¥{asset.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {otherAssets.length === 0 && (
                <Empty
                  icon={<Package size={32} className="text-gray-400" />}
                  title="还没有资产记录"
                  description="添加家庭贵重物品来管理资产"
                  action={
                    <button onClick={handleAddAsset} className="btn btn-primary">
                      <Plus size={18} />
                      添加资产
                    </button>
                  }
                />
              )}
            </div>
          )}

          {activeTab === 'borrow' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <span className="badge bg-green-100 text-green-600">
                    借出: {borrowItems.filter((b) => b.type === 'lend' && !b.returned).length}
                  </span>
                  <span className="badge bg-orange-100 text-orange-600">
                    借入: {borrowItems.filter((b) => b.type === 'borrow' && !b.returned).length}
                  </span>
                </div>
                <button onClick={handleAddBorrow} className="btn btn-primary">
                  <Plus size={18} />
                  登记
                </button>
              </div>
              <div className="space-y-3">
                {borrowItems.map((item) => {
                  const days = daysUntil(item.expectedReturn);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl transition-all group ${
                        item.returned ? 'bg-gray-50 opacity-60' : 'bg-warm-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            item.type === 'lend' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {item.type === 'lend' ? '→' : '←'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800">
                                {item.name}
                              </h3>
                              <span className={`badge ${
                                item.type === 'lend' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {item.type === 'lend' ? '借出' : '借入'}
                              </span>
                              {item.returned && (
                                <span className="badge bg-gray-200 text-gray-600">
                                  已归还
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {item.type === 'lend' ? '借给' : '借自'} {item.person} · {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {!item.returned && (
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                days <= 0 ? 'text-red-500' : 'text-gray-600'
                              }`}>
                                {days > 0 ? `还有${days}天` : '已到期'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(item.expectedReturn)}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!item.returned && (
                              <button
                                onClick={() =>
                                  updateBorrowItem(item.id, { returned: true })
                                }
                                className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-green-500"
                                title="标记已归还"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditBorrow(item)}
                              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定删除这条记录吗？')) {
                                  deleteBorrowItem(item.id);
                                }
                              }}
                              className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {borrowItems.length === 0 && (
                <Empty
                  icon={<Repeat size={32} className="text-gray-400" />}
                  title="还没有借还记录"
                  description="记录借出和借入的物品"
                  action={
                    <button onClick={handleAddBorrow} className="btn btn-primary">
                      <Plus size={18} />
                      登记
                    </button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        title={editingAsset ? '编辑资产' : '添加资产'}
        size="lg"
      >
        <form onSubmit={handleSaveAsset} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">名称 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingAsset?.name}
                required
              />
            </div>
            <div>
              <label className="label">类别</label>
              <select
                name="category"
                className="input"
                defaultValue={editingAsset?.category || 'appliance'}
              >
                <option value="appliance">家电</option>
                <option value="digital">数码产品</option>
                <option value="furniture">家具</option>
                <option value="jewelry">珠宝首饰</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">品牌</label>
              <input
                name="brand"
                type="text"
                className="input"
                defaultValue={editingAsset?.brand}
              />
            </div>
            <div>
              <label className="label">型号</label>
              <input
                name="model"
                type="text"
                className="input"
                defaultValue={editingAsset?.model}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">购买日期</label>
              <input
                name="purchaseDate"
                type="date"
                className="input"
                defaultValue={editingAsset?.purchaseDate}
              />
            </div>
            <div>
              <label className="label">价格 (元)</label>
              <input
                name="price"
                type="number"
                className="input"
                defaultValue={editingAsset?.price}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">保修期限</label>
              <input
                name="warrantyPeriod"
                type="text"
                className="input"
                defaultValue={editingAsset?.warrantyPeriod}
                placeholder="如：1年、2年"
              />
            </div>
            <div>
              <label className="label">保修到期日</label>
              <input
                name="warrantyExpiry"
                type="date"
                className="input"
                defaultValue={editingAsset?.warrantyExpiry}
              />
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[60px]"
              defaultValue={editingAsset?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAssetModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title={editingVehicle ? '编辑车辆' : '添加车辆'}
        size="lg"
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">车辆名称 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingVehicle?.name || '我的车'}
                required
              />
            </div>
            <div>
              <label className="label">车牌号</label>
              <input
                name="plateNumber"
                type="text"
                className="input"
                defaultValue={editingVehicle?.plateNumber}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">品牌</label>
              <input
                name="brand"
                type="text"
                className="input"
                defaultValue={editingVehicle?.brand}
              />
            </div>
            <div>
              <label className="label">型号</label>
              <input
                name="model"
                type="text"
                className="input"
                defaultValue={editingVehicle?.model}
              />
            </div>
          </div>
          <div>
            <label className="label">购买日期</label>
            <input
              name="purchaseDate"
              type="date"
              className="input"
              defaultValue={editingVehicle?.purchaseDate}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">保险到期日</label>
              <input
                name="insuranceExpiry"
                type="date"
                className="input"
                defaultValue={editingVehicle?.insuranceExpiry}
              />
            </div>
            <div>
              <label className="label">年检日期</label>
              <input
                name="inspectionDate"
                type="date"
                className="input"
                defaultValue={editingVehicle?.inspectionDate}
              />
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[60px]"
              defaultValue={editingVehicle?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowVehicleModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title={editingBorrow ? '编辑借还记录' : '借还登记'}
      >
        <form onSubmit={handleSaveBorrow} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">物品名称 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingBorrow?.name}
                required
              />
            </div>
            <div>
              <label className="label">类型</label>
              <select
                name="type"
                className="input"
                defaultValue={editingBorrow?.type || 'lend'}
              >
                <option value="lend">借出</option>
                <option value="borrow">借入</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">对方姓名</label>
            <input
              name="person"
              type="text"
              className="input"
              defaultValue={editingBorrow?.person}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">日期</label>
              <input
                name="date"
                type="date"
                className="input"
                defaultValue={editingBorrow?.date}
              />
            </div>
            <div>
              <label className="label">预计归还</label>
              <input
                name="expectedReturn"
                type="date"
                className="input"
                defaultValue={editingBorrow?.expectedReturn}
              />
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[60px]"
              defaultValue={editingBorrow?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBorrowModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetsPage;
