import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TASKS, RAMADAN_DAYS, CUSTOM_TASK_ID_START, SESSIONS, CITIES } from '@/constants';
import { UserProgress, UserSettings, UserProfile, CustomTask } from '@/types';
import TaskCard from '@/components/TaskCard';
import Calendar from '@/components/Calendar';
import PrayerTimes from '@/components/PrayerTimes';
import { getTodayRamadanDay, getRamadanStatus, getTodayWeekdayPersian, getTodaySolarDateString, getDaysUntilRamadan } from '@/lib/dateUtils';
import {
  CheckCircleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  ExclamationCircleIcon,
  UserIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  TrashIcon,
  BookOpenIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const STORAGE_KEY = 'ramadan_muraqabah_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats' | 'settings' | 'courses'>('today');
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
      setActiveTab('today');
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
  const completedCount = progress[selectedDay]?.length || 0;
  const progressPercent = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0;

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(s => ({ ...s, remindersEnabled: true }));
        new Notification("نوتیفیکیشن فعال شد", { body: "یادآورهای رمضان برای شما ارسال خواهد شد." });
      }
    }
  };

  const renderToday = () => (
    <div className="animate-fadeIn">
      {ramadanStatus !== 'during' && (
        <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <InformationCircleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              {ramadanStatus === 'before'
                ? 'ماه رمضان هنوز شروع نشده'
                : 'ماه رمضان به پایان رسیده'}
            </p>
            <p className="text-sm text-amber-800 mt-1">
              {ramadanStatus === 'before'
                ? 'شروع ماه مبارک: ۳۰ بهمن. در حال حاضر می‌توانید روزها را مرور کنید.'
                : 'می‌توانید کارنامه و تقویم را همچنان مشاهده کنید.'}
            </p>
          </div>
        </div>
      )}
      <div className="bg-emerald-600 text-white p-6 rounded-b-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <button
              type="button"
              onClick={() => setShowNamePopup(true)}
              className="flex items-center gap-3 rounded-2xl p-1 -m-1 hover:bg-white/10 transition-colors"
              aria-label="تغییر نام"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-emerald-50">{userProfile.name}</span>
            </button>
            <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md text-xs border border-white/20">
              {ramadanStatus === 'during' ? currentDayData?.solarDate : getTodaySolarDateString()}
            </div>
          </div>
          <div className="flex justify-between items-end gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDay(d => (d === 1 ? 30 : d - 1))}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center border border-white/20 transition-colors"
                title={selectedDay === 1 ? '۲۹ شعبان' : `روز قبل (${selectedDay - 1} رمضان)`}
                aria-label={selectedDay === 1 ? '۲۹ شعبان' : `روز ${selectedDay - 1} رمضان`}
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDay(d => (d === 30 ? 1 : d + 1))}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center border border-white/20 transition-colors"
                title={selectedDay === 30 ? '۱ شوال' : `روز بعد (${selectedDay + 1} رمضان)`}
                aria-label={selectedDay === 30 ? '۱ شوال' : `روز ${selectedDay + 1} رمضان`}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              {ramadanStatus === 'during' ? (
                <>
                  <h1 className="text-3xl font-black flex items-center gap-2 flex-wrap">
                    روز {selectedDay} رمضان
                    {selectedDay === 1 && <SparklesIcon className="w-6 h-6 text-amber-300" />}
                  </h1>
                  <p className="text-emerald-100 mt-1">{currentDayData?.weekday}</p>
                </>
              ) : ramadanStatus === 'before' && selectedDay === 1 ? (
                <>
                  <h1 className="text-3xl font-black flex items-center gap-2 flex-wrap">
                    {getDaysUntilRamadan()} روز مانده تا ماه رمضان
                  </h1>
                  <p className="text-emerald-100 mt-1">{getTodayWeekdayPersian()}</p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-200/90 text-xl">پیش‌نمایش: </span>
                    روز {selectedDay} رمضان
                    {selectedDay === 1 && <SparklesIcon className="w-6 h-6 text-amber-300" />}
                  </h1>
                  <p className="text-emerald-100 mt-1">{currentDayData?.weekday ?? getTodayWeekdayPersian()}</p>
                </>
              )}
            </div>
            <div className="bg-white text-emerald-600 w-20 h-20 rounded-2xl flex flex-row items-center justify-center gap-0.5 shadow-lg ring-4 ring-emerald-500/30 shrink-0">
              {ramadanStatus === 'during' ? (
                <>
                  <span className="text-2xl font-black leading-none">{progressPercent}</span>
                  <span className="text-sm font-bold">%</span>
                </>
              ) : (
                <span className="text-lg font-bold">—</span>
              )}
            </div>
          </div>
        </div>
        {currentDayData?.event && (
          <div className="mt-6 bg-amber-400/20 p-3 rounded-2xl border border-amber-400/30 text-sm flex items-center gap-3 backdrop-blur-sm animate-pulse">
            <ExclamationCircleIcon className="w-5 h-5 text-amber-300 shrink-0" />
            <span className="font-bold text-amber-50">{currentDayData.event}</span>
          </div>
        )}
      </div>
      <div className="px-4 pb-24 space-y-[10px]">
        {allTasks.map(task => {
          const isCustom = task.id >= CUSTOM_TASK_ID_START;
          const isCompleted = (progress[selectedDay] as number[] || []).includes(task.id);
          let taskUrl = 'urlByDay' in task && task.urlByDay ? task.urlByDay[selectedDay - 1] : (task as { url?: string }).url;
          if (task.id === 1) taskUrl = `https://tanzil.net/#juz-${selectedDay}`;
          return (
            <TaskCard
              key={task.id}
              task={task}
              taskUrl={taskUrl}
              isCompleted={isCompleted}
              isCustom={isCustom}
              onToggle={() => toggleTask(selectedDay, task.id)}
              onDelete={() => {
                if (isCustom) removeCustomTask(task.id);
                else hideBuiltInTask(task.id);
              }}
            />
          );
        })}
        <button
          type="button"
          onClick={() => setShowAddCustomTask(true)}
          className="flex items-center gap-4 p-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all w-full"
        >
          <div className="text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 bg-white border border-slate-100">
            <PlusCircleIcon className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">افزودن مورد روزانهٔ شخصی</span>
        </button>
      </div>
    </div>
  );

  const renderStats = () => {
    const totalPossible = 30 * allTasks.length;
    const totalDone = (Object.values(progress) as number[][]).reduce((acc, curr) => acc + curr.length, 0);
    const overallPercent = Math.round((totalDone / totalPossible) * 100);
    return (
      <div className="p-4 pb-24 animate-fadeIn">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-emerald-600" />
          کارنامه رمضان
        </h2>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-6 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={452} strokeDashoffset={452 - (452 * overallPercent) / 100} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800">{overallPercent}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تکمیل شده</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-700">کل ماه مبارک</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            شما تا کنون <span className="text-emerald-600 font-bold">{totalDone}</span> عمل عبادی را ثبت کرده‌اید.
          </p>
        </div>
        <div className="space-y-[16px]">
          <h4 className="font-black text-slate-800 px-2 text-sm">استمرار در اعمال</h4>
          {allTasks.map(t => {
            const count = (Object.values(progress) as number[][]).filter(p => p.includes(t.id)).length;
            const perc = (count / 30) * 100;
            return (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span>{t.icon}</span>
                    {t.title}
                  </span>
                  <span className="text-emerald-600 font-bold">{count} روز</span>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${perc}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="p-4 pb-24 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="w-6 h-6 text-emerald-600" />
        تنظیمات
      </h2>
      <div className="space-y-[16px]">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 mb-4 mr-2">پروفایل کاربر</h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <UserIcon className="w-7 h-7" />
            </div>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile(p => ({ ...p, name: e.target.value }))}
              className="flex-1 bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-200"
              placeholder="نام شما"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 mb-4 mr-2">شهر</h4>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <MapPinIcon className="w-7 h-7" />
            </div>
            <select
              value={settings.city}
              onChange={(e) => setSettings(s => ({ ...s, city: e.target.value }))}
              className="flex-1 bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-200"
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <BellIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">یادآور هوشمند</h4>
                <p className="text-[10px] text-slate-500">اعلان برای انجام اعمال روزانه</p>
              </div>
            </div>
            <button
              onClick={() => (settings.remindersEnabled ? setSettings(s => ({ ...s, remindersEnabled: false })) : requestNotifications())}
              className={`w-14 h-7 rounded-full transition-all relative ${settings.remindersEnabled ? 'bg-emerald-500 shadow-inner' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.remindersEnabled ? 'left-1 translate-x-7' : 'left-1'}`} />
            </button>
          </div>
          {settings.remindersEnabled && (
            <div className="pt-6 border-t border-slate-50 animate-fadeIn text-center">
              <label className="block text-xs font-bold text-slate-500 mb-3">زمان ارسال نوتیفیکیشن:</label>
              <input
                type="time"
                value={settings.notificationTime}
                onChange={(e) => setSettings(s => ({ ...s, notificationTime: e.target.value }))}
                className="p-3 bg-slate-50 rounded-2xl border-none font-black text-2xl text-emerald-700 outline-none"
              />
            </div>
          )}
        </div>
        {hiddenTaskIds.length > 0 && (
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">اعمال پنهان‌شده</h4>
            <p className="text-xs text-slate-500 mb-4">با سوایپ به چپ از لیست پنهان شده‌اند. برای بازگرداندن به لیست روزانه دکمه را بزنید.</p>
            <ul className="space-y-2">
              {hiddenTaskIds.map(id => {
                const t = TASKS.find(tk => tk.id === id);
                return t ? (
                  <li key={id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                    <span className="font-medium text-slate-600 truncate flex items-center gap-2">
                      <span>{t.icon}</span>
                      {t.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => unhideBuiltInTask(id)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200 transition-colors"
                    >
                      بازگرداندن
                    </button>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <PlusCircleIcon className="w-5 h-5 text-emerald-600" />
            اعمال روزانهٔ شخصی
          </h4>
          <p className="text-xs text-slate-500 mb-4">مواردی که خودتان به لیست روزانه اضافه کرده‌اید.</p>
          {customTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">هنوز موردی اضافه نکرده‌اید.</p>
          ) : (
            <ul className="space-y-2">
              {customTasks.map(t => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className="font-medium text-slate-700 truncate">{t.title}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomTask(t.id)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="حذف"
                    aria-label="حذف"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => { setNewCustomTitle(''); setNewCustomDescription(''); setNewCustomUrl(''); setNewCustomIcon('📌'); setShowAddCustomTask(true); }}
            className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            افزودن مورد روزانه
          </button>
        </div>
        <button onClick={handleReset} className="w-full bg-red-50 text-red-600 p-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <ArrowPathIcon className="w-6 h-6" />
          پاکسازی و بازنشانی اطلاعات
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'today' && renderToday()}
        {activeTab === 'calendar' && (
          <Calendar
            progress={progress}
            totalTasks={allTasks.length}
            selectedDay={selectedDay}
            todayRamadanDay={todayRamadanDay}
            onSelectDay={(dayIndex) => {
              setSelectedDay(dayIndex);
              setActiveTab('today');
            }}
            onGoToToday={() => setSelectedDay(todayRamadanDay ?? 1)}
          />
        )}
        {activeTab === 'stats' && renderStats()}
        <PrayerTimes city={settings.city} day={selectedDay} />
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'courses' && (
          <div className="p-4 pb-24">
            {SESSIONS.length > 0 ? (
              SESSIONS.map((session) => (
                <div key={session.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border-2 border-slate-100">
                  {session.image && (
                    <img
                      src={session.image}
                      alt={session.title}
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                  )}
                  <div className="flex items-start gap-4">
                    <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 shrink-0">
                      {session.icon ?? '📚'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-slate-800">{session.title}</h3>
                      <p className="text-xs text-emerald-600 mt-1 font-bold">{session.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400">👤</span>
                      <span>{session.teachers}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400">🕐</span>
                      <span>{session.time}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400">📍</span>
                      <span>{session.location}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-slate-400">📞</span>
                      <span className="whitespace-pre-line">{session.contact}</span>
                    </p>
                  </div>
                  {session.url && (
                    <a
                      href={session.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center block transition-colors"
                    >
                      مشاهده کانال ✅
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <BookOpenIcon className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold text-lg">جلسه‌ای اضافه نشده</p>
              </div>
            )}
          </div>
        )}
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
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'today' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <CheckCircleIcon className={`w-6 h-6 ${activeTab === 'today' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">امروز</span>
          {activeTab === 'today' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'calendar' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <CalendarIcon className={`w-6 h-6 ${activeTab === 'calendar' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">تقویم</span>
          {activeTab === 'calendar' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
        <button onClick={() => setActiveTab('courses')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'courses' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <BookOpenIcon className={`w-6 h-6 ${activeTab === 'courses' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">جلسات</span>
          {activeTab === 'courses' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'stats' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <ChartBarIcon className={`w-6 h-6 ${activeTab === 'stats' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">گزارش</span>
          {activeTab === 'stats' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <Cog6ToothIcon className={`w-6 h-6 ${activeTab === 'settings' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">تنظیمات</span>
          {activeTab === 'settings' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
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
