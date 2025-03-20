
import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/shared/Button";
import { Plus } from "lucide-react";
import ReminderCard from "@/components/schedule/ReminderCard";
import { Reminder, SchoolSetup } from "@/components/schedule/types";

interface ReminderCardListProps {
  reminders: Reminder[];
  schoolSetup: SchoolSetup | null;
}

const ReminderCardList = ({ reminders, schoolSetup }: ReminderCardListProps) => {
  const navigate = useNavigate();
  
  if (reminders.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-muted-foreground mb-4">No reminders match your filters</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => navigate("/create-reminder")} className="h-8 text-sm">
            <Plus className="h-3 w-3 mr-1" />
            Add a Detailed Reminder
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {reminders.map(reminder => (
        <ReminderCard 
          key={reminder.id} 
          reminder={reminder} 
          schoolSetup={schoolSetup} 
        />
      ))}
    </div>
  );
};

export default ReminderCardList;
