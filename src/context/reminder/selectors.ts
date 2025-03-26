
import { Reminder, ReminderSelectors, ReminderState } from './types';
import { getFilteredReminders, getTodaysReminders } from './utils';

export const createReminderSelectors = (state: ReminderState): ReminderSelectors => {
  const todaysReminders = getTodaysReminders(state.reminders, state.schoolSetup);
  
  const filteredReminders = (filters: {
    category?: string;
    priority?: string;
    type?: string;
    completed?: boolean;
  }) => getFilteredReminders(state.reminders, filters);
  
  const completedTasks = todaysReminders.filter(r => r.completed).length;
  
  const totalTasks = todaysReminders.length;
  
  return {
    todaysReminders,
    filteredReminders,
    completedTasks,
    totalTasks
  };
};
