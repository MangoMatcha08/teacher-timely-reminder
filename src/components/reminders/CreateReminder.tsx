
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Calendar, Clock, Tag, MessageSquare, Phone, Mail, User, BookOpen, FileText } from "lucide-react";
import { 
  useReminders, 
  DayOfWeek, 
  ReminderType, 
  ReminderTiming,
  RecurrencePattern
} from "@/context/ReminderContext";
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

// Schema for reminder form validation
const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Call Home", "Email", "Talk to Student", "Prepare Materials", "Grade", "Other"] as const),
  timing: z.enum(["Before School", "After School", "During Period"] as const),
  days: z.array(z.enum(["M", "T", "W", "Th", "F"] as const)).min(1, "Select at least one day"),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.enum(["Once", "Daily", "Weekly", "Specific Days"] as const),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

const CreateReminder: React.FC = () => {
  const navigate = useNavigate();
  const { createReminder, schoolSetup } = useReminders();
  const [showQuickCategories, setShowQuickCategories] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      type: "Talk to Student",
      timing: "During Period",
      days: [],
      periodId: schoolSetup?.periods[0]?.id || "",
      category: "",
      notes: "",
      recurrence: "Once",
    },
  });
  
  const quickCategories = schoolSetup?.categories || [
    "IEP meetings",
    "Materials/Set up",
    "Student support",
    "School events",
    "Instruction",
    "Administrative tasks"
  ];
  
  const watchDays = watch("days");
  const watchType = watch("type");
  const watchTiming = watch("timing");
  const watchRecurrence = watch("recurrence");
  
  const reminderTypes: ReminderType[] = [
    "Call Home",
    "Email",
    "Talk to Student",
    "Prepare Materials",
    "Grade",
    "Other",
  ];
  
  const reminderTypeIcons: Record<ReminderType, React.ReactNode> = {
    "Call Home": <Phone className="w-4 h-4" />,
    "Email": <Mail className="w-4 h-4" />,
    "Talk to Student": <User className="w-4 h-4" />,
    "Prepare Materials": <BookOpen className="w-4 h-4" />,
    "Grade": <FileText className="w-4 h-4" />,
    "Other": <Tag className="w-4 h-4" />,
  };
  
  const reminderTimings: ReminderTiming[] = [
    "Before School",
    "After School",
    "During Period"
  ];
  
  const recurrencePatterns: RecurrencePattern[] = [
    "Once",
    "Daily",
    "Weekly",
    "Specific Days"
  ];
  
  const onSubmit = (data: ReminderFormData) => {
    try {
      // Ensure all required properties have values
      createReminder({
        title: data.title,
        type: data.type,
        timing: data.timing,
        days: data.days,
        periodId: data.periodId,
        category: data.category || "", // Provide default empty string if undefined
        notes: data.notes || "", // Provide default empty string if undefined
        recurrence: data.recurrence,
      });
      
      toast.success("Reminder created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create reminder. Please try again.");
    }
  };
  
  const toggleDay = (day: DayOfWeek) => {
    const currentDays = watch("days");
    if (currentDays.includes(day)) {
      setValue(
        "days",
        currentDays.filter((d) => d !== day),
        { shouldValidate: true }
      );
    } else {
      setValue("days", [...currentDays, day], { shouldValidate: true });
    }
  };
  
  const selectAllDays = () => {
    setValue("days", ["M", "T", "W", "Th", "F"], { shouldValidate: true });
  };
  
  const clearAllDays = () => {
    setValue("days", [], { shouldValidate: true });
  };
  
  const selectQuickCategory = (category: string) => {
    setValue("category", category, { shouldValidate: true });
    setShowQuickCategories(false);
  };
  
  // Helper function to get the schedule time for display purposes
  const getPeriodScheduleDisplay = (period: any) => {
    if (!period || !period.schedules || period.schedules.length === 0) {
      return "No schedule";
    }
    
    // Get the first schedule for display in dropdown
    const firstSchedule = period.schedules[0];
    return `${firstSchedule.startTime} - ${firstSchedule.endTime}`;
  };
  
  // Show period selection only when timing is "During Period"
  const showPeriodSelection = watchTiming === "During Period";
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-4">Create a Reminder</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Reminder Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Title
                </label>
                <input
                  id="title"
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
                {errors.timing && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.timing.message}
                  </p>
                )}
              </div>
              
              {/* Class Period / Time - conditional based on timing */}
              {showPeriodSelection && (
                <div>
                  <label
                    htmlFor="periodId"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Class Period
                  </label>
                  <select
                    id="periodId"
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
              
              {/* Recurrence Pattern */}
              <div>
                <label
                  htmlFor="recurrence"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  How often?
                </label>
                <Controller
                  control={control}
                  name="recurrence"
                  render={({ field }) => (
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={cn(
                        "w-full",
                        errors.recurrence ? "border-destructive" : "border-input"
                      )}>
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        {recurrencePatterns.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.recurrence && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.recurrence.message}
                  </p>
                )}
              </div>
              
              {/* Category */}
              <div className="relative">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category
                </label>
                <input
                  id="category"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
                  placeholder="E.g., Homework, Test, Project"
                  {...register("category")}
                  onFocus={() => setShowQuickCategories(true)}
                />
                {showQuickCategories && (
                  <div className="absolute left-0 right-0 mt-1 p-2 bg-white rounded-lg border shadow-md z-10 max-h-40 overflow-auto">
                    <div className="grid grid-cols-2 gap-1">
                      {quickCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className="text-left px-3 py-2 text-sm rounded-md hover:bg-teacher-gray transition-colors"
                          onClick={() => selectQuickCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Reminder Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type of Reminder
              </label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {reminderTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => field.onChange(type)}
                        className={cn(
                          "reminder-type-badge",
                          watchType === type
                            ? "reminder-type-badge-selected"
                            : "reminder-type-badge-default"
                        )}
                      >
                        {reminderTypeIcons[type]}
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.type && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>
            
            {/* Days of Week - Show only if recurrence is "Specific Days" */}
            {watchRecurrence === "Specific Days" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Which days?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllDays}
                      className="text-xs text-teacher-blue hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-xs text-muted-foreground">|</span>
                    <button
                      type="button"
                      onClick={clearAllDays}
                      className="text-xs text-teacher-blue hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <Controller
                  control={control}
                  name="days"
                  render={() => (
                    <div className="flex justify-start gap-3 py-2">
                      {["M", "T", "W", "Th", "F"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day as DayOfWeek)}
                          className={cn(
                            "day-badge",
                            watchDays.includes(day as DayOfWeek)
                              ? "day-badge-selected"
                              : "day-badge-default"
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.days && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.days.message}
                  </p>
                )}
              </div>
            )}
            
            {/* For non-specific days recurrence, set a default day */}
            {watchRecurrence !== "Specific Days" && (
              <div className="hidden">
                <Controller
                  control={control}
                  name="days"
                  render={({ field }) => {
                    // Set today as the default day if none selected
                    if (field.value.length === 0) {
                      const today = new Date().getDay();
                      const dayMap: Record<number, DayOfWeek> = {
                        1: "M",
                        2: "T",
                        3: "W",
                        4: "Th",
                        5: "F",
                        0: "M", // Sunday defaults to Monday
                        6: "M", // Saturday defaults to Monday
                      };
                      setTimeout(() => {
                        setValue("days", [dayMap[today]], { shouldValidate: true });
                      }, 0);
                    }
                    return null;
                  }}
                />
              </div>
            )}
            
            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
                placeholder="Add any additional details here"
                rows={3}
                {...register("notes")}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Reminder
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateReminder;
