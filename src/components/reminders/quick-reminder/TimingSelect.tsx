
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ReminderTiming } from "@/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TimingSelect: React.FC = () => {
  const { 
    control,
    formState: { errors } 
  } = useFormContext();
  
  const reminderTimings: ReminderTiming[] = [
    ReminderTiming.BeforeSchool,
    ReminderTiming.AfterSchool,
    ReminderTiming.DuringPeriod
  ];

  return (
    <div>
      <label
        htmlFor="timing"
        className="block text-sm font-medium text-foreground mb-2"
      >
        When would you like this reminder?
      </label>
      <Controller
        control={control}
        name="timing"
        render={({ field }) => (
          <Select 
            value={field.value} 
            onValueChange={field.onChange}
          >
            <SelectTrigger className={cn(
              "w-full",
              errors.timing ? "border-destructive" : "border-input"
            )}>
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
        )}
      />
    </div>
  );
};

export default TimingSelect;
