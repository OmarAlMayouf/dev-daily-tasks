import { useState, useEffect, useCallback } from 'react';

export interface CustomTag {
  id: string;
  label: string;
  color: string; // HSL color value like "0 70% 55%"
}

export interface Settings {
  customTags: CustomTag[];
  enabledDefaultTags: string[];
  theme: 'light' | 'dark';
  todoLimit: number;
  doingLimit: number;
  doneLimit: number;
}

const SETTINGS_KEY = 'dev-todos-settings';

const DEFAULT_SETTINGS: Settings = {
  customTags: [],
  enabledDefaultTags: ['bug', 'feature', 'refactor', 'infra', 'docs'],
  theme: 'light',
  todoLimit: 10,
  doingLimit: 3,
  doneLimit: 20,
};

const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    
    // Apply theme immediately on load
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const addCustomTag = useCallback((label: string, color: string) => {
    const newTag: CustomTag = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: label.toLowerCase(),
      color,
    };
    setSettings(prev => ({
      ...prev,
      customTags: [...prev.customTags, newTag],
    }));
    return newTag;
  }, []);

  const removeCustomTag = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      customTags: prev.customTags.filter(tag => tag.id !== id),
    }));
  }, []);

  const updateCustomTag = useCallback((id: string, updates: Partial<Omit<CustomTag, 'id'>>) => {
    setSettings(prev => ({
      ...prev,
      customTags: prev.customTags.map(tag =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    }));
  }, []);

  const toggleDefaultTag = useCallback((tagId: string) => {
    setSettings(prev => ({
      ...prev,
      enabledDefaultTags: prev.enabledDefaultTags.includes(tagId)
        ? prev.enabledDefaultTags.filter(id => id !== tagId)
        : [...prev.enabledDefaultTags, tagId],
    }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setColumnLimit = useCallback((column: 'todo' | 'doing' | 'done', limit: number) => {
    const limitKey = `${column}Limit` as keyof Pick<Settings, 'todoLimit' | 'doingLimit' | 'doneLimit'>;
    setSettings(prev => ({ ...prev, [limitKey]: limit }));
  }, []);

  const getAllTags = useCallback(() => {
    return [
      ...settings.enabledDefaultTags,
      ...settings.customTags.map(t => t.id),
    ];
  }, [settings.enabledDefaultTags, settings.customTags]);

  const getTagLabel = useCallback((tagId: string): string => {
    // Check custom tags
    const customTag = settings.customTags.find(t => t.id === tagId);
    if (customTag) return customTag.label;
    
    // Return default tag as-is
    return tagId;
  }, [settings.customTags]);

  const getTagColor = useCallback((tagId: string): string | undefined => {
    const customTag = settings.customTags.find(t => t.id === tagId);
    return customTag?.color;
  }, [settings.customTags]);

  return {
    settings,
    addCustomTag,
    removeCustomTag,
    updateCustomTag,
    toggleDefaultTag,
    setTheme,
    setColumnLimit,
    getAllTags,
    getTagLabel,
    getTagColor,
  };
}
