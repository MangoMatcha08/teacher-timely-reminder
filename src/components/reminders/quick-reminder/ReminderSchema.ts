
import { z } from "zod";
import { ReminderType, ReminderTiming, RecurrencePattern, ReminderPriority, DayOfWeek } from "@/context/ReminderContext";

// Schema for quick reminder form validation
export const quickReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Call Home", "Email", "Talk to Student", "Prepare Materials", "Grade", "Other", "_none"] as const).optional(),
  timing: z.enum(["Before School", "After School", "Before Period", "After Period", "During Period", "Start of Period", "End of Period", "15 Minutes Into Period"] as const),
  days: z.array(z.enum(["M", "T", "W", "Th", "F"] as const)).optional(),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.enum(["Once", "Daily", "Weekly", "Specific Days"] as const).optional().default("Once"),
  priority: z.enum(["Low", "Medium", "High"] as const).default("Medium"),
  schoolSetup: z.any(),
  dueDate: z.string().optional(), // ISO date string for due date
  termId: z.string().optional(), // Term identifier
});

export type QuickReminderFormData = z.infer<typeof quickReminderSchema>;

export const reminderSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Call Home", "Email", "Talk to Student", "Prepare Materials", "Grade", "Other", "_none"] as const),
  timing: z.enum(["Before School", "After School", "Before Period", "After Period", "During Period", "Start of Period", "End of Period", "15 Minutes Into Period"] as const),
  days: z.array(z.enum(["M", "T", "W", "Th", "F"] as const)).min(1, "Select at least one day"),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.enum(["Once", "Daily", "Weekly", "Specific Days"] as const),
  priority: z.enum(["Low", "Medium", "High"] as const),
  completed: z.boolean().optional().default(false),
  createdAt: z.date().optional(),
  termId: z.string().optional(), // Term identifier
  dueDate: z.string().optional(), // ISO date string
  isPastDue: z.boolean().optional().default(false),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
