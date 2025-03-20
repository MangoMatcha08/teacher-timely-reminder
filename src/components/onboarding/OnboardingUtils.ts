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
export const generateProgressivePeriodTimes = (periodIndex: number) => {
  // Start with 9:00 AM for the first period
  const baseHour = 9;
  const baseMinute = 0;
  
  // Each period is 50 minutes with a 10-minute break
  const periodDuration = 50;
  const breakDuration = 10;
  
  // Calculate start time for this period
  let startHour = baseHour + Math.floor((periodIndex * (periodDuration + breakDuration)) / 60);
  let startMinute = baseMinute + ((periodIndex * (periodDuration + breakDuration)) % 60);
  
  // Adjust if minutes overflow
  if (startMinute >= 60) {
    startHour += 1;
    startMinute -= 60;
  }
  
  // Calculate end time (start time + period duration)
  let endHour = startHour + Math.floor((startMinute + periodDuration) / 60);
  let endMinute = (startMinute + periodDuration) % 60;
  
  // Format times
  const startMeridian = startHour >= 12 ? 'PM' : 'AM';
  const endMeridian = endHour >= 12 ? 'PM' : 'AM';
  
  const formattedStartHour = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
  const formattedEndHour = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
  
  const startTime = `${formattedStartHour}:${startMinute.toString().padStart(2, '0')} ${startMeridian}`;
  const endTime = `${formattedEndHour}:${endMinute.toString().padStart(2, '0')} ${endMeridian}`;
  
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
