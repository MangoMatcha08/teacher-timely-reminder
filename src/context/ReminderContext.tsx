
import React, { createContext, useContext, useState, useEffect } from "react";

export type DayOfWeek = "M" | "T" | "W" | "Th" | "F";

export type Period = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

export type ReminderType = 
  | "Pop Quiz" 
  | "Collect Work" 
  | "Hand Out" 
  | "Announcement" 
  | "Other";

export interface Reminder {
  id: string;
  title: string;
  type: ReminderType;
  days: DayOfWeek[];
  periodId: string;
  category: string; // Changed from optional to required with default empty string
  notes: string; // Changed from optional to required with default empty string
  createdAt: Date;
}

interface SchoolSetup {
  schoolDays: DayOfWeek[];
  periods: Period[];
}

interface ReminderContextType {
  reminders: Reminder[];
  schoolSetup: SchoolSetup | null;
  createReminder: (reminder: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  saveSchoolSetup: (setup: SchoolSetup) => void;
  todaysReminders: Reminder[];
}

const ReminderContext = createContext<ReminderContextType>({
  reminders: [],
  schoolSetup: null,
  createReminder: () => {},
  updateReminder: () => {},
  deleteReminder: () => {},
  saveSchoolSetup: () => {},
  todaysReminders: [],
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
      setReminders(JSON.parse(storedReminders));
    }
    
    if (storedSchoolSetup) {
      setSchoolSetup(JSON.parse(storedSchoolSetup));
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
  
  const createReminder = (reminderData: Omit<Reminder, "id" | "createdAt">) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: `rem_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
    };
    
    setReminders((prev) => [...prev, newReminder]);
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
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};
