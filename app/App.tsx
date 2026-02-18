import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { TASKS, RAMADAN_DAYS, CUSTOM_TASK_ID_START, SESSIONS, CITIES } from '@/constants';
import { UserProgress, UserSettings, UserProfile, CustomTask } from '@/types';
import { TodayPage, CalendarPage, StatsPage, SettingsPage, CoursesPage } from '@/pages';
import { getTodayRamadanDay, getRamadanStatus } from '@/lib/dateUtils';
import {
  CheckCircleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BookOpenIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'ramadan_muraqabah_v3';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number>(() => getTodayRamadanDay() ?? 1);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'کاربر گرامی', joinedAt: new Date().toISOString() });
  const [showIntro, setShowIntro] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({});
  const [settings, setSettings] = useState<UserSettings>({
    remindersEnabled: false,
    notificationTime: '18:00',
    city: 'tehran',
  });
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [showAddCustomTask, setShowAddCustomTask] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomDescription, setNewCustomDescription] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newCustomIcon, setNewCustomIcon] = useState('📌');
  const [hiddenTaskIds, setHiddenTaskIds] = useState<number[]>([]);
  const isFirstSave = useRef(true);

  const todayRamadanDay = getTodayRamadanDay();
  const ramadanStatus = getRamadanStatus();

  useEffect(() => {
    if (showNamePopup) setNameDraft(userProfile.name);
  }, [showNamePopup, userProfile.name]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.progress) setProgress(parsed.progress);
        if (parsed.settings) setSettings({ ...parsed.settings, city: parsed.settings.city || 'tehran' });
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (Array.isArray(parsed.customTasks)) setCustomTasks(parsed.customTasks);
        if (Array.isArray(parsed.hiddenTaskIds)) setHiddenTaskIds(parsed.hiddenTaskIds);
      } catch (e) {
        console.error("Failed to parse storage data", e);
        setShowIntro(true);
      }
    } else {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, settings, userProfile, customTasks, hiddenTaskIds }));
  }, [progress, settings, userProfile, customTasks, hiddenTaskIds]);

  const closeIntro = () => setShowIntro(false);

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات ثبت شده را پاک کنید؟')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgress({});
      setCustomTasks([]);
      setHiddenTaskIds([]);
      setUserProfile({ name: 'کاربر گرامی', joinedAt: new Date().toISOString() });
      setSelectedDay(1);
      navigate('/');
      setShowIntro(true);
    }
  };

  const toggleTask = (dayIdx: number, taskId: number) => {
    setProgress(prev => {
      const currentDayTasks = prev[dayIdx] || [];
      if (currentDayTasks.includes(taskId)) {
        return { ...prev, [dayIdx]: currentDayTasks.filter(id => id !== taskId) };
      }
      return { ...prev, [dayIdx]: [...currentDayTasks, taskId] };
    });
  };

  const visibleBuiltInTasks = useMemo(() => TASKS.filter(t => !hiddenTaskIds.includes(t.id)), [hiddenTaskIds]);
  const allTasks = useMemo(() => [...visibleBuiltInTasks, ...customTasks], [visibleBuiltInTasks, customTasks]);

  const hideBuiltInTask = (id: number) => {
    setHiddenTaskIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    setProgress(prev => {
      const next = { ...prev };
      for (const day of Object.keys(next) as unknown as number[]) {
        next[day] = next[day].filter(tid => tid !== id);
      }
      return next;
    });
  };

  const unhideBuiltInTask = (id: number) => {
    setHiddenTaskIds(prev => prev.filter(x => x !== id));
  };

  const addCustomTask = () => {
    const title = newCustomTitle.trim();
    if (!title) return;
    const nextId = customTasks.length
      ? Math.max(...customTasks.map(t => t.id), CUSTOM_TASK_ID_START - 1) + 1
      : CUSTOM_TASK_ID_START;
    setCustomTasks(prev => [...prev, { id: nextId, title, description: newCustomDescription.trim() || undefined, icon: newCustomIcon, url: newCustomUrl.trim() || undefined }]);
    setNewCustomTitle('');
    setNewCustomDescription('');
    setNewCustomUrl('');
    setNewCustomIcon('📌');
    setShowAddCustomTask(false);
  };

  const removeCustomTask = (id: number) => {
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    setProgress(prev => {
      const next = { ...prev };
      for (const day of Object.keys(next) as unknown as number[]) {
        next[day] = next[day].filter(tid => tid !== id);
      }
      return next;
    });
  };

  const currentDayData = useMemo(() => RAMADAN_DAYS.find(d => d.dayIndex === selectedDay), [selectedDay]);

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(s => ({ ...s, remindersEnabled: true }));
        new Notification("نوتیفیکیشن فعال شد", { body: "یادآورهای رمضان برای شما ارسال خواهد شد." });
      }
    }
  };

  const handleShowAddCustomTask = () => {
    setNewCustomTitle('');
    setNewCustomDescription('');
    setNewCustomUrl('');
    setNewCustomIcon('📌');
    setShowAddCustomTask(true);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <TodayPage
                city={settings.city}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                progress={progress}
                userProfile={userProfile}
                customTasks={customTasks}
                hiddenTaskIds={hiddenTaskIds}
                allTasks={allTasks}
                currentDayData={currentDayData}
                todayRamadanDay={todayRamadanDay}
                ramadanStatus={ramadanStatus}
                onToggleTask={toggleTask}
                onRemoveCustomTask={removeCustomTask}
                onHideBuiltInTask={hideBuiltInTask}
                onShowAddCustomTask={() => setShowAddCustomTask(true)}
                onEditProfile={() => setShowNamePopup(true)}
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <CalendarPage
                progress={progress}
                totalTasks={allTasks.length}
                selectedDay={selectedDay}
                todayRamadanDay={todayRamadanDay}
                onSelectDay={(dayIndex) => {
                  setSelectedDay(dayIndex);
                  navigate('/');
                }}
                onGoToToday={() => setSelectedDay(todayRamadanDay ?? 1)}
              />
            }
          />
          <Route
            path="/stats"
            element={<StatsPage progress={progress} allTasks={allTasks} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                settings={settings}
                setSettings={setSettings}
                customTasks={customTasks}
                removeCustomTask={removeCustomTask}
                hiddenTaskIds={hiddenTaskIds}
                unhideBuiltInTask={unhideBuiltInTask}
                tasks={TASKS}
                cities={CITIES}
                onShowAddCustomTask={handleShowAddCustomTask}
                onReset={handleReset}
                onRequestNotifications={requestNotifications}
              />
            }
          />
          <Route
            path="/courses"
            element={<CoursesPage sessions={SESSIONS} />}
          />
        </Routes>
      </main>
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden border border-white/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-inner">
                <InformationCircleIcon className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">خوش آمدید</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  تمامی اطلاعات شما از جمله پیشرفت روزانه و تنظیمات، <span className="text-emerald-600 font-bold underline">فقط روی همین دستگاه</span> ذخیره می‌شود و به هیچ سروری ارسال نخواهد شد.
                </p>
              </div>
              <button onClick={closeIntro} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
      {showNamePopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowNamePopup(false)}
          role="dialog"
          aria-modal="true"
          aria-label="ویرایش نام"
        >
          <div
            className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            <h3 className="text-lg font-black text-slate-800 mb-4">نام شما</h3>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="نام خود را وارد کنید"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium"
              dir="rtl"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowNamePopup(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserProfile(p => ({ ...p, name: nameDraft.trim() || 'کاربر گرامی' }));
                  setShowNamePopup(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddCustomTask && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAddCustomTask(false)}
          role="dialog"
          aria-modal="true"
          aria-label="افزودن مورد روزانهٔ شخصی"
        >
          <div
            className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative overflow-hidden border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
            <h3 className="text-lg font-black text-slate-800 mb-4">افزودن مورد روزانهٔ شخصی</h3>
            <label className="block text-xs font-bold text-slate-500 mb-2">عنوان (الزامی)</label>
            <input
              type="text"
              value={newCustomTitle}
              onChange={(e) => setNewCustomTitle(e.target.value)}
              placeholder="مثلاً: مطالعهٔ یک صفحه کتاب"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
              dir="rtl"
              autoFocus
            />
            <label className="block text-xs font-bold text-slate-500 mb-2">توضیح (اختیاری)</label>
            <input
              type="text"
              value={newCustomDescription}
              onChange={(e) => setNewCustomDescription(e.target.value)}
              placeholder="توضیح کوتاه"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
              dir="rtl"
            />
            <label className="block text-xs font-bold text-slate-500 mb-2">لینک (اختیاری)</label>
            <input
              type="url"
              value={newCustomUrl}
              onChange={(e) => setNewCustomUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-800 font-medium mb-4"
              dir="ltr"
            />
            <label className="block text-xs font-bold text-slate-500 mb-2">آیکون</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {['📌', '📿', '📖', '🕌', '🪙', '🤲', '⚖️', '📜', '🌙', '✨', '🤝', '💧', '🛐', '🗞️', '☀️', '🔖', '📝', '⏰', '🧘', '🎯', '❤️', '📚', '🕯️', '🌙'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewCustomIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${newCustomIcon === emoji ? 'bg-emerald-100 ring-2 ring-emerald-400 scale-110' : 'bg-slate-100 hover:bg-slate-200'}`}
                  title={emoji}
                  aria-label={`آیکون ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddCustomTask(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={addCustomTask}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 z-50 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <CheckCircleIcon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1.5 font-black">امروز</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <CalendarIcon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1.5 font-black">تقویم</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
        <NavLink
          to="/courses"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <BookOpenIcon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1.5 font-black">جلسات</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <ChartBarIcon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1.5 font-black">گزارش</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-2xl transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <Cog6ToothIcon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-1.5 font-black">تنظیمات</span>
              {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
            </>
          )}
        </NavLink>
      </nav>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .active\\:scale-98:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default App;
