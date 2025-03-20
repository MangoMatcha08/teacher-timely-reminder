
import React, { useState } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CompletedReminders = () => {
  const { reminders, toggleReminderComplete } = useReminders();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get completed reminders
  const completedReminders = reminders.filter(reminder => reminder.completed);
  
  if (completedReminders.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-medium text-gray-600">
          Completed Tasks ({completedReminders.length})
        </h2>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 transition-all duration-300">
          {completedReminders.map((reminder) => (
            <Card key={reminder.id} className="border border-gray-200 bg-gray-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 line-through">
                  {reminder.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`completed-reminder-${reminder.id}`}
                      checked={true}
                      onCheckedChange={() => toggleReminderComplete(reminder.id!)}
                    />
                    <label
                      htmlFor={`completed-reminder-${reminder.id}`}
                      className="text-sm font-medium leading-none text-gray-500"
                    >
                      Restore
                    </label>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {reminder.dueDate ? format(new Date(reminder.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedReminders;
