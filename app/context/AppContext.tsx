import React, { createContext, useContext, ReactNode } from 'react';
import { useAppStorage } from '@/hooks/useAppStorage';

export type AppContextValue = ReturnType<typeof useAppStorage>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const value = useAppStorage();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
