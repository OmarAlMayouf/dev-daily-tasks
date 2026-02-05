import { createContext, useContext, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

const SettingsContext = createContext<ReturnType<typeof useSettings> | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
