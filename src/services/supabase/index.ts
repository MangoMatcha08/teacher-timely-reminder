
// Re-export all functions from the individual files
export * from './auth';
export * from './reminders';
export * from './schoolSetup';
export * from './utils';
export * from './defaultData';

// Note: The getCurrentDayOfWeek function is exported from both reminders/utils.ts and reminders/index.ts,
// but we're only re-exporting from reminders/index.ts to avoid ambiguity
