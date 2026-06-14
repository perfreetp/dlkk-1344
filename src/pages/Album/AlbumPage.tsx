import { useState, useRef } from 'react';
import {
  Plus,
  Upload,
  Tag,
  Trash2,
  Image,
  X,
  FolderPlus,
  Search,
} from 'lucide-react';
import { useAlbumStore } from '@/store/useAlbumStore';
import type { Album, Photo } from '@/types';
import Modal from '@/components/Modal/Modal';
import Empty from '@/components/Empty/Empty';

const AlbumPage = () => {
  const { albums, photos, addAlbum, addPhotos, deleteAlbum, deletePhoto, updatePhoto } = useAlbumStore();
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(
    albums[0]?.id || null
  );
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAlbum = albums.find((a) => a.id === currentAlbumId);
  const albumPhotos = photos.filter((p) => p.albumId === currentAlbumId);

  const filteredPhotos = tagFilter
    ? albumPhotos.filter((p) => p.tags.includes(tagFilter))
    : albumPhotos;

  const allTags = Array.from(new Set(photos.flatMap((p) => p.tags)));

  const handleCreateAlbum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const tagsStr = formData.get('tags') as string;
    const tags = tagsStr
      ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    addAlbum({
      name,
      cover: '',
      tags,
    });
    setShowAlbumModal(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !currentAlbumId) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        addPhotos([
          {
            albumId: currentAlbumId,
            dataUrl,
            name: file.name,
            tags: [],
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('确定删除这张照片吗？')) {
      deletePhoto(photoId);
      setSelectedPhoto(null);
    }
  };

  const handleDeleteAlbum = (albumId: string) => {
    if (confirm('确定删除这个相册吗？相册内的照片也会被删除。')) {
      deleteAlbum(albumId);
      if (currentAlbumId === albumId) {
        setCurrentAlbumId(albums.find((a) => a.id !== albumId)?.id || null);
      }
    }
  };

  const handleEditPhotoTags = (photoId: string, tagsStr: string) => {
    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    updatePhoto(photoId, { tags });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">相册 📷</h1>
          <p className="text-gray-500 mt-1">记录家庭美好时光</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAlbumModal(true)} className="btn btn-secondary">
            <FolderPlus size={20} />
            新建相册
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            disabled={!currentAlbumId}
          >
            <Upload size={20} />
            上传照片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 px-3 mb-2">我的相册</h3>
          {albums.map((album) => {
            const albumPhotoCount = photos.filter(
              (p) => p.albumId === album.id
            ).length;
            const isActive = currentAlbumId === album.id;
            return (
              <div
                key={album.id}
                onClick={() => setCurrentAlbumId(album.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all group ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white hover:bg-warm-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-primary-50'
                    }`}
                  >
                    <Image
                      size={20}
                      className={isActive ? 'text-white' : 'text-primary-500'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{album.name}</p>
                    <p
                      className={`text-xs ${
                        isActive ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {albumPhotoCount} 张照片
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlbum(album.id);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 ${
                      isActive ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {albums.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              还没有相册
            </p>
          )}
        </div>

        <div className="flex-1">
          {currentAlbum ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentAlbum.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    共 {albumPhotos.length} 张照片
                  </p>
                </div>
                {allTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-gray-400" />
                    <select
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="input input-sm w-auto"
                    >
                      <option value="">全部标签</option>
                      {allTags.map((tag) => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-warm-50'
                }`}
              >
                <Upload
                  size={32}
                  className={`mx-auto mb-2 ${
                    isDragging ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <p className="text-sm text-gray-600">
                  拖拽照片到这里，或点击上传
                </p>
              </div>

              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setShowPhotoModal(true);
                      }}
                    >
                      {photo.dataUrl ? (
                        <img
                          src={photo.dataUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Image size={40} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-sm truncate">
                            {photo.name}
                          </p>
                          {photo.tags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {photo.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty
                  icon={<Image size={40} className="text-gray-300" />}
                  title="相册空空如也"
                  description="上传一些照片记录美好时光吧"
                />
              )}
            </div>
          ) : (
            <Empty
              icon={<Image size={48} className="text-gray-300" />}
              title="选择或创建一个相册"
              description="先创建一个相册来存放照片吧"
              action={
                <button onClick={() => setShowAlbumModal(true)} className="btn btn-primary">
                  <Plus size={18} />
                  新建相册
                </button>
              }
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={showAlbumModal}
        onClose={() => setShowAlbumModal(false)}
        title="新建相册"
      >
        <form onSubmit={handleCreateAlbum} className="space-y-4">
          <div>
            <label className="label">相册名称 *</label>
            <input
              name="name"
              type="text"
              className="input"
              required
              placeholder="如：家庭旅行"
            />
          </div>
          <div>
            <label className="label">标签（用逗号分隔）</label>
            <input
              name="tags"
              type="text"
              className="input"
              placeholder="如：旅行, 2024, 夏天"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAlbumModal(false)}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              创建
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title="照片详情"
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-gray-100">
              {selectedPhoto.dataUrl && (
                <img
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.name}
                  className="w-full max-h-96 object-contain"
                />
              )}
            </div>
            <div>
              <label className="label">照片名称</label>
              <p className="text-gray-700">{selectedPhoto.name}</p>
            </div>
            <div>
              <label className="label">标签</label>
              <div className="flex flex-wrap gap-2">
                {selectedPhoto.tags.length > 0 ? (
                  selectedPhoto.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-primary-100 text-primary-600"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">暂无标签</span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="btn btn-secondary text-red-500 hover:bg-red-50"
              >
                <Trash2 size={18} />
                删除
              </button>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="btn btn-primary"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AlbumPage;
