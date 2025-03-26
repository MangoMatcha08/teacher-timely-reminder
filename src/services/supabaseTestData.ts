
import { supabase } from "@/integrations/supabase/client";
import { SchoolSetup } from "@/context/ReminderContext";
import { Reminder } from "@/context/reminder/types";

/**
 * Verify connection to Supabase
 */
export const verifySupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return false;
  }
};

/**
 * Load test data to the user's Supabase account
 */
export const loadTestDataToSupabase = async (userId: string): Promise<void> => {
  try {
    // First, create test school setup
    await createTestSchoolSetup(userId);
    
    // Then, create test reminders
    await createTestReminders(userId);
    
    console.log("Test data loaded successfully");
  } catch (error) {
    console.error("Error loading test data:", error);
    throw error;
  }
};

/**
 * Create test school setup
 */
const createTestSchoolSetup = async (userId: string): Promise<void> => {
  try {
    // Create a term object
    const term = {
      id: "term_default",
      name: "Fall Semester 2024",
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString(),
      schoolYear: "2024-2025"
    };
    
    // Create the school setup object following the SchoolSetup type
    const schoolSetup: SchoolSetup = {
      termId: term.id,
      terms: [term],
      schoolDays: ["M", "T", "W", "Th", "F"],
      periods: [
        {
          id: "period_1",
          name: "Period 1",
          schedules: [
            { dayOfWeek: "M", startTime: "08:00", endTime: "09:00" },
            { dayOfWeek: "T", startTime: "08:00", endTime: "09:00" },
            { dayOfWeek: "W", startTime: "08:00", endTime: "09:00" },
            { dayOfWeek: "Th", startTime: "08:00", endTime: "09:00" },
            { dayOfWeek: "F", startTime: "08:00", endTime: "09:00" }
          ]
        },
        {
          id: "period_2",
          name: "Period 2",
          schedules: [
            { dayOfWeek: "M", startTime: "09:15", endTime: "10:15" },
            { dayOfWeek: "T", startTime: "09:15", endTime: "10:15" },
            { dayOfWeek: "W", startTime: "09:15", endTime: "10:15" },
            { dayOfWeek: "Th", startTime: "09:15", endTime: "10:15" },
            { dayOfWeek: "F", startTime: "09:15", endTime: "10:15" }
          ]
        },
        {
          id: "period_3",
          name: "Period 3",
          schedules: [
            { dayOfWeek: "M", startTime: "10:30", endTime: "11:30" },
            { dayOfWeek: "T", startTime: "10:30", endTime: "11:30" },
            { dayOfWeek: "W", startTime: "10:30", endTime: "11:30" },
            { dayOfWeek: "Th", startTime: "10:30", endTime: "11:30" },
            { dayOfWeek: "F", startTime: "10:30", endTime: "11:30" }
          ]
        }
      ],
      schoolHours: {
        startTime: "08:00",
        endTime: "15:00",
        teacherArrivalTime: "07:30"
      },
      categories: [
        "Materials/Set up",
        "Student support",
        "School events",
        "Instruction",
        "Administrative tasks"
      ],
      iepMeetings: {
        enabled: true,
        beforeSchool: true,
        beforeSchoolTime: "07:00",
        afterSchool: true,
        afterSchoolTime: "16:00"
      }
    };
    
    // Save to Supabase
    const { saveSchoolSetup } = await import("@/services/supabase/schoolSetup");
    await saveSchoolSetup(userId, schoolSetup);
    
  } catch (error) {
    console.error("Error creating test school setup:", error);
    throw error;
  }
};

/**
 * Create test reminders
 */
const createTestReminders = async (userId: string): Promise<void> => {
  try {
    const reminders: Partial<Reminder>[] = [
      {
        title: "Prepare weekly quiz",
        notes: "Create 10 questions for Friday's assessment",
        category: "Instruction",
        priority: "High",
        type: "Planning",
        timing: "After School",
        days: ["M"],
        recurrence: "Weekly",
        periodId: "period_1",
        termId: "term_default"
      },
      {
        title: "Grade homework assignments",
        notes: "For period 2 students",
        category: "Administrative tasks",
        priority: "Medium",
        type: "Grading",
        timing: "During Period",
        days: ["W"],
        recurrence: "Weekly",
        periodId: "period_2",
        termId: "term_default"
      },
      {
        title: "Set up lab equipment",
        notes: "Chemistry demonstration for period 3",
        category: "Materials/Set up",
        priority: "Medium",
        type: "Preparation",
        timing: "Before School",
        days: ["Th"],
        recurrence: "Once",
        periodId: "period_3",
        termId: "term_default",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
      },
      {
        title: "Parent-teacher conference",
        notes: "Meet with the Johnson family about Billy's progress",
        category: "Student support",
        priority: "High",
        type: "Meeting",
        timing: "After School",
        days: ["T"],
        recurrence: "Once",
        termId: "term_default",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
      },
      {
        title: "Submit attendance records",
        notes: "Weekly attendance report due",
        category: "Administrative tasks",
        priority: "Medium",
        type: "Administrative",
        timing: "After School",
        days: ["F"],
        recurrence: "Weekly",
        termId: "term_default"
      }
    ];
    
    const { saveReminder } = await import("@/services/supabase/reminders");
    
    // Save each reminder
    for (const reminder of reminders) {
      await saveReminder({
        ...reminder,
        completed: false,
        createdAt: new Date(),
        id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      }, userId);
    }
    
  } catch (error) {
    console.error("Error creating test reminders:", error);
    throw error;
  }
};
