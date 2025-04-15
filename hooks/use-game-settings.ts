import { useState, useEffect } from 'react';

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  ghostPieceEnabled: boolean;
  startLevel: number;
  dropSpeed: 'normal' | 'fast' | 'faster';
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  ghostPieceEnabled: true,
  startLevel: 1,
  dropSpeed: 'normal',
};

const STORAGE_KEY = 'pentris-settings';

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Failed to parse game settings:', error);
      }
    }
  }, []);

  // Update a single setting
  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}