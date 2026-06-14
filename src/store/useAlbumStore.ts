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
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt' | 'order'>) => void;
  updatePhoto: (id: string, photo: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  addPhotos: (
    photos: Omit<Photo, 'id' | 'createdAt' | 'order'>[]
  ) => void;
  reorderPhotos: (
    albumId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  addPhotoTag: (photoId: string, tag: string) => void;
  removePhotoTag: (photoId: string, tag: string) => void;
  updatePhotoTags: (photoId: string, tags: string[]) => void;
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
    (set, get) => ({
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
        set((state) => {
          const albumPhotos = state.photos.filter(
            (p) => p.albumId === photo.albumId
          );
          const maxOrder = albumPhotos.length
            ? Math.max(...albumPhotos.map((p) => p.order))
            : -1;
          return {
            photos: [
              ...state.photos,
              {
                ...photo,
                id: generateId(),
                order: maxOrder + 1,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      updatePhoto: (id, photo) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, ...photo } : p
          ),
        })),
      deletePhoto: (id) =>
        set((state) => {
          const targetPhoto = state.photos.find((p) => p.id === id);
          if (!targetPhoto) return state;
          let photos = state.photos.filter((p) => p.id !== id);
          photos = photos.map((p) => {
            if (
              p.albumId === targetPhoto.albumId &&
              p.order > targetPhoto.order
            ) {
              return { ...p, order: p.order - 1 };
            }
            return p;
          });
          return { photos };
        }),
      addPhotos: (newPhotos) =>
        set((state) => {
          if (newPhotos.length === 0) return state;
          const albumId = newPhotos[0].albumId;
          const albumPhotos = state.photos.filter(
            (p) => p.albumId === albumId
          );
          let maxOrder = albumPhotos.length
            ? Math.max(...albumPhotos.map((p) => p.order))
            : -1;
          const createdAt = new Date().toISOString();
          const photosWithOrder = newPhotos.map((p) => ({
            ...p,
            id: generateId(),
            order: ++maxOrder,
            createdAt,
          }));
          return {
            photos: [...state.photos, ...photosWithOrder],
          };
        }),
      reorderPhotos: (albumId, fromIndex, toIndex) =>
        set((state) => {
          let albumPhotos = state.photos
            .filter((p) => p.albumId === albumId)
            .sort((a, b) => a.order - b.order);
          if (
            fromIndex < 0 ||
            fromIndex >= albumPhotos.length ||
            toIndex < 0 ||
            toIndex >= albumPhotos.length
          ) {
            return state;
          }
          const [removed] = albumPhotos.splice(fromIndex, 1);
          albumPhotos.splice(toIndex, 0, removed);
          albumPhotos = albumPhotos.map((p, idx) => ({ ...p, order: idx }));
          const otherPhotos = state.photos.filter(
            (p) => p.albumId !== albumId
          );
          return {
            photos: [...otherPhotos, ...albumPhotos],
          };
        }),
      addPhotoTag: (photoId, tag) =>
        set((state) => ({
          photos: state.photos.map((p) => {
            if (p.id === photoId && !p.tags.includes(tag)) {
              return { ...p, tags: [...p.tags, tag] };
            }
            return p;
          }),
        })),
      removePhotoTag: (photoId, tag) =>
        set((state) => ({
          photos: state.photos.map((p) => {
            if (p.id === photoId) {
              return { ...p, tags: p.tags.filter((t) => t !== tag) };
            }
            return p;
          }),
        })),
      updatePhotoTags: (photoId, tags) =>
        set((state) => ({
          photos: state.photos.map((p) => {
            if (p.id === photoId) {
              return { ...p, tags: Array.from(new Set(tags)) };
            }
            return p;
          }),
        })),
    }),
    {
      name: 'family-space-album',
    }
  )
);
