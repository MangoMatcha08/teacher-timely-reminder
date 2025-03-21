import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import * as FirebaseService from "@/services/firebase";

export type DayOfWeek = "M" | "T" | "W" | "Th" | "F";

export type PeriodSchedule = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

export type Period = {
  id: string;
  name: string;
  schedules: PeriodSchedule[];
};

export type ReminderType = "Call Home" | "Email" | "Talk to Student" | "Prepare Materials" | "Grade" | "Other" | "_none";
export type ReminderTiming = "Before School" | "After School" | "Before Period" | "After Period" | "During Period" | "Start of Period" | "End of Period" | "15 Minutes Into Period";

export type RecurrencePattern =
  | "Once"
  | "Daily" 
  | "Weekly"
  | "Specific Days";

export type ReminderPriority = "Low" | "Medium" | "High";

export type NotificationType = "Email" | "Push" | "Text";

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address: string;
    minPriority: ReminderPriority;
  };
  push: {
    enabled: boolean;
    minPriority: ReminderPriority;
  };
  text: {
    enabled: boolean;
    phoneNumber?: string;
    minPriority: ReminderPriority;
  };
}

export interface Reminder {
  id?: string;
  title: string;
  type?: ReminderType;
  timing: ReminderTiming;
  days: DayOfWeek[];
  periodId?: string;
  category?: string;
  notes?: string;
  recurrence: RecurrencePattern;
  createdAt?: Date;
  priority: ReminderPriority;
  completed?: boolean;
  termId?: string; // Term identifier
  dueDate?: string; // ISO date string
  isPastDue?: boolean;
}

export interface SchoolHours {
  startTime: string;
  endTime: string;
  teacherArrivalTime: string;
}

export interface Term {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  schoolYear?: string; // Added school year field
}

export interface SchoolSetup {
  termId: string;
  terms: Term[];
  schoolDays: DayOfWeek[];
  periods: Period[];
  schoolHours: SchoolHours;
  categories: string[];
  notificationPreferences?: NotificationPreferences;
  iepMeetings?: {
    enabled: boolean;
    beforeSchool?: boolean;
    afterSchool?: boolean;
    beforeSchoolTime?: string; // Added time field
    afterSchoolTime?: string;  // Added time field
    specificTimes?: {
      day: DayOfWeek;
      startTime: string;
      endTime: string;
    }[];
  };
}

interface ReminderContextType {
  reminders: Reminder[];
  schoolSetup: SchoolSetup | null;
  createReminder: (reminder: Omit<Reminder, "id" | "createdAt" | "completed">) => void;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  saveSchoolSetup: (setup: SchoolSetup) => void;
  todaysReminders: Reminder[];
  pastDueReminders: Reminder[];
  toggleReminderComplete: (id: string) => void;
  filteredReminders: (filters: {
    category?: string;
    priority?: ReminderPriority;
    type?: ReminderType;
    completed?: boolean;
    includePastDue?: boolean;
  }) => Reminder[];
  bulkCompleteReminders: (ids: string[]) => void;
  updateNotificationPreferences: (preferences: NotificationPreferences) => void;
  completedTasks: number;
  totalTasks: number;
  syncWithCloud: () => Promise<void>;
  isOnline: boolean;
  fetchReminders: () => void;
}

const ReminderContext = createContext<ReminderContextType>({
  reminders: [],
  schoolSetup: null,
  createReminder: () => {},
  updateReminder: () => {},
  deleteReminder: () => {},
  saveSchoolSetup: () => {},
  todaysReminders: [],
  pastDueReminders: [],
  toggleReminderComplete: () => {},
  filteredReminders: () => [],
  bulkCompleteReminders: () => {},
  updateNotificationPreferences: () => {},
  completedTasks: 0,
  totalTasks: 0,
  syncWithCloud: async () => {},
  isOnline: false,
  fetchReminders: () => {}
});

export const useReminders = () => useContext(ReminderContext);

const getTodayDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
};

const getDefaultNotificationPreferences = (): NotificationPreferences => {
  return {
    email: {
      enabled: true,
      address: "zhom08@gmail.com", // Default email for test account
      minPriority: "Medium"
    },
    push: {
      enabled: false,
      minPriority: "High"
    },
    text: {
      enabled: false,
      phoneNumber: "",
      minPriority: "High"
    }
  };
};

