
import React from "react";
import QuickCreateReminder from "@/components/reminders/QuickCreateReminder";

interface QuickReminderCreatorProps {
  onComplete?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const QuickReminderCreator: React.FC<QuickReminderCreatorProps> = ({ 
  onComplete = () => {}, 
  onClose = () => {},
  isOpen = false
}) => {
  const handleClose = () => {
    onClose();
  };
  
  const handleComplete = () => {
    onComplete();
  };
  
  if (!isOpen) {
    return null;
  }
  
  return <QuickCreateReminder onClose={handleClose} onComplete={handleComplete} />;
};

export default QuickReminderCreator;
