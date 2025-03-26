
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { Reminder, SchoolSetup, ReminderType, ReminderTiming, Period, SchoolHours, Term } from "@/context/ReminderContext";
import { ErrorType, AppError } from "@/utils/errorHandling";

// Authentication functions
export const register = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("User registration failed");
    
    console.log("Registration successful:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Register error:", error);
    throw handleSupabaseError(error);
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("Login failed");
    
    console.log("Login successful:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw handleSupabaseError(error);
  }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    // Note: this function will redirect the browser, so we won't 
    // actually reach this return statement in most cases
    return null;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw handleSupabaseError(error);
  }
};

// Simulated test account login for demo purposes
export const loginWithTestAccount = async (): Promise<User> => {
  try {
    // Try to use a consistent test email for easy identification
    const testEmail = "test@teacherreminder.app";
    const testPassword = "test-password-" + Date.now().toString().slice(-6);
    
    // Check if the test user already exists
    const { data: existingUserData, error: checkError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: "previous-test-password", // Try a common password
    });
    
    if (!checkError && existingUserData.user) {
      console.log("Using existing test account");
      return existingUserData.user;
    }
    
    // Create a test user if one doesn't exist or we couldn't log in
    const { data: newUserData, error: createError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: "Test Teacher",
        }
      }
    });
    
    if (createError) throw createError;
    if (!newUserData.user) throw new Error("Test account creation failed");
    
    console.log("Test account created:", newUserData.user.id);
    
    // Create default school setup and reminders
    await createDefaultDataForTestUser(newUserData.user.id);
    
    return newUserData.user;
  } catch (error) {
    console.error("Error creating test account:", error);
    throw {
      type: ErrorType.AUTHENTICATION,
      message: "Failed to create test account. Please try again."
    } as AppError;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw handleSupabaseError(error);
  }
};

// Reminders functions
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
      days: reminder.days,
      recurrence: reminder.recurrence,
      term_id: reminder.termId,
      due_date: reminder.dueDate
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw handleSupabaseError(error);
  }
};

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
    if (reminderData.days !== undefined) dbReminderData.days = reminderData.days;
    if (reminderData.recurrence !== undefined) dbReminderData.recurrence = reminderData.recurrence;
    if (reminderData.termId !== undefined) dbReminderData.term_id = reminderData.termId;
    if (reminderData.dueDate !== undefined) dbReminderData.due_date = reminderData.dueDate;
    
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
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      category: item.category,
      priority: item.priority,
      completed: item.completed,
      periodId: item.period_id,
      type: item.type as ReminderType,
      timing: item.timing as ReminderTiming,
      days: item.days,
      recurrence: item.recurrence,
      termId: item.term_id,
      dueDate: item.due_date,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error("Error getting reminders:", error);
    throw handleSupabaseError(error);
  }
};

// School setup functions
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup): Promise<void> => {
  try {
    // Check if we're using a test account - maintain compatibility
    if (userId.startsWith("test-user-")) {
      localStorage.setItem(`schoolSetup_${userId}`, JSON.stringify(setup));
      return;
    }
    
    // Supabase storage for regular accounts
    // Check if setup already exists for this user
    const { data: existingSetup, error: checkError } = await supabase
      .from('school_setup')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingSetup) {
      // Update existing setup
      const { error } = await supabase
        .from('school_setup')
        .update({ data: setup })
        .eq('id', existingSetup.id);
        
      if (error) throw error;
    } else {
      // Insert new setup
      const { error } = await supabase
        .from('school_setup')
        .insert({ user_id: userId, data: setup });
        
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving school setup:", error);
    throw handleSupabaseError(error);
  }
};

export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    // Check if we're using a test account - maintain compatibility
    if (userId.startsWith("test-user-")) {
      const setupStr = localStorage.getItem(`schoolSetup_${userId}`);
      return setupStr ? JSON.parse(setupStr) : null;
    }
    
    // Supabase fetching for regular accounts
    const { data, error } = await supabase
      .from('school_setup')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? data.data as SchoolSetup : null;
  } catch (error) {
    console.error("Error getting school setup:", error);
    throw handleSupabaseError(error);
  }
};

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): AppError {
  console.error("Supabase error:", error);
  
  // Map Supabase error codes to our application error types
  if (error?.code) {
    // Auth errors
    if (error.code === "auth/email-already-in-use" || error.message?.includes("already registered")) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "This email is already registered. Please sign in instead.",
        code: error.code,
        originalError: error
      };
    }
    
    if (error.code === "invalid_credentials" || error.message?.includes("Invalid login credentials")) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "Invalid email or password. Please try again.",
        code: error.code,
        originalError: error
      };
    }
    
    // Database errors
    if (error.code.includes("PGRST") || error.code === "42P01") {
      return {
        type: ErrorType.DATABASE,
        message: "Database error. Please try again later.",
        code: error.code,
        originalError: error
      };
    }
  }
  
  // Handle network errors
  if (error instanceof Error && error.message.includes("network")) {
    return {
      type: ErrorType.NETWORK,
      message: "Network error. Please check your internet connection.",
      originalError: error
    };
  }
  
  // Default error handling
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || "An unexpected error occurred. Please try again.",
    originalError: error
  };
}

