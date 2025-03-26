
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "../utils";
import { v4 as uuidv4 } from 'uuid';

// Save a reminder to Supabase
export async function saveReminder(reminder: any, userId: string) {
  try {
    // Prepare reminder data for Supabase
    const reminderData = {
      title: reminder.title,
      notes: reminder.notes,
      category: reminder.category,
      priority: reminder.priority,
      completed: reminder.completed || false,
      period_id: reminder.periodId,
      type: reminder.type,
      timing: reminder.timing,
      days: reminder.days,
      recurrence: reminder.recurrence,
      term_id: reminder.termId,
      due_date: reminder.dueDate ? new Date(reminder.dueDate).toISOString() : null,
      user_id: userId
    };

    let result;

    // If reminder has an ID, update it, otherwise create a new one
    if (reminder.id && !reminder.id.startsWith('local-')) {
      // Update existing reminder
      const { data, error } = await supabase
        .from('reminders')
        .update(reminderData)
        .eq('id', reminder.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new reminder - don't include ID as Supabase will generate a UUID
      const { data, error } = await supabase
        .from('reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Return the result with transformed keys to match our app's format
    return mapDbReminderToAppFormat(result);
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw handleSupabaseError(error);
  }
}

// Helper function to map database reminder format to app format
function mapDbReminderToAppFormat(dbReminder: any) {
  return {
    id: dbReminder.id,
    title: dbReminder.title,
    notes: dbReminder.notes,
    category: dbReminder.category,
    priority: dbReminder.priority,
    completed: dbReminder.completed,
    periodId: dbReminder.period_id,
    type: dbReminder.type,
    timing: dbReminder.timing,
    days: dbReminder.days,
    recurrence: dbReminder.recurrence,
    termId: dbReminder.term_id,
    dueDate: dbReminder.due_date,
    createdAt: dbReminder.created_at
  };
}

// Delete a reminder from Supabase
export async function deleteReminder(reminderId: string, userId: string) {
  try {
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
}
