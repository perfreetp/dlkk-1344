export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  birthDate: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
  note: string;
  parentIds: string[];
  spouseId?: string;
  gender: 'male' | 'female';
}

export interface ImportantDate {
  id: string;
  memberId?: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'festival' | 'other';
  repeatYearly: boolean;
  note: string;
}

export interface Album {
  id: string;
  name: string;
  cover: string;
  tags: string[];
  createdAt: string;
}

export interface Photo {
  id: string;
  albumId: string;
  dataUrl: string;
  name: string;
  tags: string[];
  order: number;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'appliance' | 'furniture' | 'jewelry' | 'digital' | 'other';
  image: string;
  purchaseDate: string;
  price: number;
  warrantyPeriod: string;
  warrantyExpiry: string;
  note: string;
  brand: string;
  model: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  brand: string;
  model: string;
  purchaseDate: string;
  insuranceExpiry: string;
  inspectionDate: string;
  note: string;
}

export interface BorrowItem {
  id: string;
  name: string;
  type: 'lend' | 'borrow';
  person: string;
  date: string;
  expectedReturn: string;
  returned: boolean;
  note: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: string;
  budget: number;
  checklist: { id: string; text: string; done: boolean }[];
  note: string;
}

export interface Medication {
  id: string;
  name: string;
  memberId: string;
  dosage: string;
  times: string[];
  frequency: 'daily' | 'weekly' | 'as-needed';
  startDate: string;
  endDate: string;
  note: string;
}

export interface MenuPlan {
  weekStart: string;
  meals: {
    day: number;
    type: 'breakfast' | 'lunch' | 'dinner';
    dishes: string[];
  }[];
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  positionX: number;
  positionY: number;
  createdAt: string;
}

export interface AppSettings {
  passwordHash: string | null;
  theme: 'light' | 'warm';
  lastBackup: string | null;
}

export interface AppData {
  familyMembers: FamilyMember[];
  importantDates: ImportantDate[];
  albums: Album[];
  photos: Photo[];
  assets: Asset[];
  vehicles: Vehicle[];
  borrowItems: BorrowItem[];
  trips: Trip[];
  medications: Medication[];
  menuPlan: MenuPlan | null;
  stickyNotes: StickyNote[];
  settings: AppSettings;
}

export type SearchResult = {
  type: string;
  item: unknown;
  title: string;
  description: string;
  route?: string;
  params?: Record<string, string | number>;
};
