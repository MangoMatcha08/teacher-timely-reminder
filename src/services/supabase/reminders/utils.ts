import { DayOfWeek } from "@/context/reminder/types";

// Function to get the current day code (M, T, W, Th, F)
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayMap: Record<number, DayOfWeek> = {
    1: "M",
    2: "T", 
    3: "W",
    4: "Th",
    5: "F"
  };
  
  const dayOfWeek = new Date().getDay();
  return dayMap[dayOfWeek as keyof typeof dayMap] || "M"; // Default to Monday if invalid
}

// Other reminder utility functions can be added here
