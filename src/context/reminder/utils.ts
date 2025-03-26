import { DayOfWeek, Reminder, ReminderState, SchoolSetup, Term } from './types';
import * as SupabaseService from "@/services/supabase";
import { User } from '@supabase/supabase-js';
import { getCurrentDayOfWeek } from "@/services/supabase/reminders";
import { getReminders } from "@/services/supabase/reminders";
import { saveReminder } from "@/services/supabase/reminders";

// Helper function to get the current day code (M, T, W, Th, F)
export const getTodayDayCode = (): DayOfWeek => {
  return getCurrentDayOfWeek();
};

// Function to create default term
export const createDefaultTerm = (): Term => {
  return SupabaseService.createDefaultTerm();
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

// Function to save data to Supabase
export const saveToFirebase = async (
  data: ReminderState,
  user: User | null
): Promise<void> => {
  if (!user) return;
  
  try {
    for (const reminder of data.reminders) {
      await saveReminder(reminder, user.id);
    }
    
    if (data.schoolSetup) {
      const { saveSchoolSetup } = await import("@/services/supabase/schoolSetup");
      await saveSchoolSetup(user.id, data.schoolSetup);
    }
  } catch (error) {
    console.error("Error saving data to Supabase:", error);
    throw error;
  }
};

// Function to load data from Supabase
export const loadFromFirebase = async (
  user: User | null
): Promise<{ reminders: Reminder[], schoolSetup: SchoolSetup | null }> => {
  if (!user) {
    return { reminders: [], schoolSetup: null };
  }
  
  try {
    const cloudReminders = await getReminders(user.id, undefined);
    
    // Convert string dates to actual Date objects and ensure correct typing
    const typedReminders: Reminder[] = cloudReminders.map(reminder => ({
      ...reminder,
      type: reminder.type as ReminderType || "_none",
      createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
      completed: reminder.completed || false
    }));
    
    const { getSchoolSetup } = await import("@/services/supabase/schoolSetup");
    const cloudSetup = await getSchoolSetup(user.id);
    
    return {
      reminders: typedReminders,
      schoolSetup: cloudSetup || null
    };
  } catch (error) {
    console.error("Error loading data from Supabase:", error);
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
