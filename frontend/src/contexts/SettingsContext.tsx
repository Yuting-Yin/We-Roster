import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLOR_LIGHT } from "@/theme/colors";

interface SettingsContextType {
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  isLoading: boolean;
  colors: typeof COLOR_LIGHT;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: '@settings/notifications_enabled',
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use light mode colors only
  const colors = COLOR_LIGHT;

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);

        if (notifications !== null) {
          setNotificationsEnabled(JSON.parse(notifications));
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(newValue));
    } catch (error) {
      console.warn('Failed to save notification preference:', error);
    }
  };

  const value: SettingsContextType = {
    notificationsEnabled,
    toggleNotifications,
    isLoading,
    colors,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
