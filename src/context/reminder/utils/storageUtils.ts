
import { Reminder, SchoolSetup, Term } from '../types';
import * as SupabaseService from "@/services/supabase";

// Function to create default term
export const createDefaultTerm = (): Term => {
  return SupabaseService.createDefaultTerm();
};

// Function to load data from localStorage
export const loadFromLocalStorage = (): { 
  reminders: Reminder[], 
  schoolSetup: SchoolSetup | null 
} => {
  const storedReminders = localStorage.getItem("teacher_reminders");
  const storedSchoolSetup = localStorage.getItem("school_setup");
  let parsedReminders: Reminder[] = [];
  let parsedSchoolSetup: SchoolSetup | null = null;
  
  if (storedReminders) {
    try {
      const parsed = JSON.parse(storedReminders);
      parsedReminders = parsed.map((r: any) => ({
        ...r,
        timing: r.timing || "During Period",
        recurrence: r.recurrence || "Once",
        priority: r.priority || "Medium",
        completed: r.completed || false,
        termId: r.termId || "term_default"
      }));
    } catch (e) {
      console.error("Failed to parse reminders from localStorage", e);
    }
  }
  
  if (storedSchoolSetup) {
    try {
      const parsed = JSON.parse(storedSchoolSetup);
      const defaultTerm = createDefaultTerm();
      parsedSchoolSetup = {
        ...parsed,
        termId: parsed.termId || defaultTerm.id,
        terms: parsed.terms || [defaultTerm],
        categories: parsed.categories || [
          "Materials/Set up",
          "Student support",
          "School events",
          "Instruction",
          "Administrative tasks"
        ],
        iepMeetings: parsed.iepMeetings || {
          enabled: false
        }
      };
    } catch (e) {
      console.error("Failed to parse school setup from localStorage", e);
    }
  }
  
  return { reminders: parsedReminders, schoolSetup: parsedSchoolSetup };
};
