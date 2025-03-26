
import * as React from 'react';
import { DayOfWeek, Reminder, ReminderState, SchoolSetup, Term } from './types';
import * as FirebaseService from "@/services/firebase";
import { User } from 'firebase/auth';

// Helper function to get the current day code (M, T, W, Th, F)
export const getTodayDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
};

// Function to create default term
export const createDefaultTerm = (): Term => {
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

// Function to check if a time has passed for a given period
export const isTimePassed = (
  periodId: string, 
  currentDate: Date, 
  schoolSetup: SchoolSetup | null
): boolean => {
  if (!schoolSetup) return false;
  
  const todayDayCode = getTodayDayCode();
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

// Function to load data from localStorage
export const loadFromLocalStorage = (): { 
  reminders: Reminder[], 
  schoolSetup: SchoolSetup | null 
} => {
  const storedReminders = localStorage.getItem("teacher_reminders");
  const storedSchoolSetup = localStorage.getItem("school_setup");
  let parsedReminders: Reminder[] = [];
  let parsedSchoolSetup: SchoolSetup | null = null;
  
  if (storedReminders) {
    try {
      const parsed = JSON.parse(storedReminders);
      parsedReminders = parsed.map((r: any) => ({
        ...r,
        timing: r.timing || "During Period",
        recurrence: r.recurrence || "Once",
        priority: r.priority || "Medium",
        completed: r.completed || false,
        termId: r.termId || "term_default"
      }));
    } catch (e) {
      console.error("Failed to parse reminders from localStorage", e);
    }
  }
  
  if (storedSchoolSetup) {
    try {
      const parsed = JSON.parse(storedSchoolSetup);
      const defaultTerm = createDefaultTerm();
      parsedSchoolSetup = {
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
      };
    } catch (e) {
      console.error("Failed to parse school setup from localStorage", e);
    }
  }
  
  return { reminders: parsedReminders, schoolSetup: parsedSchoolSetup };
};

// Function to save data to Firebase
export const saveToFirebase = async (
  data: ReminderState,
  user: User | null
): Promise<void> => {
  if (!user) return;
  
  try {
    for (const reminder of data.reminders) {
      await FirebaseService.saveReminder(reminder, user.uid);
    }
    
    if (data.schoolSetup) {
      await FirebaseService.saveSchoolSetup(user.uid, data.schoolSetup);
    }
  } catch (error) {
    console.error("Error saving data to Firebase:", error);
    throw error;
  }
};

// Function to load data from Firebase
export const loadFromFirebase = async (
  user: User | null
): Promise<{ reminders: Reminder[], schoolSetup: SchoolSetup | null }> => {
  if (!user) {
    return { reminders: [], schoolSetup: null };
  }
  
  try {
    const cloudReminders = await FirebaseService.getUserReminders(user.uid);
    const cloudSetup = await FirebaseService.getSchoolSetup(user.uid);
    
    return {
      reminders: cloudReminders,
      schoolSetup: cloudSetup || null
    };
  } catch (error) {
    console.error("Error loading data from Firebase:", error);
    throw error;
  }
};

// Function to get today's reminders
export const getTodaysReminders = (
  reminders: Reminder[],
  schoolSetup: SchoolSetup | null
): Reminder[] => {
  const todayDayCode = getTodayDayCode();
  
  return reminders.filter((reminder) => 
    reminder.days.includes(todayDayCode) &&
    (!schoolSetup?.termId || reminder.termId === schoolSetup.termId)
  );
};

// Function to filter reminders by various criteria
export const getFilteredReminders = (
  reminders: Reminder[],
  filters: {
    category?: string;
    priority?: string;
    type?: string;
    completed?: boolean;
  }
): Reminder[] => {
  return reminders.filter(reminder => {
    let matches = true;
    
    if (filters.category && reminder.category !== filters.category) {
      matches = false;
    }
    if (filters.priority && reminder.priority !== filters.priority) {
      matches = false;
    }
    if (filters.type && reminder.type !== filters.type) {
      matches = false;
    }
    if (filters.completed !== undefined && reminder.completed !== filters.completed) {
      matches = false;
    }
    
    return matches;
  });
};
