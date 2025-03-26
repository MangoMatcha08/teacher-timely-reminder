
import { User } from "firebase/auth";

export type DayOfWeek = "M" | "T" | "W" | "Th" | "F";

export type PeriodSchedule = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

export type Period = {
  id: string;
  name: string;
  schedules: PeriodSchedule[];
};

export type ReminderType = "Call Home" | "Email" | "Talk to Student" | "Prepare Materials" | "Grade" | "Other" | "_none";
export type ReminderTiming = "Before School" | "After School" | "Before Period" | "After Period" | "During Period" | "Start of Period" | "End of Period" | "15 Minutes Into Period";

export type RecurrencePattern =
  | "Once"
  | "Daily" 
  | "Weekly"
  | "Specific Days";

export type ReminderPriority = "Low" | "Medium" | "High";

export interface Reminder {
  id?: string;
  title: string;
  type?: ReminderType;
  timing: ReminderTiming;
  days: DayOfWeek[];
  periodId?: string;
  category?: string;
  notes?: string;
  recurrence: RecurrencePattern;
  createdAt?: Date;
  priority: ReminderPriority;
  completed?: boolean;
  termId?: string; // Term identifier
}

export interface SchoolHours {
  startTime: string;
  endTime: string;
  teacherArrivalTime: string;
}

export interface Term {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  schoolYear?: string; // Added school year field
}

export interface SchoolSetup {
  termId: string;
  terms: Term[];
  schoolDays: DayOfWeek[];
  periods: Period[];
  schoolHours: SchoolHours;
  categories: string[];
  iepMeetings?: {
    enabled: boolean;
    beforeSchool?: boolean;
    afterSchool?: boolean;
    beforeSchoolTime?: string; // Added time field
    afterSchoolTime?: string;  // Added time field
    specificTimes?: {
      day: DayOfWeek;
      startTime: string;
      endTime: string;
    }[];
  };
}

export interface ReminderState {
  reminders: Reminder[];
  schoolSetup: SchoolSetup | null;
  isOnline: boolean;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface ReminderActions {
  createReminder: (reminder: Omit<Reminder, "id" | "createdAt" | "completed">) => void;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  saveSchoolSetup: (setup: SchoolSetup) => void;
  toggleReminderComplete: (id: string) => void;
  syncWithCloud: () => Promise<void>;
  fetchReminders: () => void;
}

export interface ReminderSelectors {
  todaysReminders: Reminder[];
  filteredReminders: (filters: {
    category?: string;
    priority?: ReminderPriority;
    type?: ReminderType;
    completed?: boolean;
  }) => Reminder[];
  completedTasks: number;
  totalTasks: number;
}

export type ReminderContextType = ReminderState & ReminderActions & ReminderSelectors;
