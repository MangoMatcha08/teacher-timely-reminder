
import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ReminderPriority } from "@/types";

// Helper function to render priority icons
export const getPriorityIcon = (priority: ReminderPriority) => {
  switch (priority) {
    case ReminderPriority.High:
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    case ReminderPriority.Low:
      return <ArrowDown className="h-4 w-4 text-green-500" />;
    default:
      return <Minus className="h-4 w-4 text-amber-500" />;
  }
};
