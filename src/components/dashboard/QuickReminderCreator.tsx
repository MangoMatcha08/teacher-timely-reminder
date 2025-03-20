
import React from "react";
import QuickCreateReminder from "@/components/reminders/QuickCreateReminder";

interface QuickReminderCreatorProps {
  onComplete?: () => void;
  onClose?: () => void;
}

const QuickReminderCreator: React.FC<QuickReminderCreatorProps> = ({ 
  onComplete = () => {}, 
  onClose = () => {} 
}) => {
  const handleClose = () => {
    onClose();
  };
  
  const handleComplete = () => {
    onComplete();
  };
  
  return <QuickCreateReminder onClose={handleClose} onComplete={handleComplete} />;
};

export default QuickReminderCreator;
