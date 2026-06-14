import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember, ImportantDate } from '@/types';
import { generateId } from '@/utils/storage';

interface FamilyState {
  members: FamilyMember[];
  importantDates: ImportantDate[];
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateMember: (id: string, member: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  addImportantDate: (date: Omit<ImportantDate, 'id'>) => void;
  updateImportantDate: (id: string, date: Partial<ImportantDate>) => void;
  deleteImportantDate: (id: string) => void;
}

const defaultMembers: FamilyMember[] = [
  {
    id: 'member-1',
    name: '张伟',
    avatar: '',
    birthDate: '1985-03-15',
    relation: '父亲',
    phone: '13800138001',
    email: 'zhangwei@example.com',
    address: '北京市朝阳区幸福小区1号楼',
    note: '喜欢钓鱼和下棋',
    parentIds: [],
    spouseId: 'member-2',
    gender: 'male',
  },
  {
    id: 'member-2',
    name: '李芳',
    avatar: '',
    birthDate: '1987-08-20',
    relation: '母亲',
    phone: '13800138002',
    email: 'lifang@example.com',
    address: '北京市朝阳区幸福小区1号楼',
    note: '喜欢烹饪和园艺',
    parentIds: [],
    spouseId: 'member-1',
    gender: 'female',
  },
  {
    id: 'member-3',
    name: '张小明',
    avatar: '',
    birthDate: '2010-06-01',
    relation: '儿子',
    phone: '',
    email: '',
    address: '',
    note: '小学五年级，喜欢踢足球',
    parentIds: ['member-1', 'member-2'],
    gender: 'male',
  },
  {
    id: 'member-4',
    name: '张小红',
    avatar: '',
    birthDate: '2013-12-25',
    relation: '女儿',
    phone: '',
    email: '',
    address: '',
    note: '小学二年级，喜欢画画',
    parentIds: ['member-1', 'member-2'],
    gender: 'female',
  },
];

const defaultDates: ImportantDate[] = [
  {
    id: 'date-1',
    memberId: 'member-1',
    title: '张伟的生日',
    date: '1985-03-15',
    type: 'birthday',
    repeatYearly: true,
    note: '爸爸生日',
  },
  {
    id: 'date-2',
    memberId: 'member-2',
    title: '李芳的生日',
    date: '1987-08-20',
    type: 'birthday',
    repeatYearly: true,
    note: '妈妈生日',
  },
  {
    id: 'date-3',
    memberId: 'member-3',
    title: '小明的生日',
    date: '2010-06-01',
    type: 'birthday',
    repeatYearly: true,
    note: '儿童节生日',
  },
  {
    id: 'date-4',
    title: '结婚纪念日',
    date: '2008-10-01',
    type: 'anniversary',
    repeatYearly: true,
    note: '结婚纪念日',
  },
];

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set) => ({
      members: defaultMembers,
      importantDates: defaultDates,
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),
      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...member } : m
          ),
        })),
      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          importantDates: state.importantDates.filter((d) => d.memberId !== id),
        })),
      addImportantDate: (date) =>
        set((state) => ({
          importantDates: [...state.importantDates, { ...date, id: generateId() }],
        })),
      updateImportantDate: (id, date) =>
        set((state) => ({
          importantDates: state.importantDates.map((d) =>
            d.id === id ? { ...d, ...date } : d
          ),
        })),
      deleteImportantDate: (id) =>
        set((state) => ({
          importantDates: state.importantDates.filter((d) => d.id !== id),
        })),
    }),
    {
      name: 'family-space-family',
    }
  )
);
