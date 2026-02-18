import React from 'react';
import {
  Cog6ToothIcon,
  UserIcon,
  MapPinIcon,
  BellIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { UserProgress, UserProfile, UserSettings, CustomTask, Task, City } from '@/types';

export interface SettingsPageProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  customTasks: CustomTask[];
  removeCustomTask: (id: number) => void;
  hiddenTaskIds: number[];
  unhideBuiltInTask: (id: number) => void;
  tasks: Task[];
  cities: City[];
  onShowAddCustomTask: () => void;
  onReset: () => void;
  onRequestNotifications: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  setUserProfile,
  settings,
  setSettings,
  customTasks,
  removeCustomTask,
  hiddenTaskIds,
  unhideBuiltInTask,
  tasks,
  cities,
  onShowAddCustomTask,
  onReset,
  onRequestNotifications,
}) => {
  return (
    <div className="p-4 pb-24 animate-fadeIn">
      <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Cog6ToothIcon className="w-6 h-6 text-emerald-600" />
        تنظیمات
      </h2>
      <div className="space-y-[16px]">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-2">
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

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <MapPinIcon className="w-7 h-7" />
            </div>
            <select
              value={settings.city}
              onChange={(e) => setSettings(s => ({ ...s, city: e.target.value }))}
              className="flex-1 bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-200"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
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
              onClick={() => (settings.remindersEnabled ? setSettings(s => ({ ...s, remindersEnabled: false })) : onRequestNotifications())}
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
        </div> */}
        {hiddenTaskIds.length > 0 && (
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">اعمال پنهان‌شده</h4>
            <p className="text-xs text-slate-500 mb-4">با سوایپ به چپ از لیست پنهان شده‌اند. برای بازگرداندن به لیست روزانه دکمه را بزنید.</p>
            <ul className="space-y-2">
              {hiddenTaskIds.map(id => {
                const t = tasks.find(tk => tk.id === id);
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
            onClick={onShowAddCustomTask}
            className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-emerald-200 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircleIcon className="w-5 h-5" />
            افزودن مورد روزانه
          </button>
        </div>
        <a
          href="https://ble.ir/mahdikiani"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-50 text-emerald-600 p-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          تماس با پشتیبانی
        </a>
        <button onClick={onReset} className="w-full bg-red-50 text-red-600 p-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <ArrowPathIcon className="w-6 h-6" />
          پاکسازی و بازنشانی اطلاعات
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
