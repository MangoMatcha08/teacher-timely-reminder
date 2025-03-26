
import React from "react";
import QuickCreateReminder from "@/components/reminders/QuickCreateReminder";
import { toast } from "sonner";
import { AppError, formatErrorMessage } from "@/utils/errorHandling";

interface QuickReminderCreatorProps {
  onComplete: () => void;
  onClose: () => void;
}

const QuickReminderCreator: React.FC<QuickReminderCreatorProps> = ({ onComplete, onClose }) => {
  const handleSuccess = () => {
    toast.success("Reminder created successfully");
    onComplete();
  };
  
  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error || (error && typeof error === 'object' && 'message' in error) 
      ? formatErrorMessage(error)
      : "Failed to create reminder. Please try again.";
    
    toast.error(errorMessage);
  };
  
  return (
    <QuickCreateReminder 
      onClose={onClose} 
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};

export default QuickReminderCreator;
