import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Calendar, Clock, Tag, MessageSquare, Phone, Mail, User, BookOpen, FileText, Flag } from "lucide-react";
import { 
  useReminders, 
  DayOfWeek, 
  ReminderType, 
  ReminderTiming,
  RecurrencePattern,
  ReminderPriority
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

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Call Home", "Email", "Talk to Student", "Prepare Materials", "Grade", "Other"] as const),
  timing: z.enum(["Before School", "After School", "During Period", "Start of Period", "End of Period", "15 Minutes Into Period"] as const),
  days: z.array(z.enum(["M", "T", "W", "Th", "F"] as const)).min(1, "Select at least one day"),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.enum(["Once", "Daily", "Weekly", "Specific Days"] as const),
  priority: z.enum(["Low", "Medium", "High"] as const)
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
      priority: "Medium"
    },
  });
  
  useEffect(() => {
    const today = new Date().getDay();
    const dayMap: Record<number, DayOfWeek> = {
      1: "M",
      2: "T",
      3: "W",
      4: "Th",
      5: "F",
      0: "M",
      6: "M",
    };
    setTimeout(() => {
      setValue("days", [dayMap[today]], { shouldValidate: true });
    }, 0);
  }, [setValue]);
  
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
  const watchPriority = watch("priority");
  
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
    "_none": <Clock className="w-4 h-4" />
  };
  
  const reminderTimings: ReminderTiming[] = [
    "Before School",
    "After School",
    "During Period",
    "Start of Period",
    "End of Period",
    "15 Minutes Into Period"
  ];
  
  const recurrencePatterns: RecurrencePattern[] = [
    "Once",
    "Daily",
    "Weekly",
    "Specific Days"
  ];
  
  const priorityLevels: ReminderPriority[] = [
    "Low",
    "Medium",
    "High"
  ];
  
  const priorityColors: Record<ReminderPriority, string> = {
    "Low": "bg-green-500/10 text-green-700",
    "Medium": "bg-amber-500/10 text-amber-700",
    "High": "bg-red-500/10 text-red-700"
  };
  
  const onSubmit = (data: ReminderFormData) => {
    try {
      createReminder({
        title: data.title,
        type: data.type,
        timing: data.timing,
        days: data.days,
        periodId: data.periodId,
        category: data.category || "",
        notes: data.notes || "",
        recurrence: data.recurrence,
        priority: data.priority
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
  
  const getPeriodScheduleDisplay = (period: any) => {
    if (!period || !period.schedules || period.schedules.length === 0) {
      return "No schedule";
    }
    
    const firstSchedule = period.schedules[0];
    return `${firstSchedule.startTime} - ${firstSchedule.endTime}`;
  };
  
  const showPeriodSelection = ["During Period", "Start of Period", "End of Period", "15 Minutes Into Period"].includes(watchTiming);
  
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
              
              {showPeriodSelection && (
                <div>
                  <label
                    htmlFor="periodId"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Class Period
                  </label>
                  <Controller 
                    control={control}
                    name="periodId"
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={cn(
                          "w-full",
                          errors.periodId ? "border-destructive" : "border-input"
                        )}>
                          <SelectValue placeholder="Select a period" />
                        </SelectTrigger>
                        <SelectContent>
                          {schoolSetup?.periods.map((period) => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.name} ({getPeriodScheduleDisplay(period)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.periodId && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.periodId.message}
                    </p>
                  )}
                </div>
              )}
              
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
              
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Priority
                </label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {priorityLevels.map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => field.onChange(priority)}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors",
                            watchPriority === priority
                              ? `${priorityColors[priority]} font-medium`
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <Flag className={`h-4 w-4 ${watchPriority === priority ? "opacity-100" : "opacity-50"}`} />
                          {priority}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.priority && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.priority.message}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category
                </label>
                <div className="flex relative">
                  <input
                    id="category"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
                    placeholder="E.g., Homework, Test, Project"
                    {...register("category")}
                    onFocus={() => setShowQuickCategories(true)}
                  />
                  {showQuickCategories && (
                    <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-white rounded-lg border shadow-md z-10 max-h-40 overflow-auto">
                      <div className="grid grid-cols-1 gap-1">
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type of Reminder
              </label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {reminderTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => field.onChange(type)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                          watchType === type
                            ? "bg-teacher-blue/10 border-teacher-blue text-teacher-blue"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div className="rounded-full bg-white p-2 mb-1 shadow-sm">
                          {reminderTypeIcons[type]}
                        </div>
                        <span className="text-xs font-medium">{type}</span>
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
                    <div className="flex flex-wrap justify-start gap-2 py-2">
                      {["M", "T", "W", "Th", "F"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day as DayOfWeek)}
                          className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-full transition-colors",
                            watchDays.includes(day as DayOfWeek)
                              ? "bg-teacher-blue text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            
            {watchRecurrence !== "Specific Days" && (
              <div className="hidden">
                <Controller
                  control={control}
                  name="days"
                  render={({ field }) => {
                    if (field.value.length === 0) {
                      const today = new Date().getDay();
                      const dayMap: Record<number, DayOfWeek> = {
                        1: "M",
                        2: "T",
                        3: "W",
                        4: "Th",
                        5: "F",
                        0: "M",
                        6: "M",
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
