
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SchoolSetup, NotificationPreferences } from '@/types';
import { schoolSetupService } from '@/services/schoolSetupService';

interface ReminderContextType {
  schoolSetup: SchoolSetup | null;
  setSchoolSetup: React.Dispatch<React.SetStateAction<SchoolSetup | null>>;
  isLoading: boolean;
  error: string | null;
  fetchSchoolSetup: (userId: string) => Promise<void>;
  saveSchoolSetup: (schoolSetup: SchoolSetup, userId: string) => Promise<boolean>;
  updateSchoolSetup: (userId: string, schoolSetup: SchoolSetup) => Promise<boolean>;
  updateNotificationPreferences: (prefs: NotificationPreferences) => void;
  isOnline: boolean;
  syncWithCloud: () => Promise<void>;
  completedTasks: number;
  totalTasks: number;
  todaysReminders: any[];
  pastDueReminders: any[];
  toggleReminderComplete: (id: string) => void;
  reminders: any[];
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolSetup, setSchoolSetup] = useState<SchoolSetup | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [reminders, setReminders] = useState<any[]>([]);
  
  // Mock data for demonstration
  const completedTasks = 3;
  const totalTasks = 10;
  const todaysReminders: any[] = [];
  const pastDueReminders: any[] = [];

  const fetchSchoolSetup = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSchoolSetup = await schoolSetupService.getSchoolSetup(userId);
      setSchoolSetup(fetchedSchoolSetup);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch school setup');
      setSchoolSetup(null);
      console.error("Error fetching school setup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchoolSetup = async (schoolSetup: SchoolSetup, userId: string) => {
    try {
      await schoolSetupService.saveSchoolSetup(userId, schoolSetup);
      return true;
    } catch (error) {
      console.error("Error saving school setup:", error);
      return false;
    }
  };

  const updateSchoolSetup = async (userId: string, schoolSetup: SchoolSetup) => {
    try {
      await schoolSetupService.updateSchoolSetup(userId, schoolSetup);
      return true;
    } catch (error) {
      console.error("Error updating school setup:", error);
      return false;
    }
  };
  
  const updateNotificationPreferences = (prefs: NotificationPreferences) => {
    if (!schoolSetup) return;
    
    setSchoolSetup(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notificationPreferences: prefs
      };
    });
  };
  
  const syncWithCloud = async () => {
    // Mock implementation
    console.log("Syncing with cloud...");
    return Promise.resolve();
  };
  
  const toggleReminderComplete = (id: string) => {
    // Mock implementation
    console.log(`Toggling reminder ${id} complete status`);
  };

  // Effect to listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value: ReminderContextType = {
    schoolSetup,
    setSchoolSetup,
    isLoading,
    error,
    fetchSchoolSetup,
    saveSchoolSetup,
    updateSchoolSetup,
    updateNotificationPreferences,
    isOnline,
    syncWithCloud,
    completedTasks,
    totalTasks,
    todaysReminders,
    pastDueReminders,
    toggleReminderComplete,
    reminders,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminder must be used within a ReminderProvider");
  }
  return context;
};

// Add this line to maintain compatibility with components that use useReminders
export const useReminders = useReminder;

// Export types from types.ts to maintain backward compatibility
export * from '@/types';
