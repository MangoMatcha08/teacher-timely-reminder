
import { supabase } from '@/integrations/supabase/client';
import { Reminder, ReminderPriority, ReminderType, ReminderTiming, DayOfWeek, RecurrencePattern } from '@/types';
import { handleNetworkError } from './utils/serviceUtils';
import { getMockReminders } from './mocks/mockData';

// Helper function to convert Reminder types for Supabase
export const sanitizeReminderForStorage = (reminder: Reminder): any => {
  return {
    category: reminder.category || "",
    completed: reminder.completed || false,
    days: reminder.days || [],
    due_date: reminder.dueDate || new Date().toISOString(),
    notes: reminder.notes || "",
    period_id: reminder.periodId || "",
    priority: reminder.priority,
    recurrence: reminder.recurrence || "Once",
    term_id: reminder.termId || "term_default",
    timing: reminder.timing || "During Period",
    title: reminder.title,
    type: reminder.type || "_none",
  };
};

// Helper function to parse reminders from Supabase
export const parseReminderFromStorage = (data: any): Reminder => {
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    category: data.category,
    priority: data.priority as ReminderPriority,
    completed: data.completed,
    periodId: data.period_id,
    type: data.type as ReminderType,
    timing: data.timing as ReminderTiming,
    days: data.days as DayOfWeek[],
    recurrence: data.recurrence as RecurrencePattern,
    termId: data.term_id,
    dueDate: data.due_date,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.created_at),
    userId: data.user_id,
    isPastDue: false // we'll calculate this elsewhere
  };
};

// Function to get user's reminders
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      // Check for network error and use fallback data if appropriate
      if (handleNetworkError(error, 'fetching reminders')) {
        // Return mock data in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock reminder data due to network error");
          return getMockReminders();
        }
      }
      console.error("Error fetching reminders:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const reminders = data.map(item => {
      return parseReminderFromStorage(item);
    }).filter(Boolean) as Reminder[];
    
    return reminders;
  } catch (error) {
    if (handleNetworkError(error, 'processing reminders')) {
      // Return mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock reminder data due to network error");
        return getMockReminders();
      }
    }
    console.error("Error in getUserReminders:", error);
    return [];
  }
};

// Function to save a reminder
export const saveReminder = async (reminder: Reminder, userId: string): Promise<void> => {
  try {
    const sanitizedReminder = sanitizeReminderForStorage(reminder);
    
    const { error } = await supabase
      .from('reminders')
      .upsert({
        id: reminder.id,
        user_id: userId,
        ...sanitizedReminder
      });
    
    if (error) {
      if (handleNetworkError(error, 'saving reminder')) {
        // For network errors in development, just pretend it worked
        if (process.env.NODE_ENV === 'development') {
          console.log("Pretending to save reminder due to network error");
          return;
        }
      }
      console.error("Error saving reminder:", error);
      throw error;
    }
  } catch (error) {
    if (handleNetworkError(error, 'processing save reminder')) {
      // For network errors in development, just pretend it worked
      if (process.env.NODE_ENV === 'development') {
        console.log("Pretending to save reminder due to network error");
        return;
      }
    }
    console.error("Error in saveReminder:", error);
    throw error;
  }
};

// Function to update a reminder
export const updateReminder = async (
  id: string, 
  reminderData: Partial<Reminder>,
  userId: string
): Promise<void> => {
  try {
    // Convert the partial reminder data to Supabase column format
    const updateData: any = {};
    
    if ('title' in reminderData) updateData.title = reminderData.title;
    if ('notes' in reminderData) updateData.notes = reminderData.notes;
    if ('category' in reminderData) updateData.category = reminderData.category;
    if ('priority' in reminderData) updateData.priority = reminderData.priority;
    if ('completed' in reminderData) updateData.completed = reminderData.completed;
    if ('periodId' in reminderData) updateData.period_id = reminderData.periodId;
    if ('type' in reminderData) updateData.type = reminderData.type;
    if ('timing' in reminderData) updateData.timing = reminderData.timing;
    if ('days' in reminderData) updateData.days = reminderData.days;
    if ('recurrence' in reminderData) updateData.recurrence = reminderData.recurrence;
    if ('termId' in reminderData) updateData.term_id = reminderData.termId;
    if ('dueDate' in reminderData) updateData.due_date = reminderData.dueDate;
    
    // Update in Supabase
    const { error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error updating reminder:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateReminder:", error);
    throw error;
  }
};

// Function to delete a reminder
export const deleteReminder = async (id: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error deleting reminder:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteReminder:", error);
    throw error;
  }
};
