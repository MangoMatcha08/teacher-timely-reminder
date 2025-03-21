
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { DayOfWeek, ReminderPriority, ReminderTiming } from "@/context/ReminderContext";
import { FormError } from "./FormError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Helper function to render priority icons
const getPriorityIcon = (priority: ReminderPriority) => {
  switch (priority) {
    case "High":
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    case "Low":
      return <ArrowDown className="h-4 w-4 text-green-500" />;
    default:
      return <Minus className="h-4 w-4 text-amber-500" />;
  }
};

// Helper function to get the schedule time for display purposes
const getPeriodScheduleDisplay = (period: any) => {
  if (!period || !period.schedules || period.schedules.length === 0) {
    return "No schedule";
  }
  
  // Get the first schedule for display in dropdown
  const firstSchedule = period.schedules[0];
  return firstSchedule.startTime;
};

const ReminderForm: React.FC = () => {
  const { 
    register, 
    watch, 
    control,
    formState: { errors } 
  } = useFormContext();
  
  const watchTiming = watch("timing");
  const reminderTimings: ReminderTiming[] = [
    "Before School",
    "After School",
    "During Period"
  ];
  
  // Show period selection only when timing is "During Period"
  const showPeriodSelection = watchTiming === "During Period";

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="quick-title"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Title
        </label>
        <input
          id="quick-title"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue ${
            errors.title ? "border-destructive" : "border-input"
          }`}
          placeholder="What do you need to remember?"
          {...register("title")}
        />
        <FormError error={errors.title} />
      </div>
      
      {/* Timing */}
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
      
      {/* Class Period - conditional based on timing */}
      {showPeriodSelection && (
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
            {watch("schoolSetup")?.periods.map((period: any) => (
              <option key={period.id} value={period.id}>
                {period.name} ({getPeriodScheduleDisplay(period)})
              </option>
            ))}
          </select>
          <FormError error={errors.periodId} />
        </div>
      )}
      
      {/* Priority */}
      <div>
        <label
          htmlFor="quick-priority"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Priority
        </label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(field.value as ReminderPriority)}
                    <span>{field.value}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-green-500" />
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-amber-500" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="High">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-red-500" />
                    <span>High</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      
      {/* Category */}
      <div>
        <label
          htmlFor="quick-category"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Category (Optional)
        </label>
        <select
          id="quick-category"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
          {...register("category")}
        >
          <option value="">Select a category</option>
          {watch("schoolSetup")?.categories?.map((category: string, index: number) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReminderForm;
