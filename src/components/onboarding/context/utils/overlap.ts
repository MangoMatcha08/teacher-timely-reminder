
import { DayOfWeek, Period } from "@/context/ReminderContext";
import { doPeriodsOverlap } from "../../OnboardingUtils";

export const checkForOverlaps = (periodToCheck: Period, allPeriods: Period[], day: DayOfWeek): boolean => {
  const scheduleToCheck = periodToCheck.schedules.find(s => s.dayOfWeek === day);
  if (!scheduleToCheck) return false;
  
  for (const otherPeriod of allPeriods) {
    if (otherPeriod.id === periodToCheck.id) continue;
    
    const otherSchedule = otherPeriod.schedules.find(s => s.dayOfWeek === day);
    if (!otherSchedule) continue;
    
    if (doPeriodsOverlap(
      scheduleToCheck.startTime,
      scheduleToCheck.endTime,
      otherSchedule.startTime,
      otherSchedule.endTime
    )) {
      return true;
    }
  }
  
  return false;
};
