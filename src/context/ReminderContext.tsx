
import React, { createContext, useState, useContext, useEffect } from 'react';
import { SchoolSetup, NotificationPreferences, Reminder, RecurrencePattern, ReminderPriority, ReminderTiming, ReminderType, DayOfWeek } from '@/types';
import { schoolSetupService } from '@/services/schoolSetupService';
import { getUserReminders, saveReminder, updateReminder, deleteReminder as deleteReminderApi } from '@/services/reminderService';
import { v4 as uuidv4 } from 'uuid';
import { isPreviewEnvironment } from '@/services/utils/serviceUtils';

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
  todaysReminders: Reminder[];
  pastDueReminders: Reminder[];
  toggleReminderComplete: (id: string) => void;
  reminders: Reminder[];
  createReminder: (reminderData: Partial<Reminder>) => void;
  bulkCompleteReminders: (ids: string[]) => void;
  deleteReminder: (id: string) => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolSetup, setSchoolSetup] = useState<SchoolSetup | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine || isPreviewEnvironment());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // Mock data for demonstration
  const completedTasks = 3;
  const totalTasks = 10;
  const todaysReminders: Reminder[] = [];
  const pastDueReminders: Reminder[] = [];

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
    // If in preview environment, simulate successful sync
    if (isPreviewEnvironment()) {
      console.log("Preview environment - simulating cloud sync");
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      return;
    }
    
    // Mock implementation
    console.log("Syncing with cloud...");
    return Promise.resolve();
  };
  
  const toggleReminderComplete = (id: string) => {
    // Implementation to toggle a reminder's complete status
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed } 
          : reminder
      )
    );
  };
  
  const createReminder = (reminderData: Partial<Reminder>) => {
    const newReminder: Reminder = {
      id: uuidv4(),
      userId: "current-user", // This should be replaced with the actual user ID
      title: reminderData.title || "",
      periodId: reminderData.periodId || "",
      timing: reminderData.timing || ReminderTiming.DuringPeriod,
      type: reminderData.type || ReminderType.Task,
      priority: reminderData.priority || ReminderPriority.Medium,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      days: reminderData.days || [],
      category: reminderData.category || "",
      notes: reminderData.notes || "",
      recurrence: reminderData.recurrence || RecurrencePattern.None,
      ...reminderData
    };
    
    setReminders(prev => [...prev, newReminder]);
    
    // Special handling for preview environment
    if (isPreviewEnvironment()) {
      console.log("Creating reminder in preview mode:", newReminder);
      
      // Simulate successful saving
      setTimeout(() => {
        console.log("Reminder successfully saved in preview mode");
      }, 500);
      
      return;
    }
    
    // Here you would typically also save to backend
    try {
      saveReminder(newReminder, newReminder.userId);
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };
  
  const bulkCompleteReminders = (ids: string[]) => {
    setReminders(prev => 
      prev.map(reminder => 
        ids.includes(reminder.id!) 
          ? { ...reminder, completed: true } 
          : reminder
      )
    );
    
    // Here you would typically also update backend
    ids.forEach(id => {
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        try {
          updateReminder(id, { completed: true }, reminder.userId);
        } catch (error) {
          console.error(`Error updating reminder ${id}:`, error);
        }
      }
    });
  };
  
  const deleteReminderHandler = (id: string) => {
    const reminderToDelete = reminders.find(r => r.id === id);
    if (!reminderToDelete) return;
    
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    
    // Delete from backend
    try {
      deleteReminderApi(id, reminderToDelete.userId);
    } catch (error) {
      console.error(`Error deleting reminder ${id}:`, error);
    }
  };

  // Effect to listen for online/offline events
  useEffect(() => {
    // If in preview environment, always set as online
    if (isPreviewEnvironment()) {
      setIsOnline(true);
      return;
    }
    
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
    createReminder,
    bulkCompleteReminders,
    deleteReminder: deleteReminderHandler,
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
