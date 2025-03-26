
import { DayOfWeek, SchoolSetup } from '../types';
import { getCurrentDayOfWeek } from "@/services/supabase/reminders";

// Helper function to get the current day code (M, T, W, Th, F)
export const getTodayDayCode = (): DayOfWeek => {
  return getCurrentDayOfWeek();
};

// Function to check if a time has passed for a given period
export const isTimePassed = (
  periodId: string, 
  currentDate: Date, 
  schoolSetup: SchoolSetup | null
): boolean => {
  if (!schoolSetup) return false;
  
  const todayDayCode = getTodayDayCode();
  const period = schoolSetup.periods.find(p => p.id === periodId);
  if (!period) return false;
  
  const todaySchedule = period.schedules.find(s => s.dayOfWeek === todayDayCode);
  if (!todaySchedule) return false;
  
  const [hourStr, minuteStr] = todaySchedule.endTime.split(':');
  const [minutes, meridian] = minuteStr.split(' ');
  
  let hour = parseInt(hourStr);
  if (meridian === 'PM' && hour < 12) hour += 12;
  if (meridian === 'AM' && hour === 12) hour = 0;
  
  const endTimeDate = new Date();
  endTimeDate.setHours(hour);
  endTimeDate.setMinutes(parseInt(minutes));
  endTimeDate.setSeconds(0);
  
  return currentDate > endTimeDate;
};
