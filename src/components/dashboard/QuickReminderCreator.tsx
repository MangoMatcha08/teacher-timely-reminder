
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
    try {
      toast.success("Reminder created successfully");
      onComplete();
    } catch (error) {
      console.error("Error in handleSuccess:", error);
      // Still try to complete the operation even if toast fails
      onComplete();
    }
  };
  
  const handleError = (error: unknown) => {
    try {
      const errorMessage = error instanceof Error || (error && typeof error === 'object' && 'message' in error) 
        ? formatErrorMessage(error)
        : "Failed to create reminder. Please try again.";
      
      toast.error(errorMessage);
    } catch (toastError) {
      console.error("Error showing error toast:", toastError);
      // Fallback error handling if toast fails
      alert("Failed to create reminder: " + 
        (error instanceof Error ? error.message : "Unknown error"));
    }
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
