import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./utils";
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
    return {
      id: result.id,
      title: result.title,
      notes: result.notes,
      category: result.category,
      priority: result.priority,
      completed: result.completed,
      periodId: result.period_id,
      type: result.type,
      timing: result.timing,
      days: result.days,
      recurrence: result.recurrence,
      termId: result.term_id,
      dueDate: result.due_date,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw handleSupabaseError(error);
  }
}

// Get all reminders for a user
export async function getReminders(userId: string, termId: string | undefined) {
  try {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (termId) {
      query = query.eq('term_id', termId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform keys to match our app's format
    const reminders = data.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      notes: reminder.notes,
      category: reminder.category,
      priority: reminder.priority,
      completed: reminder.completed,
      periodId: reminder.period_id,
      type: reminder.type,
      timing: reminder.timing,
      days: reminder.days,
      recurrence: reminder.recurrence,
      termId: reminder.term_id,
      dueDate: reminder.due_date,
      createdAt: reminder.created_at
    }));

    return reminders;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    throw handleSupabaseError(error);
  }
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
