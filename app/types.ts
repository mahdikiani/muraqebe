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
}
