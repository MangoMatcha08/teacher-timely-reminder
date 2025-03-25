
// This file now serves as a re-export hub to maintain backwards compatibility
// while the codebase has been refactored into smaller, more focused modules

// Re-export everything from reminderService
export {
  getUserReminders,
  saveReminder,
  updateReminder,
  deleteReminder
} from './reminderService';

// Re-export from schoolSetupService
export {
  schoolSetupService
} from './schoolSetupService';

// Note: Mock data functionality is now in './mocks/mockData.ts'
// Utility functions are now in './utils/serviceUtils.ts'
