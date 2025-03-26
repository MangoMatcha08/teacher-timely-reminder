
import { ReminderState, Reminder, SchoolSetup, ReminderTiming, ReminderType, DayOfWeek, RecurrencePattern, ReminderPriority } from '../types';
import { User } from '@supabase/supabase-js';
import { getReminders, saveReminder } from "@/services/supabase/reminders";

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
      timing: reminder.timing as ReminderTiming,
      days: reminder.days as DayOfWeek[],
      recurrence: reminder.recurrence as RecurrencePattern,
      priority: reminder.priority as ReminderPriority,
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
