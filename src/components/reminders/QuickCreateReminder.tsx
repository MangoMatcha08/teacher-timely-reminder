
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReminders } from "@/context/ReminderContext";
import { toast } from "sonner";
import { quickReminderSchema, QuickReminderFormData } from "./quick-reminder/ReminderSchema";
import QuickReminderModal from "./quick-reminder/QuickReminderModal";
import ReminderForm from "./quick-reminder/ReminderForm";
import { DayOfWeek, ReminderType, ReminderTiming, RecurrencePattern, ReminderPriority } from "@/types";

interface QuickCreateReminderProps {
  onClose: () => void;
  onComplete?: () => void;
}

const QuickCreateReminder: React.FC<QuickCreateReminderProps> = ({ 
  onClose,
  onComplete = () => {}
}) => {
  const { createReminder, schoolSetup } = useReminders();
  
  const methods = useForm<QuickReminderFormData>({
    resolver: zodResolver(quickReminderSchema),
    defaultValues: {
      title: "",
      timing: ReminderTiming.DuringPeriod,
      periodId: schoolSetup?.periods[0]?.id || "",
      category: "",
      priority: ReminderPriority.Medium,
      schoolSetup: schoolSetup
    },
  });
  
  const onSubmit = (data: QuickReminderFormData) => {
    try {
      // For quick reminders, use today's day and set default type
      const today = new Date();
      const dayIndex = today.getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
      const daysOfWeek = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday];
      const todayCode = dayIndex >= 0 && dayIndex < 5 ? daysOfWeek[dayIndex] : DayOfWeek.Monday;
      
      // Ensure all required properties are passed
      createReminder({
        title: data.title,
        type: ReminderType.TalkToStudent,
        timing: data.timing,
        days: [todayCode],
        periodId: data.periodId,
        category: data.category || "",
        notes: "",
        recurrence: RecurrencePattern.Once,
        priority: data.priority
      });
      
      toast.success("Quick reminder created!");
      onComplete(); // Call onComplete to notify parent component
      onClose();   // Close the modal
    } catch (error) {
      toast.error("Failed to create reminder");
    }
  };
  
  return (
    <FormProvider {...methods}>
      <QuickReminderModal
        title="Quick Create Reminder"
        onClose={onClose}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <ReminderForm />
      </QuickReminderModal>
    </FormProvider>
  );
};

export default QuickCreateReminder;
