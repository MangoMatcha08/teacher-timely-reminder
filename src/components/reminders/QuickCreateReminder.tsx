
import React, { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useReminders, DayOfWeek, ReminderTiming, ReminderPriority } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for quick reminder form validation
const quickReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  timing: z.enum(["Before School", "After School", "During Period"] as const),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"] as const).default("Medium"),
});

type QuickReminderFormData = z.infer<typeof quickReminderSchema>;

interface QuickCreateReminderProps {
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const QuickCreateReminder: React.FC<QuickCreateReminderProps> = ({ 
  onClose,
  onSuccess,
  onError 
}) => {
  const { createReminder, schoolSetup } = useReminders();
  
  const reminderTimings: ReminderTiming[] = [
    "Before School",
    "After School",
    "During Period"
  ];
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<QuickReminderFormData>({
    resolver: zodResolver(quickReminderSchema),
    defaultValues: {
      title: "",
      timing: "During Period",
      periodId: schoolSetup?.periods[0]?.id || "",
      category: "",
      priority: "Medium"
    },
  });
  
  const watchTiming = watch("timing");
  
  // Helper function to get the schedule time for display purposes
  const getPeriodScheduleDisplay = (period: any) => {
    if (!period || !period.schedules || period.schedules.length === 0) {
      return "No schedule";
    }
    
    // Get the first schedule for display in dropdown
    const firstSchedule = period.schedules[0];
    return firstSchedule.startTime;
  };
  
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
  
  const onSubmit = (data: QuickReminderFormData) => {
    try {
      // For quick reminders, use today's day and set default type
      const today = new Date();
      const dayIndex = today.getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
      const daysOfWeek = ["M", "T", "W", "Th", "F"];
      const todayCode = dayIndex >= 0 && dayIndex < 5 ? daysOfWeek[dayIndex] : "M";
      
      // Ensure all required properties are passed
      createReminder({
        title: data.title,
        type: "Talk to Student",
        timing: data.timing,
        days: [todayCode as DayOfWeek],
        periodId: data.periodId,
        category: data.category || "",
        notes: "",
        recurrence: "Once",
        priority: data.priority
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        toast.success("Quick reminder created!");
        onClose();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        toast.error("Failed to create reminder");
      }
    }
  };
  
  // Show period selection only when timing is "During Period"
  const showPeriodSelection = watchTiming === "During Period";
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        <Card>
          <CardHeader className="relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-6"
            >
              <X className="h-4 w-4" />
            </button>
            <CardTitle>Quick Create Reminder</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
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
                    {schoolSetup?.periods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name} ({getPeriodScheduleDisplay(period)})
                      </option>
                    ))}
                  </select>
                  {errors.periodId && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.periodId.message}
                    </p>
                  )}
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
                  {schoolSetup?.categories?.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t p-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default QuickCreateReminder;
