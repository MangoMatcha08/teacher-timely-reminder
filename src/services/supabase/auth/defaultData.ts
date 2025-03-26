
import { SchoolSetup } from "@/context/ReminderContext";
import { saveSchoolSetup } from "../schoolSetup";
import { 
  ReminderType, 
  ReminderTiming, 
  DayOfWeek, 
  RecurrencePattern, 
  ReminderPriority 
} from "@/context/ReminderContext";

/**
 * Helper function to create default data for test users
 */
export async function createDefaultDataForTestUser(userId: string): Promise<void> {
  // Import locally to avoid circular dependencies
  const { createDefaultPeriods, createDefaultTerm, createDefaultSchoolHours } = await import("../defaultData");
  const { saveReminder } = await import("../reminders");
  
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
