
import { Period as ContextPeriod, Reminder as ContextReminder, SchoolSetup as ContextSchoolSetup } from "@/context/ReminderContext";

// Export the types from the context directly to avoid duplication and type mismatches
export type Period = ContextPeriod;
export type Reminder = ContextReminder;
export type SchoolSetup = ContextSchoolSetup;
