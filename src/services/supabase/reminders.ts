
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./utils";
import { Reminder, ReminderType, ReminderTiming, DayOfWeek, RecurrencePattern, ReminderPriority } from "@/context/ReminderContext";

/**
 * Save a reminder to the database
 */
export const saveReminder = async (reminder: Reminder, userId: string): Promise<void> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      // Get existing reminders from localStorage
      const existingRemindersStr = localStorage.getItem(`reminders_${userId}`);
      const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
      
      // Add the new reminder with a generated ID
      const newReminder = {
        ...reminder,
        id: reminder.id || `reminder-${Date.now()}`,
        createdAt: reminder.createdAt || new Date()
      };
      
      existingReminders.push(newReminder);
      
      // Save back to localStorage
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(existingReminders));
      return;
    }
    
    // Regular Supabase storage for non-test accounts
    const { error } = await supabase
      .from('reminders')
      .insert({
        id: reminder.id || undefined, // Let Supabase generate an ID if none is provided
        user_id: userId,
        title: reminder.title,
        notes: reminder.notes,
        category: reminder.category,
        priority: reminder.priority,
        completed: reminder.completed,
        period_id: reminder.periodId,
        type: reminder.type,
        timing: reminder.timing,
        days: reminder.days,
        recurrence: reminder.recurrence,
        term_id: reminder.termId,
        due_date: reminder.dueDate,
        created_at: reminder.createdAt || new Date()
      });
      
    if (error) throw error;
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Update a reminder in the database
 */
export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>, userId: string): Promise<void> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      // Get existing reminders from localStorage
      const existingRemindersStr = localStorage.getItem(`reminders_${userId}`);
      const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
      
      // Find and update the reminder
      const updatedReminders = existingReminders.map(reminder => 
        reminder.id === reminderId ? { ...reminder, ...reminderData } : reminder
      );
      
      // Save back to localStorage
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(updatedReminders));
      return;
    }
    
    // Convert to snake_case for Supabase
    const dataForUpdate: Record<string, any> = {};
    if (reminderData.title) dataForUpdate.title = reminderData.title;
    if (reminderData.notes !== undefined) dataForUpdate.notes = reminderData.notes;
    if (reminderData.category) dataForUpdate.category = reminderData.category;
    if (reminderData.priority) dataForUpdate.priority = reminderData.priority;
    if (reminderData.completed !== undefined) dataForUpdate.completed = reminderData.completed;
    if (reminderData.periodId) dataForUpdate.period_id = reminderData.periodId;
    if (reminderData.type) dataForUpdate.type = reminderData.type;
    if (reminderData.timing) dataForUpdate.timing = reminderData.timing;
    if (reminderData.days) dataForUpdate.days = reminderData.days;
    if (reminderData.recurrence) dataForUpdate.recurrence = reminderData.recurrence;
    if (reminderData.termId) dataForUpdate.term_id = reminderData.termId;
    if (reminderData.dueDate) dataForUpdate.due_date = reminderData.dueDate;
    
    // Update in Supabase
    const { error } = await supabase
      .from('reminders')
      .update(dataForUpdate)
      .eq('id', reminderId)
      .eq('user_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Delete a reminder from the database
 */
export const deleteReminder = async (reminderId: string, userId: string): Promise<void> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      // Get existing reminders from localStorage
      const existingRemindersStr = localStorage.getItem(`reminders_${userId}`);
      const existingReminders: Reminder[] = existingRemindersStr ? JSON.parse(existingRemindersStr) : [];
      
      // Filter out the deleted reminder
      const updatedReminders = existingReminders.filter(reminder => reminder.id !== reminderId);
      
      // Save back to localStorage
      localStorage.setItem(`reminders_${userId}`, JSON.stringify(updatedReminders));
      return;
    }
    
    // Delete from Supabase
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Get user reminders from the database
 */
export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    // Check if we're using a test account
    if (userId.startsWith("test-user-")) {
      const remindersStr = localStorage.getItem(`reminders_${userId}`);
      return remindersStr ? JSON.parse(remindersStr) : [];
    }
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Convert from snake_case to camelCase
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      category: item.category,
      priority: item.priority as ReminderPriority,
      completed: item.completed || false,
      periodId: item.period_id,
      type: item.type as ReminderType,
      timing: item.timing as ReminderTiming,
      days: item.days as DayOfWeek[],
      recurrence: item.recurrence as RecurrencePattern,
      termId: item.term_id,
      dueDate: item.due_date ? new Date(item.due_date) : undefined,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error("Error getting reminders:", error);
    throw handleSupabaseError(error);
  }
};
