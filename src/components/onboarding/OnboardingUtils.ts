
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

export type TermType = "quarter" | "semester" | "year";
