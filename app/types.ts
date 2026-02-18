export interface Task {
  id: number;
  title: string;
  description?: string;
  url?: string;
  /** One URL per Ramadan day (1–30); used when present instead of url. */
  urlByDay?: string[];
  icon?: string;
}

export interface RamadanDay {
  dayIndex: number; // 1 to 30
  weekday: string;
  hijriDate: number;
  solarDate: string; // e.g. "1 فروردین"
  event?: string;
}

export interface UserProgress {
  [dayIndex: number]: number[]; // dayIndex -> array of taskIds completed
}

export interface UserProfile {
  name: string;
  joinedAt: string;
}

export interface UserSettings {
  remindersEnabled: boolean;
  notificationTime: string;
  city: string;
}

export interface City {
  id: string;
  name: string;
}

export interface PrayerTimes {
  imsak: string;
  fajr: string;
  sunrise: string;
  noon: string;
  sunset: string;
  maghrib: string;
  midnight: string;
}

/** User-created daily tasks; id must be >= CUSTOM_TASK_ID_START (see constants). */
export type CustomTask = Pick<Task, 'id' | 'title' | 'description' | 'icon' | 'url'> & { id: number };

export interface Session {
  id: number;
  title: string;
  description: string;
  teachers: string;
  time: string;
  location: string;
  contact: string;
  url?: string;
  icon?: string;
  image?: string;
}
