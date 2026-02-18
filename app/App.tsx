import React, { useState, useEffect, useMemo } from 'react';
import { TASKS, RAMADAN_DAYS } from './constants';
import { UserProgress, UserSettings, UserProfile } from './types';
import {
  CheckCircleIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BellIcon,
  ExclamationCircleIcon,
  UserIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const STORAGE_KEY = 'ramadan_muraqabah_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'stats' | 'settings'>('today');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'کاربر گرامی', joinedAt: new Date().toISOString() });
  const [showIntro, setShowIntro] = useState(false);
  const [progress, setProgress] = useState<UserProgress>({});
  const [settings, setSettings] = useState<UserSettings>({
    remindersEnabled: false,
    notificationTime: '18:00',
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.progress) setProgress(parsed.progress);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
      } catch (e) {
        console.error("Failed to parse storage data", e);
        setShowIntro(true);
      }
    } else {
      setShowIntro(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, settings, userProfile }));
  }, [progress, settings, userProfile]);

  const closeIntro = () => setShowIntro(false);

  const handleReset = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید تمام اطلاعات ثبت شده را پاک کنید؟')) {
      localStorage.removeItem(STORAGE_KEY);
      setProgress({});
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

  const currentDayData = useMemo(() => RAMADAN_DAYS.find(d => d.dayIndex === selectedDay), [selectedDay]);
  const completedCount = progress[selectedDay]?.length || 0;
  const progressPercent = Math.round((completedCount / TASKS.length) * 100);

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
      <div className="bg-emerald-600 text-white p-6 rounded-b-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-emerald-50">{userProfile.name}</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md text-xs border border-white/20">
              {currentDayData?.solarDate}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2">
                روز {selectedDay} رمضان
                {selectedDay === 1 && <SparklesIcon className="w-6 h-6 text-amber-300" />}
              </h1>
              <p className="text-emerald-100 mt-1">{currentDayData?.weekday} الکریم</p>
            </div>
            <div className="bg-white text-emerald-600 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
              <span className="text-xl font-black leading-none">{progressPercent}</span>
              <span className="text-[10px] font-bold">%</span>
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
      <div className="px-4 pb-24 space-y-4">
        {TASKS.map(task => {
          const isCompleted = (progress[selectedDay] as number[] || []).includes(task.id);
          let taskUrl = task.url;
          if (task.id === 1) taskUrl = `https://tanzil.net/#juz-${selectedDay}`;
          return (
            <div
              key={task.id}
              onClick={() => toggleTask(selectedDay, task.id)}
              className={`flex items-center gap-4 p-5 rounded-3xl transition-all cursor-pointer border-2 ${isCompleted ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100 shadow-sm active:scale-98'
                }`}
            >
              <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 ${isCompleted ? 'bg-emerald-100' : 'bg-slate-50'}`}>
                {task.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-base ${isCompleted ? 'text-emerald-900' : 'text-slate-800'}`}>{task.title}</h3>
                {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
              </div>
              {taskUrl && (
                <a
                  href={taskUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-10 h-10 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-100 shadow-sm"
                  title="مشاهده منبع"
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </a>
              )}
              <div className="mr-2">
                {isCompleted ? <CheckCircleSolid className="w-8 h-8 text-emerald-500" /> : <div className="w-8 h-8 rounded-full border-2 border-slate-200" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="p-4 pb-24 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-emerald-600" />
          تقویم مراقبه
        </h2>
        <button onClick={() => setSelectedDay(1)} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
          امروز
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {RAMADAN_DAYS.map(day => {
          const dayProg = (progress[day.dayIndex] as number[] || []).length;
          const isDone = dayProg === TASKS.length;
          const isSelected = selectedDay === day.dayIndex;
          return (
            <button
              key={day.dayIndex}
              onClick={() => { setSelectedDay(day.dayIndex); setActiveTab('today'); }}
              className={`flex flex-col items-center justify-center aspect-square rounded-[1.5rem] transition-all relative ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-100'
                  : dayProg > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-white border border-slate-100 text-slate-400'
                }`}
            >
              <span className="text-lg font-black">{day.dayIndex}</span>
              <span className="text-[10px] font-bold opacity-60">{day.weekday.slice(0, 3)}</span>
              {dayProg > 0 && (
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStats = () => {
    const totalPossible = 30 * TASKS.length;
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
        <div className="space-y-4">
          <h4 className="font-black text-slate-800 px-2 text-sm">استمرار در اعمال</h4>
          {TASKS.slice(0, 6).map(t => {
            const count = (Object.values(progress) as number[][]).filter(p => p.includes(t.id)).length;
            const perc = (count / 30) * 100;
            return (
              <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-bold text-slate-700">{t.title}</span>
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
      <div className="space-y-4">
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
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'settings' && renderSettings()}
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
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around p-4 z-50 rounded-t-[2.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button onClick={() => setActiveTab('today')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'today' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <CheckCircleIcon className={`w-6 h-6 ${activeTab === 'today' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">امروز</span>
          {activeTab === 'today' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center p-2 rounded-2xl transition-all ${activeTab === 'calendar' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <CalendarIcon className={`w-6 h-6 ${activeTab === 'calendar' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px] mt-1.5 font-black">تقویم</span>
          {activeTab === 'calendar' && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
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
