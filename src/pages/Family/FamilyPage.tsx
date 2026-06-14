import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Users,
  GitBranch,
  Phone,
  Mail,
  MapPin,
  Cake,
  Gift,
  Heart,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useFamilyStore } from '@/store/useFamilyStore';
import type { FamilyMember, ImportantDate } from '@/types';
import { formatDate, calculateAge, daysUntil } from '@/utils/date';
import Modal from '@/components/Modal/Modal';
import Avatar from '@/components/Avatar/Avatar';
import Empty from '@/components/Empty/Empty';

type TabType = 'members' | 'tree' | 'dates';

const FamilyPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const { members, importantDates, addMember, updateMember, deleteMember, addImportantDate, updateImportantDate, deleteImportantDate } = useFamilyStore();

  const tabs = [
    { key: 'members' as TabType, label: '成员列表', icon: Users },
    { key: 'tree' as TabType, label: '关系图', icon: GitBranch },
    { key: 'dates' as TabType, label: '重要日期', icon: Calendar },
  ];

  const handleAddMember = () => {
    setEditingMember(null);
    setShowMemberModal(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData = {
      name: formData.get('name') as string,
      avatar: formData.get('avatar') as string,
      birthDate: formData.get('birthDate') as string,
      relation: formData.get('relation') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      note: formData.get('note') as string,
      gender: (formData.get('gender') as 'male' | 'female') || 'male',
      parentIds: [] as string[],
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
    } else {
      addMember(memberData);
    }
    setShowMemberModal(false);
  };

  const handleAddDate = () => {
    setEditingDate(null);
    setShowDateModal(true);
  };

  const handleEditDate = (date: ImportantDate) => {
    setEditingDate(date);
    setShowDateModal(true);
  };

  const handleSaveDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateData = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as 'birthday' | 'anniversary' | 'festival' | 'other',
      repeatYearly: formData.get('repeatYearly') === 'on',
      note: formData.get('note') as string,
      memberId: formData.get('memberId') as string || undefined,
    };

    if (editingDate) {
      updateImportantDate(editingDate.id, dateData);
    } else {
      addImportantDate(dateData);
    }
    setShowDateModal(false);
  };

  const sortedDates = [...importantDates].sort((a, b) => {
    const daysA = daysUntil(a.date, a.repeatYearly);
    const daysB = daysUntil(b.date, b.repeatYearly);
    return daysA - daysB;
  });

  const getDateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      birthday: 'bg-pink-100 text-pink-600',
      anniversary: 'bg-red-100 text-red-600',
      festival: 'bg-amber-100 text-amber-600',
      other: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || colors.other;
  };

  const getDateTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Cake size={16} />;
      case 'anniversary': return <Heart size={16} />;
      case 'festival': return <Gift size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getDateTypeName = (type: string) => {
    const names: Record<string, string> = {
      birthday: '生日',
      anniversary: '纪念日',
      festival: '节日',
      other: '其他',
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">家庭树 🌳</h1>
          <p className="text-gray-500 mt-1">管理家庭成员和重要日期</p>
        </div>
        <button onClick={handleAddMember} className="btn btn-primary">
          <Plus size={20} />
          添加成员
        </button>
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
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 bg-warm-50 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={member.name} gender={member.gender} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-primary-500">{member.relation}</p>
                      {member.birthDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateAge(member.birthDate)}岁
                        </p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMember(member);
                        }}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定删除这个家庭成员吗？')) {
                            deleteMember(member.id);
                          }
                        }}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {member.phone && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <div className="col-span-full">
                  <Empty
                    icon={<Users size={32} className="text-gray-400" />}
                    title="还没有家庭成员"
                    description="点击上方按钮添加第一个家庭成员吧"
                    action={
                      <button onClick={handleAddMember} className="btn btn-primary">
                        <Plus size={18} />
                        添加成员
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="py-8">
              <div className="flex justify-center items-center gap-8 mb-12">
                {members.filter((m) => m.relation === '父亲' || m.relation === '母亲').length === 0 && (
                  <p className="text-gray-400 text-center">添加家庭成员后查看关系图</p>
                )}
                {members
                  .filter((m) => m.spouseId)
                  .filter((m, i, arr) => {
                    const spouse = arr.find((s) => s.id === m.spouseId);
                    return spouse && m.id < spouse.id;
                  })
                  .map((member) => {
                    const spouse = members.find((m) => m.id === member.spouseId);
                    const children = members.filter(
                      (m) =>
                        m.parentIds?.includes(member.id) ||
                        m.parentIds?.includes(spouse?.id || '')
                    );
                    return (
                      <div key={member.id} className="text-center">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="flex flex-col items-center">
                            <Avatar name={member.name} gender={member.gender} size="xl" />
                            <p className="mt-2 font-medium text-gray-800">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.relation}</p>
                          </div>
                          <div className="text-3xl text-sakura-400">❤️</div>
                          {spouse && (
                            <div className="flex flex-col items-center">
                              <Avatar name={spouse.name} gender={spouse.gender} size="xl" />
                              <p className="mt-2 font-medium text-gray-800">{spouse.name}</p>
                              <p className="text-xs text-gray-500">{spouse.relation}</p>
                            </div>
                          )}
                        </div>
                        {children.length > 0 && (
                          <>
                            <div className="w-0.5 h-8 bg-primary-300 mx-auto" />
                            <div className="flex justify-center gap-8">
                              {children.map((child) => (
                                <div
                                  key={child.id}
                                  className="flex flex-col items-center"
                                >
                                  <div className="w-0.5 h-4 bg-primary-300" />
                                  <Avatar name={child.name} gender={child.gender} size="lg" />
                                  <p className="mt-2 font-medium text-gray-800 text-sm">
                                    {child.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{child.relation}</p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  共 {members.length} 位家庭成员
                </p>
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={handleAddDate} className="btn btn-secondary">
                  <Plus size={18} />
                  添加日期
                </button>
              </div>
              <div className="space-y-3">
                {sortedDates.map((dateItem) => {
                  const days = daysUntil(dateItem.date, dateItem.repeatYearly);
                  const member = members.find((m) => m.id === dateItem.memberId);
                  return (
                    <div
                      key={dateItem.id}
                      className="flex items-center gap-4 p-4 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors group"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${getDateTypeColor(
                          dateItem.type
                        )}`}
                      >
                        {getDateTypeIcon(dateItem.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">
                            {dateItem.title}
                          </h3>
                          <span className={`badge ${getDateTypeColor(dateItem.type)}`}>
                            {getDateTypeName(dateItem.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(dateItem.date)}
                          {member && ` · ${member.name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-500">
                          {days === 0 ? '今天' : `${days}天`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {days === 0 ? '就是今天！' : '后到来'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEditDate(dateItem)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定删除这个重要日期吗？')) {
                              deleteImportantDate(dateItem.id);
                            }
                          }}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {importantDates.length === 0 && (
                  <Empty
                    icon={<Calendar size={32} className="text-gray-400" />}
                    title="还没有重要日期"
                    description="添加生日、纪念日等重要日期来记录"
                    action={
                      <button onClick={handleAddDate} className="btn btn-primary">
                        <Plus size={18} />
                        添加日期
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title={editingMember ? '编辑成员' : '添加家庭成员'}
        size="lg"
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">姓名 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingMember?.name}
                required
              />
            </div>
            <div>
              <label className="label">关系</label>
              <input
                name="relation"
                type="text"
                className="input"
                defaultValue={editingMember?.relation}
                placeholder="如：父亲、母亲、儿子"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">性别</label>
              <select name="gender" className="input" defaultValue={editingMember?.gender || 'male'}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div>
              <label className="label">生日</label>
              <input
                name="birthDate"
                type="date"
                className="input"
                defaultValue={editingMember?.birthDate}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">电话</label>
              <input
                name="phone"
                type="tel"
                className="input"
                defaultValue={editingMember?.phone}
              />
            </div>
            <div>
              <label className="label">邮箱</label>
              <input
                name="email"
                type="email"
                className="input"
                defaultValue={editingMember?.email}
              />
            </div>
          </div>
          <div>
            <label className="label">地址</label>
            <input
              name="address"
              type="text"
              className="input"
              defaultValue={editingMember?.address}
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[80px]"
              defaultValue={editingMember?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowMemberModal(false)}
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
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        title={editingDate ? '编辑重要日期' : '添加重要日期'}
      >
        <form onSubmit={handleSaveDate} className="space-y-4">
          <div>
            <label className="label">标题 *</label>
            <input
              name="title"
              type="text"
              className="input"
              defaultValue={editingDate?.title}
              required
              placeholder="如：爸爸的生日"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">日期 *</label>
              <input
                name="date"
                type="date"
                className="input"
                defaultValue={editingDate?.date}
                required
              />
            </div>
            <div>
              <label className="label">类型</label>
              <select
                name="type"
                className="input"
                defaultValue={editingDate?.type || 'birthday'}
              >
                <option value="birthday">生日</option>
                <option value="anniversary">纪念日</option>
                <option value="festival">节日</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">关联成员</label>
            <select
              name="memberId"
              className="input"
              defaultValue={editingDate?.memberId || ''}
            >
              <option value="">不关联</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="repeatYearly"
              name="repeatYearly"
              type="checkbox"
              defaultChecked={editingDate?.repeatYearly ?? true}
              className="w-4 h-4 text-primary-500 rounded"
            />
            <label htmlFor="repeatYearly" className="text-sm text-gray-700">
              每年重复
            </label>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[60px]"
              defaultValue={editingDate?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDateModal(false)}
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
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="成员详情"
        size="md"
      >
        {selectedMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <Avatar
                name={selectedMember.name}
                gender={selectedMember.gender}
                size="xl"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedMember.name}
                </h3>
                <p className="text-primary-500 font-medium">
                  {selectedMember.relation}
                </p>
                {selectedMember.birthDate && (
                  <p className="text-sm text-gray-500">
                    {calculateAge(selectedMember.birthDate)} 岁
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {selectedMember.birthDate && (
                <div className="flex items-center gap-3">
                  <Cake size={18} className="text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500">生日</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(selectedMember.birthDate)}
                    </p>
                  </div>
                </div>
              )}
              {selectedMember.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-mint-500" />
                  <div>
                    <p className="text-xs text-gray-500">电话</p>
                    <p className="text-sm text-gray-700">{selectedMember.phone}</p>
                  </div>
                </div>
              )}
              {selectedMember.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-sky-500" />
                  <div>
                    <p className="text-xs text-gray-500">邮箱</p>
                    <p className="text-sm text-gray-700">{selectedMember.email}</p>
                  </div>
                </div>
              )}
              {selectedMember.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">地址</p>
                    <p className="text-sm text-gray-700">
                      {selectedMember.address}
                    </p>
                  </div>
                </div>
              )}
              {selectedMember.note && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">备注</p>
                  <p className="text-sm text-gray-700">{selectedMember.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleEditMember(selectedMember);
                  setSelectedMember(null);
                }}
                className="btn btn-secondary"
              >
                <Edit2 size={18} />
                编辑
              </button>
              <button
                onClick={() => setSelectedMember(null)}
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

export default FamilyPage;
