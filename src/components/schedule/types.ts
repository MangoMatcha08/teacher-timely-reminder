
export interface Period {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SchoolSetup {
  schoolDays: string[];
  periods: Period[];
  categories: string[];
}

export interface Reminder {
  id?: string;
  title: string;
  type: string;
  timing: string;
  days: string[];
  periodId: string;
  category?: string;
  priority: string;
  notes?: string;
  completed?: boolean;
  dueDate?: string;
}
