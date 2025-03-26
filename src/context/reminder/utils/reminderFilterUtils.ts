
import { Reminder, SchoolSetup } from '../types';
import { getTodayDayCode } from './dateUtils';

// Function to get today's reminders
export const getTodaysReminders = (
  reminders: Reminder[],
  schoolSetup: SchoolSetup | null
): Reminder[] => {
  const todayDayCode = getTodayDayCode();
  
  return reminders.filter((reminder) => 
    reminder.days.includes(todayDayCode) &&
    (!schoolSetup?.termId || reminder.termId === schoolSetup.termId)
  );
};

// Function to filter reminders by various criteria
export const getFilteredReminders = (
  reminders: Reminder[],
  filters: {
    category?: string;
    priority?: string;
    type?: string;
    completed?: boolean;
  }
): Reminder[] => {
  return reminders.filter(reminder => {
    let matches = true;
    
    if (filters.category && reminder.category !== filters.category) {
      matches = false;
    }
    if (filters.priority && reminder.priority !== filters.priority) {
      matches = false;
    }
    if (filters.type && reminder.type !== filters.type) {
      matches = false;
    }
    if (filters.completed !== undefined && reminder.completed !== filters.completed) {
      matches = false;
    }
    
    return matches;
  });
};
