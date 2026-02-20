import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { loadFromStorage, saveToStorage, clearStorage, StoredData } from '@/config/storage';
import type { UserProgress, UserSettings, UserProfile, CustomTask } from '@/types';
import { getTodayRamadanDay } from '@/lib/dateUtils';
import { TASKS, CUSTOM_TASK_ID_START } from '@/constants';

const defaultProfile: UserProfile = {
  name: 'کاربر گرامی',
  joinedAt: new Date().toISOString(),
};

const defaultSettings: UserSettings = {
  remindersEnabled: false,
  notificationTime: '18:00',
  city: 'tehran',
};

export function useAppStorage() {
  const [selectedDay, setSelectedDay] = useState<number>(() => getTodayRamadanDay() ?? 1);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [progress, setProgress] = useState<UserProgress>({});
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<number[]>([]);
  const isFirstSave = useRef(true);

  /** True after first load; true means no stored data (show intro). */
  const [storageEmptyOnLoad, setStorageEmptyOnLoad] = useState<boolean | null>(null);

  useEffect(() => {
    const data = loadFromStorage();
    if (data) {
      if (data.progress) setProgress(data.progress);
      if (data.settings) setSettings({ ...defaultSettings, ...data.settings, city: data.settings.city || 'tehran' });
      if (data.userProfile) setUserProfile(data.userProfile);
      if (Array.isArray(data.customTasks)) setCustomTasks(data.customTasks);
      if (Array.isArray(data.hiddenTaskIds)) setHiddenTaskIds(data.hiddenTaskIds);
    }
    setStorageEmptyOnLoad(!data);
  }, []);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    saveToStorage({ progress, settings, userProfile, customTasks, hiddenTaskIds });
  }, [progress, settings, userProfile, customTasks, hiddenTaskIds]);

  const visibleBuiltInTasks = useMemo(
    () => TASKS.filter((t) => !hiddenTaskIds.includes(t.id)),
    [hiddenTaskIds]
  );
  const allTasks = useMemo(() => [...visibleBuiltInTasks, ...customTasks], [visibleBuiltInTasks, customTasks]);

  const toggleTask = useCallback((dayIdx: number, taskId: number) => {
    setProgress((prev) => {
      const currentDayTasks = prev[dayIdx] || [];
      if (currentDayTasks.includes(taskId)) {
        return { ...prev, [dayIdx]: currentDayTasks.filter((id) => id !== taskId) };
      }
      return { ...prev, [dayIdx]: [...currentDayTasks, taskId] };
    });
  }, []);

  const hideBuiltInTask = useCallback((id: number) => {
    setHiddenTaskIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setProgress((prev) => {
      const next = { ...prev };
      for (const day of Object.keys(next) as unknown as number[]) {
        next[day] = next[day].filter((tid) => tid !== id);
      }
      return next;
    });
  }, []);

  const unhideBuiltInTask = useCallback((id: number) => {
    setHiddenTaskIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const addCustomTask = useCallback(
    (title: string, description: string, url: string, icon: string) => {
      const t = title.trim();
      if (!t) return;
      const nextId = customTasks.length
        ? Math.max(...customTasks.map((c) => c.id), CUSTOM_TASK_ID_START - 1) + 1
        : CUSTOM_TASK_ID_START;
      setCustomTasks((prev) => [
        ...prev,
        {
          id: nextId,
          title: t,
          description: description.trim() || undefined,
          icon,
          url: url.trim() || undefined,
        },
      ]);
    },
    [customTasks.length]
  );

  const removeCustomTask = useCallback((id: number) => {
    setCustomTasks((prev) => prev.filter((t) => t.id !== id));
    setProgress((prev) => {
      const next = { ...prev };
      for (const day of Object.keys(next) as unknown as number[]) {
        next[day] = next[day].filter((tid) => tid !== id);
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearStorage();
    setProgress({});
    setCustomTasks([]);
    setHiddenTaskIds([]);
    setUserProfile(defaultProfile);
    setSelectedDay(1);
  }, []);

  const requestNotifications = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings((s) => ({ ...s, remindersEnabled: true }));
        new Notification('نوتیفیکیشن فعال شد', {
          body: 'یادآورهای رمضان برای شما ارسال خواهد شد.',
        });
      }
    }
  }, []);

  return {
    selectedDay,
    setSelectedDay,
    userProfile,
    setUserProfile,
    progress,
    settings,
    setSettings,
    customTasks,
    hiddenTaskIds,
    allTasks,
    toggleTask,
    hideBuiltInTask,
    unhideBuiltInTask,
    addCustomTask,
    removeCustomTask,
    resetAll,
    requestNotifications,
    /** True when initial load had no stored data (show welcome intro). */
    storageEmptyOnLoad,
  };
}
