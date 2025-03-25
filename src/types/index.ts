
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
  startTime?: string;
  endTime?: string;
  subject?: string;
  location?: string;
  schedules: PeriodSchedule[];
  schedule?: PeriodSchedule[];
  isPrepPeriod?: boolean;
}

export interface PeriodSchedule {
  dayOfWeek: DayOfWeek;
  dayCode?: string;
  enabled?: boolean;
  startTime: string;
  endTime: string;
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
  createdAt: string | Date;
  updatedAt: string | Date;
  days?: DayOfWeek[];
  notes?: string;
  termId?: string;
  isPastDue?: boolean;
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
  Grade = 'Grade',
  _none = '_none'
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
