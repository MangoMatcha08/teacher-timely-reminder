
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, AlertCircle, Calendar, Clock, Tag, MessageSquare } from "lucide-react";
import { useReminders, DayOfWeek, ReminderType } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Schema for reminder form validation
const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Pop Quiz", "Collect Work", "Hand Out", "Announcement", "Other"] as const),
  days: z.array(z.enum(["M", "T", "W", "Th", "F"] as const)).min(1, "Select at least one day"),
  periodId: z.string().min(1, "Period is required"),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

const CreateReminder: React.FC = () => {
  const navigate = useNavigate();
  const { createReminder, schoolSetup } = useReminders();
  const [showQuickCategories, setShowQuickCategories] = useState(false);
  
  const quickCategories = [
    "Homework",
    "Test",
    "Project",
    "Reading",
    "Activity",
    "Discussion",
  ];
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      type: "Announcement",
      days: [],
      periodId: schoolSetup?.periods[0]?.id || "",
      category: "",
      notes: "",
    },
  });
  
  const watchDays = watch("days");
  const watchType = watch("type");
  
  const reminderTypes: ReminderType[] = [
    "Pop Quiz",
    "Collect Work",
    "Hand Out",
    "Announcement",
    "Other",
  ];
  
  const reminderTypeIcons: Record<ReminderType, React.ReactNode> = {
    "Pop Quiz": <AlertCircle className="w-4 h-4" />,
    "Collect Work": <Calendar className="w-4 h-4" />,
    "Hand Out": <Clock className="w-4 h-4" />,
    "Announcement": <MessageSquare className="w-4 h-4" />,
    "Other": <Tag className="w-4 h-4" />,
  };
  
  const onSubmit = (data: ReminderFormData) => {
    try {
      createReminder(data);
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
  
  const selectQuickCategory = (category: string) => {
    setValue("category", category, { shouldValidate: true });
    setShowQuickCategories(false);
  };
  
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
              
              {/* Class Period */}
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
                      {period.name} ({period.startTime} - {period.endTime})
                    </option>
                  ))}
                </select>
                {errors.periodId && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.periodId.message}
                  </p>
                )}
              </div>
              
              {/* Category */}
              <div className="relative">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Category (Optional)
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
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
            
            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Which days does your class occur?
              </label>
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
