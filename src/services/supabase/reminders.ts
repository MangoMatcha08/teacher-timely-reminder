
import { supabase } from "@/integrations/supabase/client";
import { DayOfWeek, Reminder, RecurrencePattern, ReminderTiming, ReminderType } from "@/context/ReminderContext";
import { handleSupabaseError } from "./utils";
import { Database } from "@/integrations/supabase/types";

// Type for converting between our app types and database types
type DbReminder = Database['public']['Tables']['reminders']['Row'];

/**
 * Save a new reminder to the database
 */
export const saveReminder = async (reminder: Reminder, userId: string): Promise<void> => {
  try {
    // Check if we're using a test account - use same approach as before to maintain compatibility
    if (userId.startsWith("test-user-")) {
      const existingRemindersStr = localStorage.getItem(`reminders_${userId}`);
      const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
      
      const newReminder = {
        ...reminder,
        id: `reminder-${Date.now()}`,
        createdAt: new Date()
      };
      
      existingReminders.push(newReminder);
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(existingReminders));
      return;
    }
    
    // Convert days from DayOfWeek[] to string[]
    const daysAsStrings = reminder.days.map(day => day.toString());
    
    // Supabase storage for regular accounts
    const { error } = await supabase.from('reminders').insert({
      user_id: userId,
      title: reminder.title,
      notes: reminder.notes,
      category: reminder.category,
      priority: reminder.priority,
      completed: reminder.completed || false,
      period_id: reminder.periodId,
      type: reminder.type,
      timing: reminder.timing,
      days: daysAsStrings,
      recurrence: reminder.recurrence,
      term_id: reminder.termId,
      due_date: reminder.dueDate?.toISOString() || null
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Update an existing reminder
 */
export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>): Promise<void> => {
  try {
    // Transform the reminder data to match the database column names
    const dbReminderData: Record<string, any> = {};
    
    if (reminderData.title !== undefined) dbReminderData.title = reminderData.title;
    if (reminderData.notes !== undefined) dbReminderData.notes = reminderData.notes;
    if (reminderData.category !== undefined) dbReminderData.category = reminderData.category;
    if (reminderData.priority !== undefined) dbReminderData.priority = reminderData.priority;
    if (reminderData.completed !== undefined) dbReminderData.completed = reminderData.completed;
    if (reminderData.periodId !== undefined) dbReminderData.period_id = reminderData.periodId;
    if (reminderData.type !== undefined) dbReminderData.type = reminderData.type;
    if (reminderData.timing !== undefined) dbReminderData.timing = reminderData.timing;
    
    // Convert days if present
    if (reminderData.days !== undefined) {
      dbReminderData.days = reminderData.days.map(day => day.toString());
    }
    
    if (reminderData.recurrence !== undefined) dbReminderData.recurrence = reminderData.recurrence;
    if (reminderData.termId !== undefined) dbReminderData.term_id = reminderData.termId;
    if (reminderData.dueDate !== undefined) {
      dbReminderData.due_date = reminderData.dueDate ? new Date(reminderData.dueDate).toISOString() : null;
    }
    
    const { error } = await supabase
      .from('reminders')
      .update(dbReminderData)
      .eq('id', reminderId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (reminderId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Get all reminders for a user
 */
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    // Check if we're using a test account - maintain compatibility
    if (userId.startsWith("test-user-")) {
      const remindersStr = localStorage.getItem(`reminders_${userId}`);
      return remindersStr ? JSON.parse(remindersStr) : [];
    }
    
    // Supabase fetching for regular accounts
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Transform the data to match the expected Reminder type
    const reminders: Reminder[] = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      category: item.category,
      priority: item.priority,
      completed: item.completed,
      periodId: item.period_id,
      type: item.type as ReminderType,
      timing: item.timing as ReminderTiming,
      days: item.days as DayOfWeek[],
      recurrence: item.recurrence as RecurrencePattern,
      termId: item.term_id,
      dueDate: item.due_date ? new Date(item.due_date) : undefined,
      createdAt: new Date(item.created_at)
    }));
    
    return reminders;
  } catch (error) {
    console.error("Error getting reminders:", error);
    throw handleSupabaseError(error);
  }
};
