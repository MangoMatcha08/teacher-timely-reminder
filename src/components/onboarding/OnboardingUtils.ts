
import { DayOfWeek, Period, PeriodSchedule, Term } from "@/context/ReminderContext";

export const createInitialSchedule = (day: DayOfWeek, startTime = "9:00 AM", endTime = "9:50 AM"): PeriodSchedule => ({
  dayOfWeek: day,
  startTime,
  endTime,
});

export const createDefaultTerm = (schoolYear: string, termType: string, termName: string): Term => {
  const now = new Date();
  const endDate = new Date();
  
  if (termType === "quarter") {
    endDate.setMonth(now.getMonth() + 3);
  } else if (termType === "semester") {
    endDate.setMonth(now.getMonth() + 5);
  } else {
    endDate.setMonth(now.getMonth() + 10);
  }
  
  return {
    id: "term_default",
    name: termName,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    schoolYear: schoolYear
  };
};

// New utility function to generate progressive period times
export const generateProgressivePeriodTimes = (periodIndex: number): { startTime: string; endTime: string } => {
  const baseHour = 8;
  const periodHour = baseHour + Math.floor(periodIndex / 2) + Math.floor(periodIndex / 3);
  const periodMinute = periodIndex % 2 === 0 ? 0 : 30;
  
  let startHour = periodHour;
  let startMinute = periodMinute;
  let startMeridian = "AM";
  
  if (startHour >= 12) {
    startMeridian = "PM";
    if (startHour > 12) {
      startHour = startHour - 12;
    }
  }
  
  // End time is 50 minutes after start time
  let endHour = startHour;
  let endMinute = startMinute + 50;
  let endMeridian = startMeridian;
  
  if (endMinute >= 60) {
    endHour += 1;
    endMinute = endMinute - 60;
    
    if (endHour === 12 && startMeridian === "AM") {
      endMeridian = "PM";
    } else if (endHour > 12) {
      endHour = 1;
      endMeridian = "PM";
    }
  }
  
  const startTime = `${startHour}:${startMinute.toString().padStart(2, '0')} ${startMeridian}`;
  const endTime = `${endHour}:${endMinute.toString().padStart(2, '0')} ${endMeridian}`;
  
  return { startTime, endTime };
};

// Validate if two time periods overlap
export const doPeriodsOverlap = (
  startTime1: string, 
  endTime1: string, 
  startTime2: string, 
  endTime2: string
): boolean => {
  const convertTimeToMinutes = (timeStr: string): number => {
    const [time, meridian] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (meridian === 'PM' && hour < 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    
    return hour * 60 + minute;
  };
  
  const start1 = convertTimeToMinutes(startTime1);
  const end1 = convertTimeToMinutes(endTime1);
  const start2 = convertTimeToMinutes(startTime2);
  const end2 = convertTimeToMinutes(endTime2);
  
  return (start1 < end2) && (start2 < end1);
};

export type TermType = "quarter" | "semester" | "year";
