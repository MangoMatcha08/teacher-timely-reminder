
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormError } from "./FormError";
import { Coffee } from "lucide-react";

// Helper function to get the schedule time for display purposes
const getPeriodScheduleDisplay = (period: any) => {
  if (!period || !period.schedules || period.schedules.length === 0) {
    return "No schedule";
  }
  
  // Get the first schedule for display in dropdown
  const firstSchedule = period.schedules[0];
  return firstSchedule.startTime;
};

interface PeriodSelectProps {
  show: boolean;
}

const PeriodSelect: React.FC<PeriodSelectProps> = ({ show }) => {
  const { 
    register, 
    watch,
    formState: { errors } 
  } = useFormContext();

  if (!show) return null;
  
  const periods = watch("schoolSetup")?.periods || [];

  return (
    <div>
      <label
        htmlFor="quick-periodId"
        className="block text-sm font-medium text-foreground mb-2"
      >
        Class Period
      </label>
      <select
        id="quick-periodId"
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue ${
          errors.periodId ? "border-destructive" : "border-input"
        }`}
        {...register("periodId")}
      >
        <option value="">Select a period</option>
        {periods.map((period: any) => (
          <option key={period.id} value={period.id}>
            {period.name} {period.isPrepPeriod ? "🏮 (Prep)" : ""} ({getPeriodScheduleDisplay(period)})
          </option>
        ))}
      </select>
      <FormError error={errors.periodId} />
    </div>
  );
};

export default PeriodSelect;