// Helper function to create default data for test users
async function createDefaultDataForTestUser(userId: string): Promise<void> {
  try {
    // Create default periods
    const defaultPeriods: Period[] = [
      {
        id: "period-1",
        name: "Period 1",
        schedules: [
          { dayOfWeek: "M", startTime: "8:00 AM", endTime: "8:50 AM" },
          { dayOfWeek: "T", startTime: "8:00 AM", endTime: "8:50 AM" },
          { dayOfWeek: "W", startTime: "8:00 AM", endTime: "8:50 AM" },
          { dayOfWeek: "Th", startTime: "8:00 AM", endTime: "8:50 AM" },
          { dayOfWeek: "F", startTime: "8:00 AM", endTime: "8:50 AM" }
        ]
      },
      {
        id: "period-2",
        name: "Period 2",
        schedules: [
          { dayOfWeek: "M", startTime: "9:00 AM", endTime: "9:50 AM" },
          { dayOfWeek: "T", startTime: "9:00 AM", endTime: "9:50 AM" },
          { dayOfWeek: "W", startTime: "9:00 AM", endTime: "9:50 AM" },
          { dayOfWeek: "Th", startTime: "9:00 AM", endTime: "9:50 AM" },
          { dayOfWeek: "F", startTime: "9:00 AM", endTime: "9:50 AM" }
        ]
      },
      {
        id: "period-3",
        name: "Period 3",
        schedules: [
          { dayOfWeek: "M", startTime: "10:00 AM", endTime: "10:50 AM" },
          { dayOfWeek: "T", startTime: "10:00 AM", endTime: "10:50 AM" },
          { dayOfWeek: "W", startTime: "10:00 AM", endTime: "10:50 AM" },
          { dayOfWeek: "Th", startTime: "10:00 AM", endTime: "10:50 AM" },
          { dayOfWeek: "F", startTime: "10:00 AM", endTime: "10:50 AM" }
        ]
      },
      {
        id: "period-4",
        name: "Period 4",
        schedules: [
          { dayOfWeek: "M", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "T", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "W", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "Th", startTime: "11:00 AM", endTime: "11:50 AM" },
          { dayOfWeek: "F", startTime: "11:00 AM", endTime: "11:50 AM" }
        ]
      }
    ];

    const defaultTerm: Term = {
      id: "term-default",
      name: "Current Term",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 120).toISOString(),
      schoolYear: "2023-2024"
    };

    const schoolHours: SchoolHours = {
      startTime: "7:45 AM",
      endTime: "3:15 PM",
      teacherArrivalTime: "7:30 AM"
    };

    // Create school setup
    const schoolSetup: SchoolSetup = {
      termId: defaultTerm.id,
      terms: [defaultTerm],
      schoolDays: ["M", "T", "W", "Th", "F"],
      periods: defaultPeriods,
      schoolHours: schoolHours,
      categories: ["Materials/Set up", "Student support", "School events", "Instruction", "Administrative tasks"],
      iepMeetings: {
        enabled: false
      }
    };

    // Save school setup
    await saveSchoolSetup(userId, schoolSetup);

    // Create sample reminders
    const sampleReminders: Reminder[] = [
      {
        id: "reminder-1",
        title: "Collect Math Homework",
        notes: "Collect homework from Period 1",
        category: "Materials/Set up",
        priority: "Medium",
        completed: false,
        periodId: "period-1",
        type: "Prepare Materials",
        timing: "During Period",
        days: ["M", "W", "F"],
        recurrence: "Weekly",
        termId: defaultTerm.id,
        createdAt: new Date()
      },
      {
        id: "reminder-2",
        title: "Science Project Due",
        notes: "Final project presentations",
        category: "Instruction",
        priority: "High",
        completed: false,
        periodId: "period-3",
        type: "Grade",
        timing: "End of Period",
        days: ["T"],
        recurrence: "Once",
        termId: defaultTerm.id,
        createdAt: new Date()
      },
      {
        id: "reminder-3",
        title: "Parent Conference",
        notes: "Meeting with Alex's parents",
        category: "Student support",
        priority: "High",
        completed: false,
        periodId: "period-4",
        type: "Call Home",
        timing: "After School",
        days: ["Th"],
        recurrence: "Once",
        termId: defaultTerm.id,
        createdAt: new Date()
      }
    ];

    // Save sample reminders
    for (const reminder of sampleReminders) {
      await saveReminder(reminder, userId);
    }
  } catch (error) {
    console.error("Error creating test data:", error);
  }
}
