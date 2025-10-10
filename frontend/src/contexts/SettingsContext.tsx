import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLOR_LIGHT } from "@/theme/colors";

export interface DashboardSection {
  id: string;
  title: string;
  subtitle: string;
  enabled: boolean;
}

interface SettingsContextType {
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  isLoading: boolean;
  colors: typeof COLOR_LIGHT;
  dashboardSections: DashboardSection[];
  updateDashboardSections: (sections: DashboardSection[]) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: '@settings/notifications_enabled',
  DASHBOARD_SECTIONS: '@settings/dashboard_sections',
};

const DEFAULT_DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 'whos-on-duty',
    title: "Who's on duty",
    subtitle: "See who's on the duty based on your saved filter",
    enabled: true,
  },
  {
    id: 'upcoming-shifts',
    title: "Upcoming shifts",
    subtitle: "View your scheduled shifts for this week",
    enabled: true,
  },
  {
    id: 'upcoming-leaves',
    title: "Upcoming leaves",
    subtitle: "Track your approved and pending leaves for this month",
    enabled: true,
  },
  {
    id: 'open-shifts',
    title: "Open shifts",
    subtitle: "Browse available shifts you can apply for this week",
    enabled: true,
  },
];

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dashboardSections, setDashboardSections] = useState<DashboardSection[]>(DEFAULT_DASHBOARD_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use light mode colors only
  const colors = COLOR_LIGHT;

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
        const sections = await AsyncStorage.getItem(STORAGE_KEYS.DASHBOARD_SECTIONS);

        if (notifications !== null) {
          setNotificationsEnabled(JSON.parse(notifications));
        }
        
        if (sections !== null) {
          setDashboardSections(JSON.parse(sections));
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

  const updateDashboardSections = async (sections: DashboardSection[]) => {
    setDashboardSections(sections);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DASHBOARD_SECTIONS, JSON.stringify(sections));
    } catch (error) {
      console.warn('Failed to save dashboard sections:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    notificationsEnabled,
    toggleNotifications,
    isLoading,
    colors,
    dashboardSections,
    updateDashboardSections,
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
