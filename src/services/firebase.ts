// This file now uses Supabase, but keeping the filename for compatibility
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Reminder, SchoolSetup, PeriodSchedule, Period, DayOfWeek, ReminderType, ReminderTiming, RecurrencePattern, ReminderPriority } from '@/context/ReminderContext';

// Type definition for Supabase tables JSON conversions
type Json = 
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Helper function to convert Reminder types for Supabase
const sanitizeReminderForStorage = (reminder: Reminder): any => {
  return {
    id: reminder.id,
    title: reminder.title,
    notes: reminder.notes || "",
    category: reminder.category || "",
    priority: reminder.priority,
    completed: reminder.completed || false,
    periodId: reminder.periodId || "",
    type: reminder.type || "_none",
    timing: reminder.timing || "During Period",
    days: reminder.days || [],
    recurrence: reminder.recurrence || "Once",
    termId: reminder.termId || "term_default",
    dueDate: reminder.dueDate || new Date().toISOString(),
    createdAt: reminder.createdAt || new Date(),
    isPastDue: reminder.isPastDue || false
  };
};

// Helper function to convert SchoolSetup for Supabase
const sanitizeSchoolSetupForStorage = (setup: SchoolSetup): Json => {
  return setup as unknown as Json;
};

// Helper function to parse reminders from Supabase
const parseReminderFromStorage = (data: any): Reminder => {
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    category: data.category,
    priority: data.priority as ReminderPriority,
    completed: data.completed,
    periodId: data.periodId,
    type: data.type as ReminderType,
    timing: data.timing as ReminderTiming,
    days: data.days as DayOfWeek[],
    recurrence: data.recurrence as RecurrencePattern,
    termId: data.termId,
    dueDate: data.dueDate,
    createdAt: new Date(data.createdAt),
    isPastDue: data.isPastDue
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
      console.error("Error fetching reminders:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    const reminders = data.map(item => {
      if (typeof item.data === 'string') {
        // Handle case where data is stored as JSON string
        try {
          const parsedData = JSON.parse(item.data);
          return parseReminderFromStorage(parsedData);
        } catch (e) {
          console.error("Error parsing reminder data:", e);
          return null;
        }
      } else {
        // Handle case where data is already a JSON object
        return parseReminderFromStorage(item.data);
      }
    }).filter(Boolean) as Reminder[];
    
    return reminders;
  } catch (error) {
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
        data: sanitizedReminder
      });
    
    if (error) {
      console.error("Error saving reminder:", error);
      throw error;
    }
  } catch (error) {
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
    // First get the existing reminder
    const { data: existingData, error: fetchError } = await supabase
      .from('reminders')
      .select('data')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching existing reminder:", fetchError);
      throw fetchError;
    }
    
    // Parse the existing data
    let existingReminder: any;
    if (typeof existingData.data === 'string') {
      existingReminder = JSON.parse(existingData.data);
    } else {
      existingReminder = existingData.data;
    }
    
    // Merge with new data
    const updatedReminder = {
      ...existingReminder,
      ...reminderData
    };
    
    // Update in Supabase
    const { error } = await supabase
      .from('reminders')
      .update({
        data: sanitizeReminderForStorage(updatedReminder as Reminder)
      })
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

// Function to get school setup
export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    const { data, error } = await supabase
      .from('school_setup')
      .select('data')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, not an error
        return null;
      }
      console.error("Error fetching school setup:", error);
      throw error;
    }
    
    if (!data || !data.data) {
      return null;
    }
    
    // Parse the data if it's a string
    let setupData: any;
    if (typeof data.data === 'string') {
      try {
        setupData = JSON.parse(data.data);
      } catch (e) {
        console.error("Error parsing school setup data:", e);
        return null;
      }
    } else {
      setupData = data.data;
    }
    
    return setupData as SchoolSetup;
  } catch (error) {
    console.error("Error in getSchoolSetup:", error);
    return null;
  }
};

// Function to save school setup
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup): Promise<void> => {
  try {
    const sanitizedSetup = sanitizeSchoolSetupForStorage(setup);
    
    // Check if entry exists
    const { data, error: fetchError } = await supabase
      .from('school_setup')
      .select('id')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error("Error checking for existing setup:", fetchError);
      throw fetchError;
    }
    
    if (data && data.length > 0) {
      // Update existing
      const { error } = await supabase
        .from('school_setup')
        .update({
          data: sanitizedSetup
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating school setup:", error);
        throw error;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('school_setup')
        .insert({
          user_id: userId,
          data: sanitizedSetup
        });
      
      if (error) {
        console.error("Error inserting school setup:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in saveSchoolSetup:", error);
    throw error;
  }
};
