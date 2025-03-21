// This file now uses Supabase, but keeping the filename for compatibility
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Reminder, SchoolSetup, PeriodSchedule, Period, DayOfWeek, ReminderType, ReminderTiming, RecurrencePattern, ReminderPriority } from '@/context/ReminderContext';
import { toast } from 'sonner';

// Type definition for Supabase tables JSON conversions
type Json = 
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Helper function to handle network errors
const handleNetworkError = (error: any, operation: string) => {
  console.error(`Network error during ${operation}:`, error);
  
  // Check if it's a network error
  if (error.message && error.message.includes('Failed to fetch')) {
    // Use mock data or fallback data in development environment
    if (process.env.NODE_ENV === 'development') {
      toast.error(`Network error: Using local data`, {
        description: "Can't connect to the database. Using local data instead.",
      });
      return true; // Indicate this is a network error
    } else {
      toast.error(`Network error: Please check your connection`, {
        description: "Unable to connect to the server. Please try again later.",
      });
      return true; // Indicate this is a network error
    }
  }
  return false; // Not a network error
};

// Helper function to convert Reminder types for Supabase
const sanitizeReminderForStorage = (reminder: Reminder): any => {
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
const parseReminderFromStorage = (data: any): Reminder => {
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

// Create some mock reminders for when network is down
const getMockReminders = (): Reminder[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return [
    {
      id: 'mock-1',
      title: 'Collect homework assignments',
      notes: 'Math homework from yesterday',
      category: 'Instruction',
      priority: 'High',
      completed: false,
      periodId: 'period-1',
      type: 'Task',
      timing: 'During Period',
      days: ['M', 'W', 'F'],
      recurrence: 'Weekly',
      termId: 'term_default',
      dueDate: today.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    },
    {
      id: 'mock-2',
      title: 'Grade quizzes',
      notes: 'Science quizzes from Monday',
      category: 'Grading',
      priority: 'Medium',
      completed: false,
      periodId: 'period-2',
      type: 'Task',
      timing: 'After School',
      days: ['T', 'Th'],
      recurrence: 'Weekly',
      termId: 'term_default',
      dueDate: tomorrow.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    },
    {
      id: 'mock-3',
      title: 'Faculty meeting',
      notes: 'Discuss curriculum changes',
      category: 'Meeting',
      priority: 'Low',
      completed: true,
      periodId: 'period-3',
      type: 'Meeting',
      timing: 'After School',
      days: ['W'],
      recurrence: 'Monthly',
      termId: 'term_default',
      dueDate: today.toISOString(),
      createdAt: new Date(),
      isPastDue: false
    }
  ];
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

// Helper function to convert SchoolSetup for Supabase
const sanitizeSchoolSetupForStorage = (setup: SchoolSetup): Json => {
  // Convert the SchoolSetup to a plain object to ensure it's compatible with Json type
  return JSON.parse(JSON.stringify(setup)) as Json;
};

// Function to get school setup with network error handling
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
      
      if (handleNetworkError(error, 'fetching school setup')) {
        // Return mock data in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log("Using mock school setup due to network error");
          return getMockSchoolSetup();
        }
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
    if (handleNetworkError(error, 'processing school setup')) {
      // Return mock data in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock school setup due to network error");
        return getMockSchoolSetup();
      }
    }
    console.error("Error in getSchoolSetup:", error);
    return null;
  }
};

// Create mock school setup for network failures
const getMockSchoolSetup = (): SchoolSetup => {
  return {
    schoolDays: ["M", "T", "W", "Th", "F"],
    schoolHours: {
      startTime: "8:00 AM",
      endTime: "3:00 PM"
    },
    categories: [
      "Instruction",
      "Grading",
      "Meeting",
      "Communication",
      "Administration"
    ],
    periods: [
      {
        id: "period-1",
        name: "1st Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "8:00 AM",
            endTime: "8:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "T",
            startTime: "8:00 AM",
            endTime: "8:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "W",
            startTime: "8:00 AM",
            endTime: "8:30 AM",
            isCustom: true
          },
          {
            dayOfWeek: "Th",
            startTime: "8:00 AM",
            endTime: "8:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "F",
            startTime: "8:00 AM",
            endTime: "8:50 AM",
            isCustom: false
          }
        ],
        isPrepPeriod: false
      },
      {
        id: "period-2",
        name: "2nd Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "9:00 AM",
            endTime: "9:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "T",
            startTime: "9:00 AM",
            endTime: "9:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "W",
            startTime: "8:35 AM",
            endTime: "9:05 AM",
            isCustom: true
          },
          {
            dayOfWeek: "Th",
            startTime: "9:00 AM",
            endTime: "9:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "F",
            startTime: "9:00 AM",
            endTime: "9:50 AM",
            isCustom: false
          }
        ],
        isPrepPeriod: true
      },
      {
        id: "period-3",
        name: "3rd Period",
        schedules: [
          {
            dayOfWeek: "M",
            startTime: "10:00 AM",
            endTime: "10:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "T",
            startTime: "10:00 AM",
            endTime: "10:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "W",
            startTime: "9:10 AM",
            endTime: "9:40 AM",
            isCustom: true
          },
          {
            dayOfWeek: "Th",
            startTime: "10:00 AM",
            endTime: "10:50 AM",
            isCustom: false
          },
          {
            dayOfWeek: "F",
            startTime: "10:00 AM",
            endTime: "10:50 AM",
            isCustom: false
          }
        ],
        isPrepPeriod: false
      }
    ]
  };
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
      // Insert new with a generated UUID
      const { error } = await supabase
        .from('school_setup')
        .insert({
          id: crypto.randomUUID(),
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
