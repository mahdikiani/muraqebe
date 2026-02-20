/** LocalStorage key for app state. Bump version when schema changes. */
export const STORAGE_KEY = 'ramadan_muraqabah_v3';

export interface StoredData {
  progress?: Record<number, number[]>;
  settings?: { remindersEnabled: boolean; notificationTime: string; city: string };
  userProfile?: { name: string; joinedAt: string };
  customTasks?: Array<{ id: number; title: string; description?: string; icon?: string; url?: string }>;
  hiddenTaskIds?: number[];
}

export function loadFromStorage(): StoredData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredData;
  } catch {
    return null;
  }
}

export function saveToStorage(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
