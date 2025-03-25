
import { z } from "zod";
import { ReminderType, ReminderTiming, RecurrencePattern, ReminderPriority, DayOfWeek } from "@/types";

// Schema for quick reminder form validation
export const quickReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.nativeEnum(ReminderType).optional(),
  timing: z.nativeEnum(ReminderTiming),
  days: z.array(z.nativeEnum(DayOfWeek)).optional(),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.nativeEnum(RecurrencePattern).optional().default(RecurrencePattern.Once),
  priority: z.nativeEnum(ReminderPriority).default(ReminderPriority.Medium),
  schoolSetup: z.any(),
  dueDate: z.string().optional(), // ISO date string for due date
  termId: z.string().optional(), // Term identifier
});

export type QuickReminderFormData = z.infer<typeof quickReminderSchema>;

export const reminderSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.nativeEnum(ReminderType),
  timing: z.nativeEnum(ReminderTiming),
  days: z.array(z.nativeEnum(DayOfWeek)).min(1, "Select at least one day"),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.nativeEnum(RecurrencePattern),
  priority: z.nativeEnum(ReminderPriority),
  completed: z.boolean().optional().default(false),
  createdAt: z.date().optional(),
  termId: z.string().optional(), // Term identifier
  dueDate: z.string().optional(), // ISO date string
  isPastDue: z.boolean().optional().default(false),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;
