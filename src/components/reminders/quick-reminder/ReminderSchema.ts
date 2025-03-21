
import { z } from "zod";

// Schema for quick reminder form validation
export const quickReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  timing: z.enum(["Before School", "After School", "During Period"] as const),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"] as const).default("Medium"),
  schoolSetup: z.any(),
});

export type QuickReminderFormData = z.infer<typeof quickReminderSchema>;
