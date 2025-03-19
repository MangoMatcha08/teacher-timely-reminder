
import React, { createContext, useContext, useState, useEffect } from "react";

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
}

export interface SchoolHours {
  startTime: string;
  endTime: string;
  teacherArrivalTime: string;
}

interface SchoolSetup {
  schoolDays: DayOfWeek[];
  periods: Period[];
  schoolHours: SchoolHours;
  categories: string[];
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
});

export const useReminders = () => useContext(ReminderContext);

// Helper function to get today's day code
const getTodayDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schoolSetup, setSchoolSetup] = useState<SchoolSetup | null>(null);
  
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
          completed: r.completed || false
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
        // Handle migration of old school setup to new format with categories
        setSchoolSetup({
          ...parsed,
          categories: parsed.categories || [
            "IEP meetings",
            "Materials/Set up",
            "Student support",
            "School events",
            "Instruction",
            "Administrative tasks"
          ]
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
      completed: false
    };
    
    setReminders((prev) => [...prev, newReminder]);
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
  };
  
  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };
  
  const saveSchoolSetup = (setup: SchoolSetup) => {
    setSchoolSetup(setup);
  };
  
  // Toggle reminder completion status
  const toggleReminderComplete = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed } 
          : reminder
      )
    );
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
    reminder.days.includes(todayDayCode)
  );
  
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
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
