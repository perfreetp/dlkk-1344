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
  addMemberWithRelations: (
    member: Omit<FamilyMember, 'id'>,
    relations?: {
      spouseId?: string;
      parentIds?: string[];
      childIds?: string[];
    }
  ) => void;
  updateMemberWithRelations: (
    id: string,
    member: Partial<FamilyMember>,
    relations?: {
      spouseId?: string;
      parentIds?: string[];
      childIds?: string[];
    }
  ) => void;
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
      addMemberWithRelations: (member, relations) =>
        set((state) => {
          const newId = generateId();
          const newMember: FamilyMember = {
            ...member,
            id: newId,
            spouseId: relations?.spouseId || member.spouseId,
            parentIds: relations?.parentIds || member.parentIds || [],
          };

          let members = [...state.members, newMember];

          if (relations?.spouseId) {
            members = members.map((m) =>
              m.id === relations.spouseId
                ? { ...m, spouseId: newId }
                : m
            );
          }

          if (relations?.childIds) {
            relations.childIds.forEach((childId) => {
              members = members.map((m) => {
                if (m.id === childId) {
                  const newParentIds = [...(m.parentIds || []), newId];
                  return { ...m, parentIds: Array.from(new Set(newParentIds)) };
                }
                return m;
              });
            });
          }

          if (relations?.parentIds && relations.parentIds.length > 0) {
            const gender = newMember.gender;
            if (gender === 'male') {
              const motherExists = members.some(
                (p) =>
                  relations!.parentIds!.includes(p.id) && p.gender === 'female'
              );
              if (motherExists) {
                const fatherId = relations.parentIds.find(
                  (pid) =>
                    members.find((m) => m.id === pid)?.gender === 'male'
                );
                const motherId = relations.parentIds.find(
                  (pid) =>
                    members.find((m) => m.id === pid)?.gender === 'female'
                );
                if (fatherId && motherId) {
                  members = members.map((m) =>
                    m.id === fatherId
                      ? { ...m, spouseId: motherId }
                      : m
                  );
                  members = members.map((m) =>
                    m.id === motherId
                      ? { ...m, spouseId: fatherId }
                      : m
                  );
                }
              }
            }
          }

          return { members };
        }),
      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...member } : m
          ),
        })),
      updateMemberWithRelations: (id, member, relations) =>
        set((state) => {
          const oldMember = state.members.find((m) => m.id === id);
          if (!oldMember) return state;

          let members = state.members.map((m) =>
            m.id === id
              ? {
                  ...m,
                  ...member,
                  spouseId:
                    relations?.spouseId !== undefined
                      ? relations.spouseId
                      : m.spouseId,
                  parentIds: relations?.parentIds || m.parentIds || [],
                }
              : m
          );

          const newSpouseId =
            relations?.spouseId !== undefined
              ? relations.spouseId
              : oldMember.spouseId;
          const oldSpouseId = oldMember.spouseId;

          if (oldSpouseId && oldSpouseId !== newSpouseId) {
            members = members.map((m) =>
              m.id === oldSpouseId ? { ...m, spouseId: undefined } : m
            );
          }

          if (newSpouseId && newSpouseId !== oldSpouseId) {
            members = members.map((m) =>
              m.id === newSpouseId ? { ...m, spouseId: id } : m
            );
          }

          if (relations?.childIds) {
            relations.childIds.forEach((childId) => {
              members = members.map((m) => {
                if (m.id === childId) {
                  const newParentIds = [...(m.parentIds || []), id];
                  return { ...m, parentIds: Array.from(new Set(newParentIds)) };
                }
                return m;
              });
            });
          }

          if (relations?.parentIds && relations.parentIds.length >= 2) {
            const fatherId = relations.parentIds.find(
              (pid) =>
                members.find((m) => m.id === pid)?.gender === 'male'
            );
            const motherId = relations.parentIds.find(
              (pid) =>
                members.find((m) => m.id === pid)?.gender === 'female'
            );
            if (fatherId && motherId) {
              members = members.map((m) =>
                m.id === fatherId ? { ...m, spouseId: motherId } : m
              );
              members = members.map((m) =>
                m.id === motherId ? { ...m, spouseId: fatherId } : m
              );
            }
          }

          return { members };
        }),
      deleteMember: (id) =>
        set((state) => {
          let members = state.members.filter((m) => m.id !== id);
          members = members.map((m) => {
            const newParentIds = (m.parentIds || []).filter((pid) => pid !== id);
            const newSpouseId = m.spouseId === id ? undefined : m.spouseId;
            return {
              ...m,
              parentIds: newParentIds,
              spouseId: newSpouseId,
            };
          });
          return {
            members,
            importantDates: state.importantDates.filter(
              (d) => d.memberId !== id
            ),
          };
        }),
      addImportantDate: (date) =>
        set((state) => ({
          importantDates: [
            ...state.importantDates,
            { ...date, id: generateId() },
          ],
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
