
import React from 'react';
import { DayOfWeek } from "@/types";
import { cn } from "@/lib/utils";

interface SchoolDaysSetupProps {
  selectedDays: DayOfWeek[];
  toggleDay: (day: DayOfWeek) => void;
}

const SchoolDaysSetup: React.FC<SchoolDaysSetupProps> = ({
  selectedDays,
  toggleDay
}) => {
  const days: { label: string; value: DayOfWeek }[] = [
    { label: "M", value: DayOfWeek.Monday },
    { label: "T", value: DayOfWeek.Tuesday },
    { label: "W", value: DayOfWeek.Wednesday },
    { label: "Th", value: DayOfWeek.Thursday },
    { label: "F", value: DayOfWeek.Friday },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-medium mb-4">What days do you teach?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select all days when school is in session.
        </p>
        <div className="flex justify-center gap-4 py-2">
          {days.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "day-badge",
                selectedDays.includes(day.value)
                  ? "day-badge-selected"
                  : "day-badge-default"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchoolDaysSetup;