const createDefaultTerm = (): Term => {
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(now.getMonth() + 4); // Roughly a semester
  
  const currentYear = now.getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;
  
  return {
    id: "term_default",
    name: "Current Term",
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    schoolYear: schoolYear
  };
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schoolSetup, setSchoolSetup] = useState<SchoolSetup | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'failed'>('synced');
  
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
  
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDataFromFirebase();
    }
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    const storedReminders = localStorage.getItem("teacher_reminders");
    const storedSchoolSetup = localStorage.getItem("school_setup");
    
    if (storedReminders) {
      try {
        const parsed = JSON.parse(storedReminders);
        const migratedReminders = parsed.map((r: any) => ({
          ...r,
          timing: r.timing || "During Period",
          recurrence: r.recurrence || "Once",
          priority: r.priority || "Medium",
          completed: r.completed || false,
          termId: r.termId || "term_default",
          dueDate: r.dueDate || new Date().toISOString(),
          isPastDue: false // Will be calculated later
        }));
        setReminders(migratedReminders);
      } catch (e) {
        console.error("Failed to parse reminders from localStorage", e);
        setReminders([]);
      }
    }
    
    if (storedSchoolSetup) {
      try {
        const parsed = JSON.parse(storedSchoolSetup);
        const defaultTerm = createDefaultTerm();
        const defaultNotificationPreferences = getDefaultNotificationPreferences();
        
        setSchoolSetup({
          ...parsed,
          termId: parsed.termId || defaultTerm.id,
          terms: parsed.terms || [defaultTerm],
          categories: parsed.categories || [
            "Materials/Set up",
            "Student support",
            "School events",
            "Instruction",
            "Administrative tasks"
          ],
          notificationPreferences: parsed.notificationPreferences || defaultNotificationPreferences,
          iepMeetings: parsed.iepMeetings || {
            enabled: false
          }
        });
      } catch (e) {
        console.error("Failed to parse school setup from localStorage", e);
        setSchoolSetup(null);
      }
    }
  }, []);

  useEffect(() => {
    const updatePastDueStatus = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      setReminders(prev => 
        prev.map(reminder => {
          if (reminder.dueDate) {
            const dueDate = new Date(reminder.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const isPastDue = dueDate < today && !reminder.completed;
            return { ...reminder, isPastDue };
          }
          return reminder;
        })
      );
    };

    updatePastDueStatus();
    const interval = setInterval(updatePastDueStatus, 86400000); // 24 hours
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem("teacher_reminders", JSON.stringify(reminders));
    }
  }, [reminders]);
  
  useEffect(() => {
    if (schoolSetup) {
      localStorage.setItem("school_setup", JSON.stringify(schoolSetup));
    }
  }, [schoolSetup]);
  
  const loadDataFromFirebase = async () => {
    if (!user) return;
    
    try {
      const cloudReminders = await FirebaseService.getUserReminders(user.id);
      if (cloudReminders.length > 0) {
        setReminders(cloudReminders);
      }
      
      const cloudSetup = await FirebaseService.getSchoolSetup(user.id);
      if (cloudSetup) {
        // Ensure notification preferences exist
        if (!cloudSetup.notificationPreferences) {
          cloudSetup.notificationPreferences = getDefaultNotificationPreferences();
        }
        setSchoolSetup(cloudSetup);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error loading data from Firebase:", error);
      setSyncStatus('failed');
    }
  };
  
  const syncWithCloud = async () => {
    if (!user || !isOnline) return;
    
    try {
      setSyncStatus('pending');
      
      for (const reminder of reminders) {
        await FirebaseService.saveReminder(reminder, user.id);
      }
      
      if (schoolSetup) {
        await FirebaseService.saveSchoolSetup(user.id, schoolSetup);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      setSyncStatus('failed');
    }
  };
  
  const createReminder = (reminderData: Omit<Reminder, "id" | "createdAt" | "completed">) => {
    const today = new Date();
    const currentDayCode = getTodayDayCode();
    const shouldBeNextWeek = reminderData.days.includes(currentDayCode) && 
                            reminderData.timing === "During Period" && 
                            isTimePassed(reminderData.periodId, today);
    
    const adjustedDays = shouldBeNextWeek 
      ? reminderData.days.filter(d => d !== currentDayCode)
      : reminderData.days;
    
    const dueDate = calculateNextOccurrence(reminderData.days);
    
    const newReminder: Reminder = {
      ...reminderData,
      days: adjustedDays,
      id: `rem_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      completed: false,
      termId: schoolSetup?.termId || "term_default",
      dueDate: dueDate.toISOString(),
      isPastDue: false
    };
    
    setReminders((prev) => [...prev, newReminder]);
    
    if (isOnline && user) {
      FirebaseService.saveReminder(newReminder, user.id)
        .catch(error => console.error("Error saving reminder to Firebase:", error));
    }

    sendReminderNotification(newReminder);
  };

  const calculateNextOccurrence = (days: DayOfWeek[]): Date => {
    if (!days.length) return new Date();
    
    const today = new Date();
    const todayDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayIndices = days.map(day => {
      switch (day) {
        case 'M': return 1;
        case 'T': return 2;
        case 'W': return 3;
        case 'Th': return 4;
        case 'F': return 5;
        default: return 1;
      }
    });
    
    let daysUntilNext = 7;
    for (const dayIndex of dayIndices) {
      const difference = (dayIndex - todayDayIndex + 7) % 7;
      if (difference < daysUntilNext && (difference > 0 || (difference === 0 && !isTimePassed(undefined, today)))) {
        daysUntilNext = difference;
      }
    }
    
    if (daysUntilNext === 7) {
      daysUntilNext = (dayIndices[0] - todayDayIndex + 7) % 7;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    return nextDate;
  };
  
  const isTimePassed = (periodId?: string, currentDate: Date = new Date()): boolean => {
    if (!schoolSetup) return false;
    
    const todayDayCode = getTodayDayCode();
    
    if (!periodId) {
      const [hourStr, minuteStr] = schoolSetup.schoolHours.endTime.split(':');
      const [minutes, meridian] = minuteStr.split(' ');
      
      let hour = parseInt(hourStr);
      if (meridian === 'PM' && hour < 12) hour += 12;
      if (meridian === 'AM' && hour === 12) hour = 0;
      
      const endTimeDate = new Date();
      endTimeDate.setHours(hour);
      endTimeDate.setMinutes(parseInt(minutes));
      endTimeDate.setSeconds(0);
      
      return currentDate > endTimeDate;
    }
    
    const period = schoolSetup.periods.find(p => p.id === periodId);
    if (!period) return false;
    
    const todaySchedule = period.schedules.find(s => s.dayOfWeek === todayDayCode);
    if (!todaySchedule) return false;
    
    const [hourStr, minuteStr] = todaySchedule.endTime.split(':');
    const [minutes, meridian] = minuteStr.split(' ');
    
    let hour = parseInt(hourStr);
    if (meridian === 'PM' && hour < 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    
    const endTimeDate = new Date();
    endTimeDate.setHours(hour);
    endTimeDate.setMinutes(parseInt(minutes));
    endTimeDate.setSeconds(0);
    
    return currentDate > endTimeDate;
  };
  
  const updateReminder = (id: string, reminderData: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, ...reminderData } : reminder
      )
    );
    
    if (isOnline && user) {
      FirebaseService.updateReminder(id, reminderData)
        .catch(error => console.error("Error updating reminder in Firebase:", error));
    }
  };
  
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    
    if (isOnline && user) {
      FirebaseService.deleteReminder(id)
        .catch(error => console.error("Error deleting reminder from Firebase:", error));
    }
  };
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    if (!setup.notificationPreferences) {
      setup.notificationPreferences = schoolSetup?.notificationPreferences || getDefaultNotificationPreferences();
    }
    
    setSchoolSetup(setup);
    
    if (isOnline && user) {
      FirebaseService.saveSchoolSetup(user.id, setup)
        .catch(error => console.error("Error saving school setup to Firebase:", error));
    }
  };
  
  const toggleReminderComplete = (id: string) => {
    setReminders(prev => {
      const updatedReminders = prev.map(reminder => {
        if (reminder.id === id) {
          const completed = !reminder.completed;
          
          if (isOnline && user) {
            FirebaseService.updateReminder(id, { completed })
              .catch(error => console.error("Error updating reminder in Firebase:", error));
          }
          
          return { ...reminder, completed, isPastDue: completed ? false : reminder.isPastDue };
        }
        return reminder;
      });
      return updatedReminders;
    });
  };

  const bulkCompleteReminders = (ids: string[]) => {
    setReminders(prev => {
      const updatedReminders = prev.map(reminder => {
        if (ids.includes(reminder.id!)) {
          if (isOnline && user) {
            FirebaseService.updateReminder(reminder.id!, { completed: true })
              .catch(error => console.error("Error updating reminder in Firebase:", error));
          }
          
          return { ...reminder, completed: true, isPastDue: false };
        }
        return reminder;
      });
      return updatedReminders;
    });
  };
  
  const filteredReminders = (filters: {
    category?: string;
    priority?: ReminderPriority;
    type?: ReminderType;
    completed?: boolean;
    includePastDue?: boolean;
  }) => {
    return reminders.filter(reminder => {
      if (filters.category && reminder.category !== filters.category) {
        return false;
      }
      if (filters.priority && reminder.priority !== filters.priority) {
        return false;
      }
      if (filters.type && reminder.type !== filters.type) {
        return false;
      }
      if (filters.completed !== undefined && reminder.completed !== filters.completed) {
        return false;
      }
      if (filters.includePastDue === false && reminder.isPastDue) {
        return false;
      }
      return true;
    });
  };

  const updateNotificationPreferences = (preferences: NotificationPreferences) => {
    if (!schoolSetup) return;
    
    const updatedSchoolSetup = {
      ...schoolSetup,
      notificationPreferences: preferences
    };
    
    saveSchoolSetup(updatedSchoolSetup);
    
    if (preferences.email.enabled) {
      console.log(`Test email notification would be sent to ${preferences.email.address}`);
    }
  };

  const sendReminderNotification = (reminder: Reminder) => {
    if (!schoolSetup?.notificationPreferences) return;
    
    const { notificationPreferences } = schoolSetup;
    const shouldSendEmail = notificationPreferences.email.enabled && 
      getPriorityValue(reminder.priority) >= getPriorityValue(notificationPreferences.email.minPriority);
    
    const shouldSendPush = notificationPreferences.push.enabled && 
      getPriorityValue(reminder.priority) >= getPriorityValue(notificationPreferences.push.minPriority);
    
    const shouldSendText = notificationPreferences.text.enabled && 
      getPriorityValue(reminder.priority) >= getPriorityValue(notificationPreferences.text.minPriority);
    
    if (shouldSendEmail) {
      console.log(`Email notification for "${reminder.title}" would be sent to ${notificationPreferences.email.address}`);
    }
    
    if (shouldSendPush) {
      console.log(`Push notification for "${reminder.title}" would be sent`);
    }
    
    if (shouldSendText && notificationPreferences.text.phoneNumber) {
      console.log(`Text notification for "${reminder.title}" would be sent to ${notificationPreferences.text.phoneNumber}`);
    }
  };

  const getPriorityValue = (priority: ReminderPriority): number => {
    switch (priority) {
      case "Low": return 1;
      case "Medium": return 2;
      case "High": return 3;
      default: return 2;
    }
  };
  
  const fetchReminders = () => {
    if (user && isAuthenticated) {
      loadDataFromFirebase();
    }
  };
  
  const todayDayCode = getTodayDayCode();
  const todaysReminders = reminders.filter((reminder) => 
    reminder.days.includes(todayDayCode) &&
    (!schoolSetup?.termId || reminder.termId === schoolSetup.termId)
  );
  
  const pastDueReminders = reminders.filter((reminder) => 
    reminder.isPastDue === true && !reminder.completed
  );
  
  const completedTasks = todaysReminders.filter(r => r.completed).length;
  const totalTasks = todaysReminders.length;
  
  return (
    <ReminderContext.Provider
      value={{
        reminders,
        schoolSetup,
        createReminder,
        updateReminder,
        deleteReminder,
        saveSchoolSetup,
        todaysReminders,
        pastDueReminders,
        toggleReminderComplete,
        filteredReminders,
        bulkCompleteReminders,
        updateNotificationPreferences,
        completedTasks,
        totalTasks,
        syncWithCloud,
        isOnline,
        fetchReminders
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
