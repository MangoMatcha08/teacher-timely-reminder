
import { supabase } from "@/integrations/supabase/client";
import { Reminder, SchoolSetup } from "@/context/ReminderContext";
import { Json } from "@/integrations/supabase/types";

// NOTE: This file is kept for backward compatibility, but now uses Supabase
// instead of Firebase. This will help minimize changes across the codebase.

// Authentication functions
export const register = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data.user;
  } catch (error: any) {
    console.error("Register error:", error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return data.user;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth'
      }
    });
    
    if (error) throw error;
    
    // Note: With OAuth, we don't get the user object directly as it's a redirect flow
    // The user will be available in the onAuthStateChange listener
    return null as any; // Keeping compatibility with the original function signature
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Simulated test account login
export const loginWithTestAccount = async () => {
  try {
    const testEmail = `test${Date.now()}@teacherreminder.app`;
    const testPassword = "test123456";
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: "Test Teacher"
        }
      }
    });
    
    if (error) throw error;
    
    // Create default data for the test user
    const userId = data.user.id;
    
    // Creating a default school setup for the test account
    const defaultPeriods = [
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

    const defaultTerm = {
      id: "term-default",
      name: "Current Term",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 120).toISOString(),
      schoolYear: "2023-2024"
    };

    const schoolHours = {
      startTime: "7:45 AM",
      endTime: "3:15 PM",
      teacherArrivalTime: "7:30 AM"
    };

    // Create and save the school setup
    const schoolSetup = {
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
    
    // Save school setup to Supabase
    const { error: setupError } = await supabase
      .from('school_setup')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        data: schoolSetup
      });
    
    if (setupError) console.error("Error creating school setup:", setupError);
    
    // Create some sample reminders
    const sampleReminders = [
      {
        id: crypto.randomUUID(),
        title: "Collect Math Homework",
        notes: "Collect homework from Period 1",
        category: "Materials/Set up",
        priority: "Medium",
        completed: false,
        period_id: "period-1",
        type: "Prepare Materials",
        timing: "During Period",
        days: ["M", "W", "F"],
        recurrence: "Weekly",
        term_id: defaultTerm.id,
        user_id: userId,
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Science Project Due",
        notes: "Final project presentations",
        category: "Instruction",
        priority: "High",
        completed: false,
        period_id: "period-3",
        type: "Grade",
        timing: "End of Period",
        days: ["T"],
        recurrence: "Once",
        term_id: defaultTerm.id,
        user_id: userId,
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Parent Conference",
        notes: "Meeting with Alex's parents",
        category: "Student support",
        priority: "High",
        completed: false,
        period_id: "period-4",
        type: "Call Home",
        timing: "After School",
        days: ["Th"],
        recurrence: "Once",
        term_id: defaultTerm.id,
        user_id: userId,
        created_at: new Date().toISOString()
      },
    ];
    
    // Insert sample reminders
    for (const reminder of sampleReminders) {
      const { error: reminderError } = await supabase
        .from('reminders')
        .insert(reminder);
      
      if (reminderError) console.error("Error creating reminder:", reminderError);
    }
    
    return data.user;
  } catch (error) {
    console.error("Error creating test account:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Reminders functions
export const saveReminder = async (reminder: Reminder, userId: string) => {
  try {
    const { error } = await supabase
      .from('reminders')
      .insert({
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
        user_id: userId,
        due_date: reminder.dueDate
      });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
};

export const updateReminder = async (reminderId: string, reminderData: Partial<Reminder>) => {
  try {
    const updateData: any = { ...reminderData };
    
    // Convert fields to snake_case as needed for Supabase
    if (reminderData.periodId !== undefined) {
      updateData.period_id = reminderData.periodId;
      delete updateData.periodId;
    }
    
    if (reminderData.termId !== undefined) {
      updateData.term_id = reminderData.termId;
      delete updateData.termId;
    }
    
    if (reminderData.dueDate !== undefined) {
      updateData.due_date = reminderData.dueDate;
      delete updateData.dueDate;
    }
    
    const { error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', reminderId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

export const deleteReminder = async (reminderId: string) => {
  try {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

export const getUserReminders = async (userId: string): Promise<Reminder[]> => {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      notes: item.notes,
      category: item.category,
      priority: item.priority as Reminder['priority'],
      completed: item.completed || false,
      periodId: item.period_id,
      type: item.type as Reminder['type'],
      timing: item.timing as Reminder['timing'],
      days: item.days as Reminder['days'],
      recurrence: item.recurrence as Reminder['recurrence'],
      termId: item.term_id,
      dueDate: item.due_date,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.error("Error getting reminders:", error);
    throw error;
  }
};

// School setup functions
export const saveSchoolSetup = async (userId: string, setup: SchoolSetup) => {
  try {
    // Check if a setup already exists
    const { data, error: fetchError } = await supabase
      .from('school_setup')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (data) {
      // Update existing setup
      const { error } = await supabase
        .from('school_setup')
        .update({ data: setup as unknown as Json })
        .eq('id', data.id);
      
      if (error) throw error;
    } else {
      // Create new setup
      const { error } = await supabase
        .from('school_setup')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          data: setup as unknown as Json
        });
      
      if (error) throw error;
    }
  } catch (error) {
    console.error("Error saving school setup:", error);
    throw error;
  }
};

export const getSchoolSetup = async (userId: string): Promise<SchoolSetup | null> => {
  try {
    const { data, error } = await supabase
      .from('school_setup')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data ? data.data as unknown as SchoolSetup : null;
  } catch (error) {
    console.error("Error getting school setup:", error);
    throw error;
  }
};
