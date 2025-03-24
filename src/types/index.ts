
export interface SchoolSetup {
  id?: string;
  userId: string;
  schoolName: string;
  schoolYear: string;
  terms: Term[];
  periods: Period[];
  days: DayOfWeek[];
  categories: string[];
  notificationPreferences?: NotificationPreferences;
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  subject?: string;
  location?: string;
  schedule?: PeriodSchedule[];
}

export interface PeriodSchedule {
  dayCode: string; // e.g., 'M', 'T', 'W', etc.
  enabled: boolean;
}

export enum DayOfWeek {
  Monday = 'M',
  Tuesday = 'T',
  Wednesday = 'W',
  Thursday = 'Th',
  Friday = 'F',
  Saturday = 'Sa',
  Sunday = 'Su'
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  periodId: string;
  dueDate?: string;
  timing: ReminderTiming;
  type: ReminderType;
  priority: ReminderPriority;
  category?: string;
  completed: boolean;
  recurrence?: RecurrencePattern;
  recurringDays?: DayOfWeek[];
  createdAt: string;
  updatedAt: string;
}

export enum ReminderTiming {
  BeforeClass = 'before-class',
  DuringClass = 'during-class',
  AfterClass = 'after-class',
  SpecificTime = 'specific-time'
}

export enum ReminderType {
  Task = 'task',
  Assignment = 'assignment',
  Exam = 'exam',
  Meeting = 'meeting',
  Other = 'other'
}

export enum ReminderPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum RecurrencePattern {
  None = 'none',
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly'
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address: string;
    minPriority: ReminderPriority;
  };
  push: {
    enabled: boolean;
    minPriority: ReminderPriority;
  };
  text: {
    enabled: boolean;
    phoneNumber: string;
    minPriority: ReminderPriority;
  };
}
