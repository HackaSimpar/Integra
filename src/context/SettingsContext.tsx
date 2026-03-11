import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  primaryColor: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({ primaryColor: '#0ea5e9' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.primaryColor) {
          setSettings({ primaryColor: data.primaryColor });
          document.documentElement.style.setProperty('--color-primary', data.primaryColor);
        }
      });
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (updated.primaryColor) {
        document.documentElement.style.setProperty('--color-primary', updated.primaryColor);
      }
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
