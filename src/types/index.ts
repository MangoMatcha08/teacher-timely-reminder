
export enum DayOfWeek {
  Monday = 'M',
  Tuesday = 'T',
  Wednesday = 'W',
  Thursday = 'Th',
  Friday = 'F',
  Saturday = 'Sa',
  Sunday = 'Su'
}

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
  termId?: string;
  schoolDays?: DayOfWeek[];
}

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  schoolYear?: string;
}

export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  subject?: string;
  location?: string;
  schedule?: PeriodSchedule[];
  schedules?: PeriodSchedule[];
  isPrepPeriod?: boolean;
}

export interface PeriodSchedule {
  dayCode: string; // e.g., 'M', 'T', 'W', etc.
  enabled: boolean;
  dayOfWeek?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  periodId: string;
  dueDate?: string;
  timing: ReminderTiming | string;
  type: ReminderType | string;
  priority: ReminderPriority | string;
  category?: string;
  completed: boolean;
  recurrence?: RecurrencePattern | string;
  recurringDays?: DayOfWeek[];
  createdAt: string | Date;
  updatedAt: string | Date;
  days?: DayOfWeek[];
  notes?: string;
  termId?: string;
}

export enum ReminderTiming {
  BeforeClass = 'before-class',
  DuringClass = 'during-class',
  AfterClass = 'after-class',
  SpecificTime = 'specific-time',
  BeforeSchool = 'Before School',
  AfterSchool = 'After School',
  DuringPeriod = 'During Period',
  StartOfPeriod = 'Start of Period',
  EndOfPeriod = 'End of Period',
  FifteenMinutesIntoPeriod = '15 Minutes Into Period'
}

export enum ReminderType {
  Task = 'task',
  Assignment = 'assignment',
  Exam = 'exam',
  Meeting = 'meeting',
  Other = 'Other',
  CallHome = 'Call Home',
  Email = 'Email',
  TalkToStudent = 'Talk to Student',
  PrepareMaterials = 'Prepare Materials',
  Grade = 'Grade'
}

export enum ReminderPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export enum RecurrencePattern {
  None = 'none',
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'bi-weekly',
  Monthly = 'monthly',
  Once = 'Once',
  SpecificDays = 'Specific Days'
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
