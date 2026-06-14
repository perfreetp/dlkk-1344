import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Printer,
  StickyNote as StickyNoteIcon,
  X,
  Phone,
  Mail,
  Users,
  FileText,
  MapPin,
  LayoutGrid,
  List,
  ChevronRight,
  Home,
  Image,
  Package,
  Calendar,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemoStore } from '@/store/useMemoStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import { searchAll } from '@/utils/search';
import type { StickyNote, SearchResult } from '@/types';
import Avatar from '@/components/Avatar/Avatar';
import Modal from '@/components/Modal/Modal';
import Empty from '@/components/Empty/Empty';

type TabType = 'wall' | 'search' | 'contacts';
type ContactsViewType = 'card' | 'list';

interface MemoPageProps {
  initialTab?: TabType;
}

const noteColors = [
  { key: 'yellow', class: 'bg-note-yellow', label: '黄色' },
  { key: 'pink', class: 'bg-note-pink', label: '粉色' },
  { key: 'blue', class: 'bg-note-blue', label: '蓝色' },
  { key: 'green', class: 'bg-note-green', label: '绿色' },
  { key: 'purple', class: 'bg-note-purple', label: '紫色' },
  { key: 'orange', class: 'bg-note-orange', label: '橙色' },
];

const MemoPage = ({ initialTab }: MemoPageProps) => {
  const navigate = useNavigate();
  const { setNavigation } = useNavigationStore();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'wall');
  const [contactsView, setContactsView] = useState<ContactsViewType>('card');
  const { stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote, updateNotePosition } = useMemoStore();
  const { members } = useFamilyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const tabs = [
    { key: 'wall' as TabType, label: '便签墙', icon: StickyNoteIcon },
    { key: 'search' as TabType, label: '全文搜索', icon: Search },
    { key: 'contacts' as TabType, label: '通讯录', icon: Users },
  ];

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      useNavigationStore.getState().clearNavigation();
    }
  }, [initialTab]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchAll(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.route) {
      if (result.params) {
        setNavigation(result.route, result.params);
      }
      navigate(result.route);
    }
  };

  const handleAddNote = () => {
    const newNote = {
      content: '',
      color: 'yellow',
      positionX: Math.random() * 200 + 50,
      positionY: Math.random() * 200 + 50,
    };
    addStickyNote(newNote);
    setEditingNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note: StickyNote) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleSaveNote = (content: string, color: string) => {
    if (editingNote) {
      updateStickyNote(editingNote.id, { content, color });
    } else {
      const lastNote = stickyNotes[stickyNotes.length - 1];
      if (lastNote && !lastNote.content) {
        updateStickyNote(lastNote.id, { content, color });
      }
    }
    setShowNoteModal(false);
  };

  const handleDragStart = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    const note = stickyNotes.find((n) => n.id === noteId);
    if (!note) return;

    setDragging(noteId);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!wallRef.current) return;
      const wallRect = wallRef.current.getBoundingClientRect();
      const newX = moveEvent.clientX - wallRect.left - dragOffset.current.x;
      const newY = moveEvent.clientY - wallRect.top - dragOffset.current.y;
      updateNotePosition(noteId, Math.max(0, newX), Math.max(0, newY));
    };

    const handleMouseUp = () => {
      setDragging(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getNoteBgClass = (color: string) => {
    const colorObj = noteColors.find((c) => c.key === color);
    return colorObj?.class || 'bg-note-yellow';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['序号', '姓名', '关系', '电话', '邮箱', '地址'];
    const rows = members.map((member, index) => [
      index + 1,
      member.name,
      member.relation,
      member.phone,
      member.email,
      member.address,
    ]);

    const csvContent = [
      ['\uFEFF' + headers.join(',')],
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `家庭通讯录-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentNote = editingNote || (stickyNotes.length > 0 && !stickyNotes[stickyNotes.length - 1].content ? stickyNotes[stickyNotes.length - 1] : null);

  const searchCategories = [
    { key: 'all', label: '全部' },
    { key: 'family', label: '家庭树' },
    { key: 'album', label: '相册' },
    { key: 'assets', label: '资产' },
    { key: 'schedule', label: '日程' },
    { key: 'memo', label: '备忘' },
  ];

  const categoryTypeMap: Record<string, string[]> = {
    family: ['家庭成员', '重要日期'],
    album: ['相册', '照片'],
    assets: ['资产', '车辆', '借还物品'],
    schedule: ['旅行计划', '用药提醒', '周菜单'],
    memo: ['便签'],
  };

  const filteredResults = useMemo(() => {
    if (searchCategory === 'all') return searchResults;
    const types = categoryTypeMap[searchCategory] || [];
    return searchResults.filter((r) => types.includes(r.type));
  }, [searchResults, searchCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: searchResults.length };
    Object.entries(categoryTypeMap).forEach(([cat, types]) => {
      counts[cat] = searchResults.filter((r) => types.includes(r.type)).length;
    });
    return counts;
  }, [searchResults]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">备忘 📝</h1>
          <p className="text-gray-500 mt-1">便签、搜索和通讯录</p>
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
          {activeTab === 'wall' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  共 {stickyNotes.filter((n) => n.content).length} 张便签
                </p>
                <button onClick={handleAddNote} className="btn btn-primary">
                  <Plus size={18} />
                  新建便签
                </button>
              </div>

              <div
                ref={wallRef}
                className="relative min-h-[500px] bg-warm-50 rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255, 200, 150, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 200, 150, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              >
                {stickyNotes.filter((n) => n.content).map((note, index) => (
                  <div
                    key={note.id}
                    onMouseDown={(e) => handleDragStart(e, note.id)}
                    onClick={() => handleEditNote(note)}
                    className={`absolute w-48 p-4 shadow-note cursor-move transition-shadow ${getNoteBgClass(
                      note.color
                    )} ${dragging === note.id ? 'shadow-lg z-10' : 'hover:shadow-lg'}`}
                    style={{
                      left: note.positionX,
                      top: note.positionY,
                      transform: `rotate(${(index % 3 - 1) * 2}deg)`,
                    }}
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                      {note.content}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定删除这张便签吗？')) {
                          deleteStickyNote(note.id);
                        }
                      }}
                      className="absolute top-1 right-1 p-1 opacity-0 hover:opacity-100 hover:bg-black/10 rounded"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                ))}

                {stickyNotes.filter((n) => n.content).length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Empty
                      icon={<StickyNoteIcon size={32} className="text-gray-400" />}
                      title="便签墙是空的"
                      description="点击上方按钮添加便签吧"
                      action={
                        <button onClick={handleAddNote} className="btn btn-primary">
                          <Plus size={18} />
                          新建便签
                        </button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <div className="relative mb-4">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchCategory('all');
                  }}
                  placeholder="搜索所有内容..."
                  className="input pl-12 text-lg"
                  autoFocus
                />
              </div>

              {searchQuery && (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchCategories.map((cat) => {
                      const count = categoryCounts[cat.key] || 0;
                      const isActive = searchCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setSearchCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
                          }`}
                        >
                          {cat.label}
                          <span
                            className={`ml-1.5 text-xs ${
                              isActive
                                ? 'text-white/80'
                                : 'text-gray-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    找到 {filteredResults.length} 个结果
                  </p>

                  <div className="space-y-3">
                    {filteredResults.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearchResultClick(result)}
                        className="p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-primary-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="badge bg-primary-100 text-primary-600">
                                {result.type}
                              </span>
                              <h3 className="font-semibold text-gray-800">
                                {result.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {result.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-gray-300 group-hover:text-primary-500 transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredResults.length === 0 && (
                    <Empty
                      icon={<Search size={32} className="text-gray-400" />}
                      title="没有找到相关结果"
                      description="试试其他关键词或分类吧"
                    />
                  )}
                </>
              )}

              {!searchQuery && (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">输入关键词开始搜索</p>
                  <p className="text-sm text-gray-400 mt-1">
                    支持搜索家庭成员、相册、资产、日程、便签等所有内容
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['早餐', '生日', '照片', '资产', '便签'].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSearchQuery(kw)}
                        className="px-3 py-1.5 bg-warm-100 text-gray-600 rounded-full text-sm hover:bg-warm-200 transition-colors"
                      >
                        # {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="no-print-area">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    共 {members.length} 位家庭成员
                  </p>
                  <div className="flex items-center bg-warm-50 rounded-lg p-1 print:hidden">
                    <button
                      onClick={() => setContactsView('card')}
                      className={`p-2 rounded-md transition-all ${
                        contactsView === 'card'
                          ? 'bg-white shadow-sm text-primary-500'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="卡片视图"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setContactsView('list')}
                      className={`p-2 rounded-md transition-all ${
                        contactsView === 'list'
                          ? 'bg-white shadow-sm text-primary-500'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title="名单视图"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 print:hidden">
                  <button onClick={handleExportCSV} className="btn btn-secondary">
                    <FileSpreadsheet size={18} />
                    导出名单
                  </button>
                  <button onClick={handlePrint} className="btn btn-secondary">
                    <Printer size={18} />
                    打印
                  </button>
                </div>
              </div>

              <div className="print-content">
                {contactsView === 'card' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-warm-50 rounded-xl flex items-center gap-4"
                      >
                        <Avatar name={member.name} gender={member.gender} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800">
                            {member.name}
                            <span className="text-sm text-primary-500 ml-2">
                              {member.relation}
                            </span>
                          </h3>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone size={14} />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Mail size={14} />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          {member.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                              <span className="truncate">{member.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contactsView === 'list' && (
                  <div>
                    <div className="print-only-block mb-4 print-header">
                      <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
                        家庭通讯录
                      </h2>
                      <p className="text-center text-sm text-gray-500">
                        共 {members.length} 位家庭成员 · {new Date().toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-warm-100">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              序号
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              姓名
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              关系
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              电话
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              邮箱
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-warm-200">
                              地址
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member, index) => (
                            <tr
                              key={member.id}
                              className={`${
                                index % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'
                              } hover:bg-warm-50 transition-colors`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-500 border-b border-warm-100">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 border-b border-warm-100">
                                <div className="flex items-center gap-3">
                                  <div className="print:hidden">
                                    <Avatar name={member.name} gender={member.gender} size="sm" />
                                  </div>
                                  <span className="font-medium text-gray-800">
                                    {member.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 border-b border-warm-100">
                                <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                                  {member.relation}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 border-b border-warm-100">
                                {member.phone ? (
                                  <a
                                    href={`tel:${member.phone}`}
                                    className="text-primary-600 hover:underline print:text-gray-700 print:no-underline"
                                  >
                                    {member.phone}
                                  </a>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 border-b border-warm-100 max-w-[200px]">
                                {member.email ? (
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="text-primary-600 hover:underline print:text-gray-700 print:no-underline truncate block"
                                    title={member.email}
                                  >
                                    {member.email}
                                  </a>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 border-b border-warm-100 max-w-[300px]">
                                {member.address ? (
                                  <div className="flex items-start gap-1">
                                    <MapPin size={12} className="text-gray-400 mt-1 flex-shrink-0 print:hidden" />
                                    <span title={member.address} className="line-clamp-2">
                                      {member.address}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {members.length === 0 && (
                <Empty
                  icon={<Users size={32} className="text-gray-400" />}
                  title="还没有家庭成员"
                  description="去家庭树页面添加成员吧"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          const emptyNote = stickyNotes.find((n) => !n.content);
          if (emptyNote) {
            deleteStickyNote(emptyNote.id);
          }
        }}
        title={editingNote ? '编辑便签' : '新建便签'}
        size="md"
      >
        <NoteEditor
          note={currentNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowNoteModal(false);
            const emptyNote = stickyNotes.find((n) => !n.content);
            if (emptyNote) {
              deleteStickyNote(emptyNote.id);
            }
          }}
        />
      </Modal>

      <style>{`
        @media print {
          .no-print-area > .flex {
            display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-only-block {
            display: block !important;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .print-content table {
            page-break-inside: auto;
          }
          .print-content tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          body {
            padding: 20px;
          }
        }
        @media screen {
          .print-only-block {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

interface NoteEditorProps {
  note: StickyNote | null;
  onSave: (content: string, color: string) => void;
  onCancel: () => void;
}

const NoteEditor = ({ note, onSave, onCancel }: NoteEditorProps) => {
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'yellow');

  const handleSave = () => {
    onSave(content, color);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">便签内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-[150px] resize-none"
          placeholder="写下你想记住的事情..."
          autoFocus
        />
      </div>

      <div>
        <label className="label">便签颜色</label>
        <div className="flex gap-2">
          {noteColors.map((c) => (
            <button
              key={c.key}
              onClick={() => setColor(c.key)}
              className={`w-8 h-8 rounded-full ${c.class} ${
                color === c.key ? 'ring-2 ring-offset-2 ring-primary-500' : ''
              } transition-transform hover:scale-110`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="btn btn-secondary">
          取消
        </button>
        <button onClick={handleSave} className="btn btn-primary">
          保存
        </button>
      </div>
    </div>
  );
};

export default MemoPage;
