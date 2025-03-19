
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

export type ReminderType = 
  | "Call Home" 
  | "Email"
  | "Talk to Student" 
  | "Prepare Materials" 
  | "Grade" 
  | "Other";

export type ReminderTiming = 
  | "Before School"
  | "After School"
  | "During Period"
  | "Start of Period"
  | "End of Period"
  | "15 Minutes Into Period";

export type RecurrencePattern =
  | "Once"
  | "Daily" 
  | "Weekly"
  | "Specific Days";

export type ReminderPriority = "Low" | "Medium" | "High";

export interface Reminder {
  id: string;
  title: string;
  type: ReminderType;
  timing: ReminderTiming;
  days: DayOfWeek[];
  periodId: string;
  category: string;
  notes: string;
  recurrence: RecurrencePattern;
  createdAt: Date;
  priority: ReminderPriority;
  completed?: boolean;
  termId?: string; // Term identifier
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
  toggleReminderComplete: (id: string) => void;
  filteredReminders: (filters: {
    category?: string;
    priority?: ReminderPriority;
    type?: ReminderType;
    completed?: boolean;
  }) => Reminder[];
  completedTasks: number;
  totalTasks: number;
  syncWithCloud: () => Promise<void>;
  isOnline: boolean;
}

const ReminderContext = createContext<ReminderContextType>({
  reminders: [],
  schoolSetup: null,
  createReminder: () => {},
  updateReminder: () => {},
  deleteReminder: () => {},
  saveSchoolSetup: () => {},
  todaysReminders: [],
  toggleReminderComplete: () => {},
  filteredReminders: () => [],
  completedTasks: 0,
  totalTasks: 0,
  syncWithCloud: async () => {},
  isOnline: false
});

export const useReminders = () => useContext(ReminderContext);

// Helper function to get today's day code
const getTodayDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
};

// Create a default term
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
  
  // Track online status
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
  
  // Load data from Firebase when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDataFromFirebase();
    }
  }, [isAuthenticated, user]);
  
  // Initialize from localStorage
  useEffect(() => {
    const storedReminders = localStorage.getItem("teacher_reminders");
    const storedSchoolSetup = localStorage.getItem("school_setup");
    
    if (storedReminders) {
      try {
        const parsed = JSON.parse(storedReminders);
        // Handle migration of old reminders to new format
        const migratedReminders = parsed.map((r: any) => ({
          ...r,
          timing: r.timing || "During Period",
          recurrence: r.recurrence || "Once",
          priority: r.priority || "Medium",
          completed: r.completed || false,
          termId: r.termId || "term_default"
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
        // Handle migration of old school setup to new format with terms
        const defaultTerm = createDefaultTerm();
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
  
  // Persist to localStorage whenever state changes
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
  
  // Load data from Firebase
  const loadDataFromFirebase = async () => {
    if (!user) return;
    
    try {
      // Load reminders
      const cloudReminders = await FirebaseService.getUserReminders(user.uid);
      if (cloudReminders.length > 0) {
        setReminders(cloudReminders);
      }
      
      // Load school setup
      const cloudSetup = await FirebaseService.getSchoolSetup(user.uid);
      if (cloudSetup) {
        setSchoolSetup(cloudSetup);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error loading data from Firebase:", error);
      setSyncStatus('failed');
    }
  };
  
  // Sync data with Firebase
  const syncWithCloud = async () => {
    if (!user || !isOnline) return;
    
    try {
      setSyncStatus('pending');
      
      // Sync each reminder
      for (const reminder of reminders) {
        await FirebaseService.saveReminder(reminder, user.uid);
      }
      
      // Sync school setup
      if (schoolSetup) {
        await FirebaseService.saveSchoolSetup(user.uid, schoolSetup);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error syncing with Firebase:", error);
      setSyncStatus('failed');
    }
  };
  
  const createReminder = (reminderData: Omit<Reminder, "id" | "createdAt" | "completed">) => {
    // Check if time has already passed for today
    const today = new Date();
    const currentDayCode = getTodayDayCode();
    const shouldBeNextWeek = reminderData.days.includes(currentDayCode) && 
                            reminderData.timing === "During Period" && 
                            isTimePassed(reminderData.periodId, today);
    
    // If time has passed today, add it for next week
    const adjustedDays = shouldBeNextWeek 
      ? reminderData.days.filter(d => d !== currentDayCode) // Remove today
      : reminderData.days;
    
    const newReminder: Reminder = {
      ...reminderData,
      days: adjustedDays,
      id: `rem_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
      completed: false,
      termId: schoolSetup?.termId || "term_default"
    };
    
    setReminders((prev) => [...prev, newReminder]);
    
    // Save to Firebase if online
    if (isOnline && user) {
      FirebaseService.saveReminder(newReminder, user.uid)
        .catch(error => console.error("Error saving reminder to Firebase:", error));
    }
  };
  
  // Helper to check if a period's time has already passed for today
  const isTimePassed = (periodId: string, currentDate: Date): boolean => {
    if (!schoolSetup) return false;
    
    const todayDayCode = getTodayDayCode();
    const period = schoolSetup.periods.find(p => p.id === periodId);
    if (!period) return false;
    
    const todaySchedule = period.schedules.find(s => s.dayOfWeek === todayDayCode);
    if (!todaySchedule) return false;
    
    // Parse end time
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
    
    // Update in Firebase if online
    if (isOnline && user) {
      FirebaseService.updateReminder(id, reminderData)
        .catch(error => console.error("Error updating reminder in Firebase:", error));
    }
  };
  
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    
    // Delete from Firebase if online
    if (isOnline && user) {
      FirebaseService.deleteReminder(id)
        .catch(error => console.error("Error deleting reminder from Firebase:", error));
    }
  };
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    setSchoolSetup(setup);
    
    // Save to Firebase if online
    if (isOnline && user) {
      FirebaseService.saveSchoolSetup(user.uid, setup)
        .catch(error => console.error("Error saving school setup to Firebase:", error));
    }
  };
  
  // Toggle reminder completion status
  const toggleReminderComplete = (id: string) => {
    setReminders(prev => {
      const updatedReminders = prev.map(reminder => {
        if (reminder.id === id) {
          const completed = !reminder.completed;
          
          // Update in Firebase if online
          if (isOnline && user) {
            FirebaseService.updateReminder(id, { completed })
              .catch(error => console.error("Error updating reminder in Firebase:", error));
          }
          
          return { ...reminder, completed };
        }
        return reminder;
      });
      return updatedReminders;
    });
  };
  
  // Get filtered reminders based on criteria
  const filteredReminders = (filters: {
    category?: string;
    priority?: ReminderPriority;
    type?: ReminderType;
    completed?: boolean;
  }) => {
    return reminders.filter(reminder => {
      // Check each filter criterion
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
      return true;
    });
  };
  
  // Get today's reminders
  const todayDayCode = getTodayDayCode();
  const todaysReminders = reminders.filter((reminder) => 
    reminder.days.includes(todayDayCode) &&
    (!schoolSetup?.termId || reminder.termId === schoolSetup.termId)
  );
  
  // Calculate total and completed tasks
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
        toggleReminderComplete,
        filteredReminders,
        completedTasks,
        totalTasks,
        syncWithCloud,
        isOnline
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
