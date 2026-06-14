import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StickyNote } from '@/types';
import { generateId } from '@/utils/storage';

interface MemoState {
  stickyNotes: StickyNote[];
  addStickyNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  updateStickyNote: (id: string, note: Partial<StickyNote>) => void;
  deleteStickyNote: (id: string) => void;
  updateNotePosition: (id: string, x: number, y: number) => void;
}

const defaultNotes: StickyNote[] = [
  {
    id: 'note-1',
    content: '记得买牛奶和面包🥛🍞',
    color: 'yellow',
    positionX: 50,
    positionY: 50,
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'note-2',
    content: '周末去看望爷爷奶奶',
    color: 'pink',
    positionX: 300,
    positionY: 80,
    createdAt: '2024-01-16T14:00:00.000Z',
  },
  {
    id: 'note-3',
    content: '交电费和水费',
    color: 'blue',
    positionX: 550,
    positionY: 60,
    createdAt: '2024-01-17T09:00:00.000Z',
  },
  {
    id: 'note-4',
    content: '小明的家长会下周三',
    color: 'green',
    positionX: 150,
    positionY: 250,
    createdAt: '2024-01-18T16:00:00.000Z',
  },
];

export const useMemoStore = create<MemoState>()(
  persist(
    (set) => ({
      stickyNotes: defaultNotes,
      addStickyNote: (note) =>
        set((state) => ({
          stickyNotes: [
            ...state.stickyNotes,
            { ...note, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateStickyNote: (id, note) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, ...note } : n
          ),
        })),
      deleteStickyNote: (id) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.filter((n) => n.id !== id),
        })),
      updateNotePosition: (id, x, y) =>
        set((state) => ({
          stickyNotes: state.stickyNotes.map((n) =>
            n.id === id ? { ...n, positionX: x, positionY: y } : n
          ),
        })),
    }),
    {
      name: 'family-space-memo',
    }
  )
);
