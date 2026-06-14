import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Plus,
  FolderPlus,
  Upload,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  Tag,
  Download,
  Move,
  Check,
} from 'lucide-react';
import { useAlbumStore } from '@/store/useAlbumStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import type { Album, Photo } from '@/types';
import { formatDate } from '@/utils/date';
import Modal from '@/components/Modal/Modal';
import Empty from '@/components/Empty/Empty';

interface AlbumPageProps {
  initialAlbumId?: string;
  initialPhotoId?: string;
}

const AlbumPage = ({ initialAlbumId, initialPhotoId }: AlbumPageProps) => {
  const { clearNavigation } = useNavigationStore();
  const {
    albums,
    photos,
    addAlbum,
    updateAlbum,
    deleteAlbum,
    addPhoto,
    addPhotos,
    deletePhoto,
    reorderPhotos,
    updatePhotoTags,
    updatePhoto,
  } = useAlbumStore();

  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(
    initialAlbumId || albums[0]?.id || null
  );
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [highlightPhotoId, setHighlightPhotoId] = useState<string | null>(null);
  const photoRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedAlbumId && albums.length > 0) {
      setSelectedAlbumId(albums[0].id);
    }
  }, [albums, selectedAlbumId]);

  useEffect(() => {
    let handled = false;
    if (initialAlbumId) {
      setSelectedAlbumId(initialAlbumId);
      handled = true;
    }
    if (initialPhotoId) {
      const photo = useAlbumStore.getState().photos.find(
        (p) => p.id === initialPhotoId
      );
      if (photo) {
        if (photo.albumId) {
          setSelectedAlbumId(photo.albumId);
        }
        setSelectedPhoto(photo);
        setShowPhotoDetail(true);
        setHighlightPhotoId(photo.id);
        setTimeout(() => {
          const el = photoRefs.current[photo.id];
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
        setTimeout(() => setHighlightPhotoId(null), 2500);
        handled = true;
      }
    }
    if (handled) {
      clearNavigation();
    }
  }, [initialAlbumId, initialPhotoId, clearNavigation]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    albums.forEach((a) => a.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [photos, albums]);

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  const albumPhotos = useMemo(() => {
    let result = photos;
    if (!showAllPhotos && selectedAlbumId) {
      result = result.filter((p) => p.albumId === selectedAlbumId);
    }
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.every((tag) => p.tags.includes(tag))
      );
    }
    return result.sort((a, b) => {
      if (showAllPhotos) {
        const albumDiff = a.albumId.localeCompare(b.albumId);
        if (albumDiff !== 0) return albumDiff;
        return a.order - b.order;
      }
      return a.order - b.order;
    });
  }, [photos, selectedAlbumId, selectedTags, showAllPhotos]);

  const handleAddAlbum = () => {
    setEditingAlbum(null);
    setShowAlbumModal(true);
  };

  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setShowAlbumModal(true);
  };

  const handleSaveAlbum = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tagsStr = (formData.get('tags') as string) || '';
    const tags = tagsStr
      .split(/[,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const albumData = {
      name: formData.get('name') as string,
      tags,
      cover: '',
    };
    if (editingAlbum) {
      updateAlbum(editingAlbum.id, albumData);
    } else {
      addAlbum(albumData);
    }
    setShowAlbumModal(false);
  };

  const handleUploadClick = () => {
    if (!selectedAlbumId && !showAllPhotos) {
      alert('请先选择或创建一个相册');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const targetAlbumId = showAllPhotos
      ? selectedAlbumId || albums[0]?.id
      : selectedAlbumId;
    if (!targetAlbumId) return;

    const promises: Promise<string>[] = [];
    Array.from(files).forEach((file) => {
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
      );
    });
    Promise.all(promises).then((dataUrls) => {
      const newPhotos = dataUrls.map((dataUrl, idx) => ({
        albumId: targetAlbumId,
        dataUrl,
        name: files[idx].name,
        tags: [],
      }));
      addPhotos(newPhotos);
    });
    e.target.value = '';
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoDetail(true);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (toIndex: number) => {
    if (draggedIndex === null || draggedIndex === toIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    if (!showAllPhotos && selectedAlbumId) {
      reorderPhotos(selectedAlbumId, draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handlePhotoDetailTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!selectedPhoto) return;
    const input = e.currentTarget;
    if (e.key === 'Enter' && input.value.trim()) {
      const newTags = [...selectedPhoto.tags, input.value.trim()];
      updatePhotoTags(selectedPhoto.id, newTags);
      setSelectedPhoto({ ...selectedPhoto, tags: newTags });
      input.value = '';
    } else if (e.key === 'Backspace' && !input.value && selectedPhoto.tags.length > 0) {
      const newTags = selectedPhoto.tags.slice(0, -1);
      updatePhotoTags(selectedPhoto.id, newTags);
      setSelectedPhoto({ ...selectedPhoto, tags: newTags });
    }
  };

  const handleRemovePhotoTag = (tag: string) => {
    if (!selectedPhoto) return;
    const newTags = selectedPhoto.tags.filter((t) => t !== tag);
    updatePhotoTags(selectedPhoto.id, newTags);
    setSelectedPhoto({ ...selectedPhoto, tags: newTags });
  };

  const handlePhotoNameChange = (name: string) => {
    if (!selectedPhoto) return;
    updatePhoto(selectedPhoto.id, { name });
    setSelectedPhoto({ ...selectedPhoto, name });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">家庭相册 📷</h1>
          <p className="text-gray-500 mt-1">
            {selectedAlbum
              ? `正在查看：${selectedAlbum.name}`
              : showAllPhotos
              ? '正在查看所有照片'
              : '整理和浏览您的家庭照片'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all ${
              showAllPhotos
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-warm-50 border border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={showAllPhotos}
              onChange={(e) => setShowAllPhotos(e.target.checked)}
            />
            <Check size={16} className={showAllPhotos ? '' : 'opacity-0'} />
            显示全部
          </label>
          <button onClick={handleAddAlbum} className="btn btn-secondary">
            <FolderPlus size={18} />
            新建相册
          </button>
          <button onClick={handleUploadClick} className="btn btn-primary">
            <Upload size={18} />
            上传照片
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
              <Tag size={16} />
              标签筛选：
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-warm-50 text-gray-600 hover:bg-warm-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                清除筛选
              </button>
            )}
          </div>
          {selectedTags.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              已筛选 {albumPhotos.length} 张照片
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-1">
            相册列表
          </h3>
          <div className="space-y-2">
            {albums.map((album) => {
              const albumPhotoCount = photos.filter(
                (p) => p.albumId === album.id
              ).length;
              const isActive =
                !showAllPhotos && selectedAlbumId === album.id;
              const coverPhoto = photos.find((p) => p.albumId === album.id);
              return (
                <div
                  key={album.id}
                  onClick={() => {
                    setSelectedAlbumId(album.id);
                    setShowAllPhotos(false);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all group relative ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white hover:bg-warm-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${
                        isActive
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-warm-100 to-primary-100'
                      }`}
                    >
                      {coverPhoto ? (
                        <img
                          src={coverPhoto.dataUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FolderPlus
                          size={20}
                          className={isActive ? 'text-white' : 'text-primary-500'}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isActive ? '' : 'text-gray-800'
                        }`}
                      >
                        {album.name}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isActive ? 'text-white/80' : 'text-gray-400'
                        }`}
                      >
                        {albumPhotoCount} 张
                      </p>
                      {album.tags.length > 0 && (
                        <p
                          className={`text-xs mt-1 truncate ${
                            isActive ? 'text-white/70' : 'text-gray-400'
                          }`}
                        >
                          #{album.tags.slice(0, 2).join(' #')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAlbum(album);
                      }}
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            '确定删除这个相册吗？里面的照片也会被删除。'
                          )
                        ) {
                          deleteAlbum(album.id);
                          if (selectedAlbumId === album.id) {
                            setSelectedAlbumId(albums.find(
                              (a) => a.id !== album.id
                            )?.id || null);
                          }
                        }
                      }}
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {albums.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                还没有相册，点击上方新建
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-3 lg:col-span-4">
          <div
            className={`card p-4 border-2 border-dashed border-gray-200 rounded-2xl mb-6 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all`}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Upload size={40} strokeWidth={1.5} />
              <p className="mt-3 font-medium">
                点击这里或右上角按钮上传照片
              </p>
              <p className="text-xs mt-1">支持拖拽多选，JPG / PNG 格式</p>
            </div>
          </div>

          {(showAllPhotos || selectedAlbumId) && (
            <>
              {!showAllPhotos && (
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-sm text-gray-500">
                    共 <span className="font-semibold text-gray-700">{albumPhotos.length}</span> 张照片
                    {selectedTags.length > 0 && `（已筛选 ${selectedTags.length} 个标签）`}
                  </p>
                  {albumPhotos.length > 1 && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Move size={12} />
                      可拖拽照片调整顺序
                    </p>
                  )}
                </div>
              )}

              {albumPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {albumPhotos.map((photo, index) => {
                    const isDragging = draggedIndex === index;
                    const isOver = dragOverIndex === index;
                    const isHighlighted = highlightPhotoId === photo.id;
                    const photoAlbum = albums.find(
                      (a) => a.id === photo.albumId
                    );
                    return (
                      <div
                        key={photo.id}
                        ref={(el) => {
                          photoRefs.current[photo.id] = el;
                        }}
                        draggable={!showAllPhotos}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handlePhotoClick(photo)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all ${
                          isDragging
                            ? 'opacity-50 scale-95 z-50 shadow-2xl'
                            : isHighlighted
                            ? 'ring-4 ring-primary-400 ring-offset-2 scale-[1.05] shadow-2xl z-10'
                            : 'hover:shadow-xl hover:-translate-y-1'
                        } ${
                          isOver && !isDragging
                            ? 'ring-4 ring-primary-400 ring-offset-2'
                            : ''
                        }`}
                        style={
                          isHighlighted
                            ? { animation: 'pulse 1.5s infinite' }
                            : {}
                        }
                      >
                        <img
                          src={photo.dataUrl}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          {!showAllPhotos && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Move size={10} />
                                {index + 1}
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            {showAllPhotos && photoAlbum && (
                              <p className="text-xs text-white/80 mb-1">
                                📁 {photoAlbum.name}
                              </p>
                            )}
                            <p className="text-white text-sm font-medium truncate">
                              {photo.name}
                            </p>
                            {photo.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {photo.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] bg-white/30 text-white px-1.5 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16">
                  <Empty
                    icon={<FolderPlus size={48} className="text-gray-300" />}
                    title={
                      selectedTags.length > 0
                        ? '没有匹配标签的照片'
                        : '这个相册还是空的'
                    }
                    description={
                      selectedTags.length > 0
                        ? '试试选择其他标签组合'
                        : '点击上传按钮添加第一张照片吧'
                    }
                    action={
                      selectedTags.length > 0 ? (
                        <button
                          onClick={() => setSelectedTags([])}
                          className="btn btn-secondary"
                        >
                          清除筛选
                        </button>
                      ) : (
                        <button
                          onClick={handleUploadClick}
                          className="btn btn-primary"
                        >
                          <Upload size={18} />
                          上传照片
                        </button>
                      )
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showAlbumModal}
        onClose={() => setShowAlbumModal(false)}
        title={editingAlbum ? '编辑相册' : '新建相册'}
      >
        <form onSubmit={handleSaveAlbum} className="space-y-4">
          <div>
            <label className="label">相册名称 *</label>
            <input
              name="name"
              type="text"
              className="input"
              defaultValue={editingAlbum?.name}
              required
              placeholder="如：家庭旅行、生日聚会"
            />
          </div>
          <div>
            <label className="label">标签（用逗号或空格分隔）</label>
            <input
              name="tags"
              type="text"
              className="input"
              defaultValue={editingAlbum?.tags.join(', ')}
              placeholder="如：旅行, 家庭, 2024"
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
              保存
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPhotoDetail}
        onClose={() => {
          setShowPhotoDetail(false);
          setSelectedPhoto(null);
        }}
        title={selectedPhoto?.name || '照片详情'}
        size="xl"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center max-h-[500px]">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.name}
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-sm">照片名称</label>
                <input
                  type="text"
                  className="input"
                  value={selectedPhoto.name}
                  onChange={(e) => handlePhotoNameChange(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-sm flex items-center gap-2">
                  <Tag size={14} />
                  标签管理（回车添加，退格删除最后一个）
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-warm-50 rounded-xl min-h-[52px]">
                  {selectedPhoto.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-600 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemovePhotoTag(tag)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[100px] bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    placeholder={
                      selectedPhoto.tags.length === 0
                        ? '输入标签后按回车添加...'
                        : '添加更多标签...'
                    }
                    onKeyDown={handlePhotoDetailTagInput}
                  />
                </div>
                {allTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">点击添加已有标签：</p>
                    <div className="flex flex-wrap gap-1">
                      {allTags
                        .filter((t) => !selectedPhoto.tags.includes(t))
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              const newTags = [...selectedPhoto.tags, tag];
                              updatePhotoTags(selectedPhoto.id, newTags);
                              setSelectedPhoto({
                                ...selectedPhoto,
                                tags: newTags,
                              });
                            }}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-warm-50 rounded-xl">
                  <p className="text-xs text-gray-500">所属相册</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    📁 {albums.find((a) => a.id === selectedPhoto.albumId)?.name || '未知'}
                  </p>
                </div>
                <div className="p-3 bg-warm-50 rounded-xl">
                  <p className="text-xs text-gray-500">上传时间</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {formatDate(selectedPhoto.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (confirm('确定删除这张照片吗？')) {
                      deletePhoto(selectedPhoto.id);
                      setShowPhotoDetail(false);
                      setSelectedPhoto(null);
                    }
                  }}
                  className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  删除照片
                </button>
                <button
                  onClick={() => {
                    setShowPhotoDetail(false);
                    setSelectedPhoto(null);
                  }}
                  className="btn btn-primary"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AlbumPage;
