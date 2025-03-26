
// Re-export all functions from the individual files
export * from './auth';
export * from './schoolSetup';
export * from './utils';
export * from './defaultData';

// Export reminders functionality, but avoid the duplicate getCurrentDayOfWeek
export * from './reminders/crud';
export * from './reminders/queries';
export { getCurrentDayOfWeek } from './reminders/utils';

// Note: We're directly exporting specific functions from reminders modules
// instead of re-exporting everything from reminders/index.ts
// to avoid ambiguity with getCurrentDayOfWeek
