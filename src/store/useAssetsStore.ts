import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Asset, Vehicle, BorrowItem } from '@/types';
import { generateId } from '@/utils/storage';

interface AssetsState {
  assets: Asset[];
  vehicles: Vehicle[];
  borrowItems: BorrowItem[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addBorrowItem: (item: Omit<BorrowItem, 'id'>) => void;
  updateBorrowItem: (id: string, item: Partial<BorrowItem>) => void;
  deleteBorrowItem: (id: string) => void;
}

const defaultAssets: Asset[] = [
  {
    id: 'asset-1',
    name: '冰箱',
    category: 'appliance',
    image: '',
    purchaseDate: '2022-05-10',
    price: 4599,
    warrantyPeriod: '3年',
    warrantyExpiry: '2025-05-09',
    brand: '海尔',
    model: 'BCD-470WGH',
    note: '对开门冰箱，容量470升',
  },
  {
    id: 'asset-2',
    name: '笔记本电脑',
    category: 'digital',
    image: '',
    purchaseDate: '2023-09-01',
    price: 6999,
    warrantyPeriod: '2年',
    warrantyExpiry: '2025-08-31',
    brand: '联想',
    model: 'ThinkPad X1',
    note: '工作用电脑',
  },
];

const defaultVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    name: '家用轿车',
    plateNumber: '京A12345',
    brand: '丰田',
    model: '凯美瑞',
    purchaseDate: '2021-06-15',
    insuranceExpiry: '2025-06-14',
    inspectionDate: '2025-06-30',
    note: '家庭日常用车',
  },
];

const defaultBorrowItems: BorrowItem[] = [
  {
    id: 'borrow-1',
    name: '电钻',
    type: 'lend',
    person: '王叔叔',
    date: '2024-10-01',
    expectedReturn: '2024-12-01',
    returned: false,
    note: '装修用的电钻',
  },
];

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set) => ({
      assets: defaultAssets,
      vehicles: defaultVehicles,
      borrowItems: defaultBorrowItems,
      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, { ...asset, id: generateId() }],
        })),
      updateAsset: (id, asset) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...asset } : a
          ),
        })),
      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),
      addVehicle: (vehicle) =>
        set((state) => ({
          vehicles: [...state.vehicles, { ...vehicle, id: generateId() }],
        })),
      updateVehicle: (id, vehicle) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...vehicle } : v
          ),
        })),
      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),
      addBorrowItem: (item) =>
        set((state) => ({
          borrowItems: [...state.borrowItems, { ...item, id: generateId() }],
        })),
      updateBorrowItem: (id, item) =>
        set((state) => ({
          borrowItems: state.borrowItems.map((b) =>
            b.id === id ? { ...b, ...item } : b
          ),
        })),
      deleteBorrowItem: (id) =>
        set((state) => ({
          borrowItems: state.borrowItems.filter((b) => b.id !== id),
        })),
    }),
    {
      name: 'family-space-assets',
    }
  )
);
