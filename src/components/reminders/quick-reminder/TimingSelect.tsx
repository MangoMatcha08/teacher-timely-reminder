
import React from "react";
import { useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import FormError from "./FormError";
import { ReminderTiming } from "@/types";

const TimingSelect = () => {
  const { formState: { errors }, setValue, watch } = useFormContext();
  const watchTiming = watch("timing");
  
  const reminderTimings = [
    ReminderTiming.BeforeSchool,
    ReminderTiming.AfterSchool,
    ReminderTiming.DuringPeriod,
    ReminderTiming.StartOfPeriod,
    ReminderTiming.EndOfPeriod,
    ReminderTiming.FifteenMinutesIntoPeriod
  ];
  
  const handleTimingChange = (value: string) => {
    setValue("timing", value as ReminderTiming, { shouldValidate: true });
  };

  return (
    <div className="space-y-2">
      <label htmlFor="timing" className="block text-sm font-medium">
        When would you like this reminder?
      </label>
      <Select value={watchTiming} onValueChange={handleTimingChange}>
        <SelectTrigger
          id="timing"
          className={cn(
            "w-full",
            errors.timing ? "border-red-500" : "border-gray-300"
          )}
        >
          <SelectValue placeholder="Select a timing" />
        </SelectTrigger>
        <SelectContent>
          {reminderTimings.map((timing) => (
            <SelectItem key={timing} value={timing}>
              {timing}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.timing && <FormError message={errors.timing.message as string} />}
    </div>
  );
};

export default TimingSelect;
