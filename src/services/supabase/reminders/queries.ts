
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "../utils";

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

// Get reminders by specific criteria
export async function getRemindersByPeriod(userId: string, periodId: string) {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('period_id', periodId);

    if (error) throw error;

    // Transform keys to match our app's format
    return data.map(reminder => ({
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
  } catch (error) {
    console.error("Error fetching reminders by period:", error);
    throw handleSupabaseError(error);
  }
}
