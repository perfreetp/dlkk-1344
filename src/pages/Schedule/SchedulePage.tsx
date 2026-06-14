import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Plane,
  Pill,
  UtensilsCrossed,
  Calendar,
  DollarSign,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScheduleStore } from '@/store/useScheduleStore';
import { useNavigationStore } from '@/store/useNavigationStore';
import type { Trip, Medication } from '@/types';
import {
  formatDate,
  daysUntil,
  getWeekDates,
  getWeekDayName,
  getMonday,
} from '@/utils/date';
import Modal from '@/components/Modal/Modal';
import Empty from '@/components/Empty/Empty';

type TabType = 'trips' | 'medications' | 'menu';

interface SchedulePageProps {
  initialTab?: TabType;
  highlightMeal?: {
    weekStart?: string;
    day?: number;
    mealType?: 'breakfast' | 'lunch' | 'dinner';
  };
}

const SchedulePage = ({ initialTab, highlightMeal }: SchedulePageProps) => {
  const navigate = useNavigate();
  const { clearNavigation } = useNavigationStore();
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab || 'trips'
  );
  const [showTripModal, setShowTripModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(
    highlightMeal?.weekStart
      ? new Date(highlightMeal.weekStart)
      : getMonday(new Date())
  );
  const [highlightCell, setHighlightCell] = useState<
    | { day: number; mealType: 'breakfast' | 'lunch' | 'dinner' }
    | undefined
  >(
    highlightMeal?.day !== undefined && highlightMeal?.mealType
      ? { day: highlightMeal.day, mealType: highlightMeal.mealType }
      : undefined
  );

  const {
    trips,
    medications,
    menuPlan,
    addTrip,
    updateTrip,
    deleteTrip,
    toggleTripChecklist,
    addMedication,
    updateMedication,
    deleteMedication,
    updateMeal,
    setMenuPlan,
  } = useScheduleStore();

  useEffect(() => {
    let handled = false;
    if (initialTab) {
      setActiveTab(initialTab);
      handled = true;
    }
    if (highlightMeal?.weekStart) {
      setCurrentWeek(new Date(highlightMeal.weekStart));
      handled = true;
    }
    if (
      highlightMeal?.day !== undefined &&
      highlightMeal?.mealType
    ) {
      setHighlightCell({
        day: highlightMeal.day,
        mealType: highlightMeal.mealType,
      });
      setTimeout(() => {
        setHighlightCell(undefined);
      }, 3000);
      handled = true;
    }
    if (handled) {
      clearNavigation();
    }
  }, [initialTab, highlightMeal, clearNavigation]);

  const tabs = [
    { key: 'trips' as TabType, label: '旅行计划', icon: Plane },
    { key: 'medications' as TabType, label: '用药提醒', icon: Pill },
    { key: 'menu' as TabType, label: '周菜单', icon: UtensilsCrossed },
  ];

  const handleAddTrip = () => {
    setEditingTrip(null);
    setShowTripModal(true);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setShowTripModal(true);
  };

  const handleSaveTrip = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tripData = {
      name: formData.get('name') as string,
      destination: formData.get('destination') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      budget: Number(formData.get('budget')) || 0,
      note: formData.get('note') as string,
      checklist: [] as { id: string; text: string; done: boolean }[],
    };

    if (editingTrip) {
      updateTrip(editingTrip.id, tripData);
    } else {
      addTrip(tripData);
    }
    setShowTripModal(false);
  };

  const handleAddMed = () => {
    setEditingMed(null);
    setShowMedModal(true);
  };

  const handleEditMed = (med: Medication) => {
    setEditingMed(med);
    setShowMedModal(true);
  };

  const handleSaveMed = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const timesStr = formData.get('times') as string;
    const medData = {
      name: formData.get('name') as string,
      memberId: formData.get('memberId') as string,
      dosage: formData.get('dosage') as string,
      times: timesStr ? timesStr.split(',').map((t) => t.trim()) : [],
      frequency: formData.get('frequency') as
        | 'daily'
        | 'weekly'
        | 'as-needed',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      note: formData.get('note') as string,
    };

    if (editingMed) {
      updateMedication(editingMed.id, medData);
    } else {
      addMedication(medData);
    }
    setShowMedModal(false);
  };

  const weekDates = getWeekDates(currentWeek.toISOString().split('T')[0]);
  const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;
  const mealTypeNames = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
  };

  const prevWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const getMealDishes = (day: number, type: string): string[] => {
    if (!menuPlan) return [];
    const meal = menuPlan.meals.find(
      (m) => m.day === day && m.type === type
    );
    return meal?.dishes || [];
  };

  const handleMealEdit = (
    day: number,
    type: 'breakfast' | 'lunch' | 'dinner'
  ) => {
    const currentDishes = getMealDishes(day, type);
    const dishesStr = prompt(
      '输入菜品（用逗号分隔）：',
      currentDishes.join(', ')
    );
    if (dishesStr !== null) {
      const dishes = dishesStr
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
      updateMeal(day, type, dishes);
      if (!menuPlan) {
        setMenuPlan({
          weekStart: currentWeek.toISOString().split('T')[0],
          meals: [],
        });
      }
    }
  };

  const sortedTrips = useMemo(
    () =>
      [...trips].sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      ),
    [trips]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">日程 📅</h1>
          <p className="text-gray-500 mt-1">管理家庭日程和提醒</p>
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
          {activeTab === 'trips' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  共 {trips.length} 个旅行计划
                </p>
                <button onClick={handleAddTrip} className="btn btn-primary">
                  <Plus size={18} />
                  添加旅行
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedTrips.map((trip) => {
                  const days = daysUntil(trip.startDate);
                  const completedItems =
                    trip.checklist.filter((c) => c.done).length;
                  const totalItems = trip.checklist.length;
                  return (
                    <div
                      key={trip.id}
                      className="p-5 bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {trip.name}
                          </h3>
                          <p className="text-sky-600 flex items-center gap-1">
                            <Plane size={14} />
                            {trip.destination}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTrip(trip);
                            }}
                            className="p-2 bg-white/50 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定删除这个旅行计划吗？')) {
                                deleteTrip(trip.id);
                              }
                            }}
                            className="p-2 bg-white/50 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {formatDate(trip.startDate)} -{' '}
                          {formatDate(trip.endDate)}
                        </span>
                        <span
                          className={`font-bold ${
                            days > 0 ? 'text-sky-600' : 'text-green-600'
                          }`}
                        >
                          {days > 0 ? `${days}天后出发` : '进行中'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/50">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <DollarSign size={14} />
                          ¥{trip.budget.toLocaleString()}
                        </span>
                        {totalItems > 0 && (
                          <span className="text-sm text-gray-600">
                            清单: {completedItems}/{totalItems}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {trips.length === 0 && (
                <Empty
                  icon={<Plane size={32} className="text-gray-400" />}
                  title="还没有旅行计划"
                  description="添加一个旅行计划来记录美好旅程"
                  action={
                    <button onClick={handleAddTrip} className="btn btn-primary">
                      <Plus size={18} />
                      添加旅行
                    </button>
                  }
                />
              )}
            </div>
          )}

          {activeTab === 'medications' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  共 {medications.length} 种用药
                </p>
                <button onClick={handleAddMed} className="btn btn-primary">
                  <Plus size={18} />
                  添加用药
                </button>
              </div>
              <div className="space-y-3">
                {medications.map((med) => {
                  const daysLeft = daysUntil(med.endDate);
                  const isActive = daysLeft > 0;
                  return (
                    <div
                      key={med.id}
                      className={`p-4 rounded-2xl transition-all group ${
                        isActive
                          ? 'bg-mint-50 hover:shadow-md'
                          : 'bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isActive
                                ? 'bg-mint-500 text-white'
                                : 'bg-gray-300 text-white'
                            }`}
                          >
                            <Pill size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {med.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {med.dosage} · {med.times.join(', ')}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(med.startDate)} -{' '}
                              {formatDate(med.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditMed(med)}
                            className="p-2 bg-white/50 hover:bg-white rounded-lg text-gray-400 hover:text-primary-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('确定删除这个用药提醒吗？')) {
                                deleteMedication(med.id);
                              }
                            }}
                            className="p-2 bg-white/50 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {medications.length === 0 && (
                <Empty
                  icon={<Pill size={32} className="text-gray-400" />}
                  title="还没有用药提醒"
                  description="添加用药提醒来管理家庭用药"
                  action={
                    <button onClick={handleAddMed} className="btn btn-primary">
                      <Plus size={18} />
                      添加用药
                    </button>
                  }
                />
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevWeek}
                    className="p-2 hover:bg-warm-100 rounded-lg text-gray-600"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-semibold text-gray-700">
                    {weekDates[0].toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    -
                    {weekDates[6].toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <button
                    onClick={nextWeek}
                    className="p-2 hover:bg-warm-100 rounded-lg text-gray-600"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setCurrentWeek(getMonday(new Date()));
                  }}
                  className="btn btn-secondary"
                >
                  本周
                </button>
              </div>

              {highlightMeal && (
                <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700 flex items-center gap-2 animate-pulse">
                  <UtensilsCrossed size={16} />
                  已定位到搜索结果：
                  {highlightCell &&
                    `${getWeekDayName(highlightCell.day)}${
                      mealTypeNames[highlightCell.mealType]
                    }`}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-sm font-medium text-gray-500 w-20">
                        餐次
                      </th>
                      {weekDates.map((date, i) => (
                        <th
                          key={i}
                          className="p-3 text-center text-sm font-medium text-gray-500 min-w-[100px]"
                        >
                          <div>{getWeekDayName(i)}</div>
                          <div
                            className={`text-lg font-bold ${
                              date.toDateString() ===
                              new Date().toDateString()
                                ? 'text-primary-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mealTypes.map((type) => (
                      <tr key={type} className="border-t border-gray-100">
                        <td className="p-3">
                          <span className="text-sm font-medium text-gray-600">
                            {mealTypeNames[type]}
                          </span>
                        </td>
                        {weekDates.map((_, dayIndex) => {
                          const dishes = getMealDishes(dayIndex, type);
                          const isHighlighted =
                            highlightCell?.day === dayIndex &&
                            highlightCell?.mealType === type;
                          return (
                            <td key={dayIndex} className="p-2">
                              <div
                                onClick={() => handleMealEdit(dayIndex, type)}
                                className={`min-h-[60px] p-2 rounded-lg cursor-pointer transition-all ${
                                  isHighlighted
                                    ? 'bg-primary-100 ring-2 ring-primary-400 shadow-lg scale-[1.02]'
                                    : 'bg-warm-50 hover:bg-warm-100'
                                }`}
                                style={
                                  isHighlighted
                                    ? { animation: 'pulse 1.5s infinite' }
                                    : {}
                                }
                              >
                                {dishes.length > 0 ? (
                                  <div className="space-y-1">
                                    {dishes.map((dish, i) => (
                                      <span
                                        key={i}
                                        className="inline-block text-xs bg-white px-2 py-1 rounded-full text-gray-600 mr-1 mb-1 shadow-sm"
                                      >
                                        {dish}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    点击添加
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        title={editingTrip ? '编辑旅行' : '添加旅行计划'}
        size="lg"
      >
        <form onSubmit={handleSaveTrip} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">旅行名称 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingTrip?.name}
                required
                placeholder="如：暑假海边之旅"
              />
            </div>
            <div>
              <label className="label">目的地</label>
              <input
                name="destination"
                type="text"
                className="input"
                defaultValue={editingTrip?.destination}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">开始日期</label>
              <input
                name="startDate"
                type="date"
                className="input"
                defaultValue={editingTrip?.startDate}
              />
            </div>
            <div>
              <label className="label">结束日期</label>
              <input
                name="endDate"
                type="date"
                className="input"
                defaultValue={editingTrip?.endDate}
              />
            </div>
          </div>
          <div>
            <label className="label">预算 (元)</label>
            <input
              name="budget"
              type="number"
              className="input"
              defaultValue={editingTrip?.budget}
            />
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[80px]"
              defaultValue={editingTrip?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowTripModal(false)}
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
        isOpen={showMedModal}
        onClose={() => setShowMedModal(false)}
        title={editingMed ? '编辑用药' : '添加用药提醒'}
        size="lg"
      >
        <form onSubmit={handleSaveMed} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">药品名称 *</label>
              <input
                name="name"
                type="text"
                className="input"
                defaultValue={editingMed?.name}
                required
              />
            </div>
            <div>
              <label className="label">剂量</label>
              <input
                name="dosage"
                type="text"
                className="input"
                defaultValue={editingMed?.dosage}
                placeholder="如：1粒、10ml"
              />
            </div>
          </div>
          <div>
            <label className="label">服用时间（用逗号分隔）</label>
            <input
              name="times"
              type="text"
              className="input"
              defaultValue={editingMed?.times.join(', ')}
              placeholder="如：08:00, 12:00, 18:00"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">开始日期</label>
              <input
                name="startDate"
                type="date"
                className="input"
                defaultValue={editingMed?.startDate}
              />
            </div>
            <div>
              <label className="label">结束日期</label>
              <input
                name="endDate"
                type="date"
                className="input"
                defaultValue={editingMed?.endDate}
              />
            </div>
          </div>
          <div>
            <label className="label">频率</label>
            <select
              name="frequency"
              className="input"
              defaultValue={editingMed?.frequency || 'daily'}
            >
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="as-needed">按需</option>
            </select>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              name="note"
              className="input min-h-[60px]"
              defaultValue={editingMed?.note}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowMedModal(false)}
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
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title="旅行详情"
        size="lg"
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold">{selectedTrip.name}</h3>
              <p className="text-sky-100 flex items-center gap-2 mt-1">
                <Plane size={18} />
                {selectedTrip.destination}
              </p>
              <div className="flex gap-6 mt-4 flex-wrap">
                <div>
                  <p className="text-xs text-sky-100">出发日期</p>
                  <p className="font-semibold">
                    {formatDate(selectedTrip.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-sky-100">返回日期</p>
                  <p className="font-semibold">
                    {formatDate(selectedTrip.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-sky-100">预算</p>
                  <p className="font-semibold">
                    ¥{selectedTrip.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">行李清单</h4>
              <div className="space-y-2">
                {selectedTrip.checklist.length > 0 ? (
                  selectedTrip.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() =>
                        toggleTripChecklist(selectedTrip.id, item.id)
                      }
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      {item.done ? (
                        <CheckCircle2
                          size={20}
                          className="text-green-500"
                        />
                      ) : (
                        <Circle size={20} className="text-gray-300" />
                      )}
                      <span
                        className={`${
                          item.done
                            ? 'text-gray-400 line-through'
                            : 'text-gray-700'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    暂无清单项
                  </p>
                )}
              </div>
            </div>

            {selectedTrip.note && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">备注</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {selectedTrip.note}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleEditTrip(selectedTrip);
                  setSelectedTrip(null);
                }}
                className="btn btn-secondary"
              >
                <Edit2 size={18} />
                编辑
              </button>
              <button
                onClick={() => setSelectedTrip(null)}
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

export default SchedulePage;
