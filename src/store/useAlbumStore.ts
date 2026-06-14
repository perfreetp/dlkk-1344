import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Album, Photo } from '@/types';
import { generateId } from '@/utils/storage';

interface AlbumState {
  albums: Album[];
  photos: Photo[];
  addAlbum: (album: Omit<Album, 'id' | 'createdAt'>) => void;
  updateAlbum: (id: string, album: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  updatePhoto: (id: string, photo: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  addPhotos: (photos: Omit<Photo, 'id' | 'createdAt'>[]) => void;
}

const defaultAlbums: Album[] = [
  {
    id: 'album-1',
    name: '家庭旅行',
    cover: '',
    tags: ['旅行', '家庭'],
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'album-2',
    name: '生日聚会',
    cover: '',
    tags: ['生日', '聚会'],
    createdAt: '2024-03-15T00:00:00.000Z',
  },
];

export const useAlbumStore = create<AlbumState>()(
  persist(
    (set) => ({
      albums: defaultAlbums,
      photos: [],
      addAlbum: (album) =>
        set((state) => ({
          albums: [
            ...state.albums,
            { ...album, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updateAlbum: (id, album) =>
        set((state) => ({
          albums: state.albums.map((a) =>
            a.id === id ? { ...a, ...album } : a
          ),
        })),
      deleteAlbum: (id) =>
        set((state) => ({
          albums: state.albums.filter((a) => a.id !== id),
          photos: state.photos.filter((p) => p.albumId !== id),
        })),
      addPhoto: (photo) =>
        set((state) => ({
          photos: [
            ...state.photos,
            { ...photo, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePhoto: (id, photo) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...photo } : p
          ),
        })),
      deletePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),
      addPhotos: (newPhotos) =>
        set((state) => ({
          photos: [
            ...state.photos,
            ...newPhotos.map((p) => ({
              ...p,
              id: generateId(),
              createdAt: new Date().toISOString(),
            })),
          ],
        })),
    }),
    {
      name: 'family-space-album',
    }
  )
);
