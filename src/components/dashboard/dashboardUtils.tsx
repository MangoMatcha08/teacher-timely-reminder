
import { DayOfWeek } from '@/types';

// Create a utility function for getting user display name
export const getUserDisplayName = (user: any): string => {
  // For Supabase users, get name from metadata
  if (user && user.user_metadata) {
    return user.user_metadata.name || user.user_metadata.full_name || user.email || 'Teacher';
  }
  // Fallback to email or default
  return user?.email || 'Teacher';
}

// Helper to get current day code
export const getCurrentDayCode = (): DayOfWeek => {
  const days: DayOfWeek[] = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : DayOfWeek.Monday; // Default to Monday if weekend
};

// Helper to organize reminders by period
export const groupRemindersByPeriod = (periods: any[], reminders: any[], todayCode: DayOfWeek) => {
  const periodsToday = periods
    .filter(period => period.schedules.some((s: any) => s.dayOfWeek === todayCode))
    .sort((a, b) => {
      const aSchedule = a.schedules.find((s: any) => s.dayOfWeek === todayCode);
      const bSchedule = b.schedules.find((s: any) => s.dayOfWeek === todayCode);
      
      if (!aSchedule || !bSchedule) return 0;
      
      // Simple comparison assuming format like "9:00 AM"
      return aSchedule.startTime.localeCompare(bSchedule.startTime);
    }) || [];
  
  // Get reminders for each period
  return periodsToday.map(period => {
    return {
      period,
      reminders: reminders.filter((r: any) => 
        r.periodId === period.id && 
        r.days.includes(todayCode)
      )
    };
  });
};
