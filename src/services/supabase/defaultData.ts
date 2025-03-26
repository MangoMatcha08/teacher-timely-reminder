
import { DayOfWeek, Period, SchoolHours, Term } from "@/context/ReminderContext";

/**
 * Creates default periods for a new user
 */
export function createDefaultPeriods(): Period[] {
  return [
    {
      id: "period-1",
      name: "Period 1",
      schedules: [
        { dayOfWeek: "M", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "T", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "W", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "Th", startTime: "8:00 AM", endTime: "8:50 AM" },
        { dayOfWeek: "F", startTime: "8:00 AM", endTime: "8:50 AM" }
      ]
    },
    {
      id: "period-2",
      name: "Period 2",
      schedules: [
        { dayOfWeek: "M", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "T", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "W", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "Th", startTime: "9:00 AM", endTime: "9:50 AM" },
        { dayOfWeek: "F", startTime: "9:00 AM", endTime: "9:50 AM" }
      ]
    },
    {
      id: "period-3",
      name: "Period 3",
      schedules: [
        { dayOfWeek: "M", startTime: "10:00 AM", endTime: "10:50 AM" },
        { dayOfWeek: "T", startTime: "10:00 AM", endTime: "10:50 AM" },
        { dayOfWeek: "W", startTime: "10:00 AM", endTime: "10:50 AM" },
        { dayOfWeek: "Th", startTime: "10:00 AM", endTime: "10:50 AM" },
        { dayOfWeek: "F", startTime: "10:00 AM", endTime: "10:50 AM" }
      ]
    },
    {
      id: "period-4",
      name: "Period 4",
      schedules: [
        { dayOfWeek: "M", startTime: "11:00 AM", endTime: "11:50 AM" },
        { dayOfWeek: "T", startTime: "11:00 AM", endTime: "11:50 AM" },
        { dayOfWeek: "W", startTime: "11:00 AM", endTime: "11:50 AM" },
        { dayOfWeek: "Th", startTime: "11:00 AM", endTime: "11:50 AM" },
        { dayOfWeek: "F", startTime: "11:00 AM", endTime: "11:50 AM" }
      ]
    }
  ];
}

/**
 * Creates a default term for a new user
 */
export function createDefaultTerm(): Term {
  return {
    id: "term-default",
    name: "Current Term",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 120).toISOString(),
    schoolYear: "2023-2024"
  };
}

/**
 * Creates default school hours for a new user
 */
export function createDefaultSchoolHours(): SchoolHours {
  return {
    startTime: "7:45 AM",
    endTime: "3:15 PM",
    teacherArrivalTime: "7:30 AM"
  };
}

/**
 * Returns the current day of the week code
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
  const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
  return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
}
