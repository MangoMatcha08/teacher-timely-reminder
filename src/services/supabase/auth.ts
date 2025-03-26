
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { handleSupabaseError } from "./utils";
import { SchoolSetup } from "@/context/ReminderContext";
import { saveSchoolSetup } from "./schoolSetup";
import { AppError, ErrorType } from "@/utils/errorHandling";
import { ReminderType, ReminderTiming, DayOfWeek, RecurrencePattern, ReminderPriority } from "@/context/ReminderContext";

/**
 * Register a new user with email and password
 */
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

/**
 * Log in with email and password
 */
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

/**
 * Sign in with Google OAuth
 */
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

// For backward compatibility
export const loginWithGoogle = signInWithGoogle;

/**
 * Simulated test account login for demo purposes
 */
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
    
    // Create default test data
    setTimeout(() => {
      if (newUserData.user) {
        createDefaultDataForTestUser(newUserData.user.id)
          .catch(e => console.error("Error creating test data:", e));
      }
    }, 1000);
    
    return newUserData.user;
  } catch (error) {
    console.error("Error creating test account:", error);
    throw {
      type: ErrorType.AUTHENTICATION,
      message: "Failed to create test account. Please try again."
    } as AppError;
  }
};

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Helper function to create default data for test users
 */
export async function createDefaultDataForTestUser(userId: string): Promise<void> {
  // Import locally to avoid circular dependencies
  const { createDefaultPeriods, createDefaultTerm, createDefaultSchoolHours } = await import("./defaultData");
  const { saveReminder } = await import("./reminders");
  
  try {
    const defaultPeriods = createDefaultPeriods();
    const defaultTerm = createDefaultTerm();
    const schoolHours = createDefaultSchoolHours();

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
    const sampleReminders = [
      {
        id: "reminder-1",
        title: "Collect Math Homework",
        notes: "Collect homework from Period 1",
        category: "Materials/Set up",
        priority: "Medium" as ReminderPriority,
        completed: false,
        periodId: "period-1",
        type: "Prepare Materials" as ReminderType,
        timing: "During Period" as ReminderTiming,
        days: ["M", "W", "F"] as DayOfWeek[],
        recurrence: "Weekly" as RecurrencePattern,
        termId: defaultTerm.id,
        createdAt: new Date(),
        dueDate: undefined
      },
      {
        id: "reminder-2",
        title: "Science Project Due",
        notes: "Final project presentations",
        category: "Instruction",
        priority: "High" as ReminderPriority,
        completed: false,
        periodId: "period-3",
        type: "Grade" as ReminderType,
        timing: "End of Period" as ReminderTiming,
        days: ["T"] as DayOfWeek[],
        recurrence: "Once" as RecurrencePattern,
        termId: defaultTerm.id,
        createdAt: new Date(),
        dueDate: undefined
      },
      {
        id: "reminder-3",
        title: "Parent Conference",
        notes: "Meeting with Alex's parents",
        category: "Student support",
        priority: "High" as ReminderPriority,
        completed: false,
        periodId: "period-4",
        type: "Call Home" as ReminderType,
        timing: "After School" as ReminderTiming,
        days: ["Th"] as DayOfWeek[],
        recurrence: "Once" as RecurrencePattern,
        termId: defaultTerm.id,
        createdAt: new Date(),
        dueDate: undefined
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
