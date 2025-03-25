
import React from "react";
import QuickCreateReminder from "@/components/reminders/QuickCreateReminder";

interface QuickReminderCreatorProps {
  onComplete: () => void;
  onClose: () => void;
}

const QuickReminderCreator: React.FC<QuickReminderCreatorProps> = ({ onComplete, onClose }) => {
  return <QuickCreateReminder onClose={onClose} />;
};

export default QuickReminderCreator;
