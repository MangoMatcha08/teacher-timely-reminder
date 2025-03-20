
import React, { useState } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Clock, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CompletedReminders = () => {
  const { reminders, toggleReminderComplete } = useReminders();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get completed reminders
  const completedReminders = reminders.filter(reminder => reminder.completed);
  
  if (completedReminders.length === 0) {
    return (
      <div className="mt-8 p-6 text-center rounded-lg border border-dashed bg-gray-50">
        <CheckCircle2 className="h-12 w-12 text-teacher-blue mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">No completed tasks</h3>
        <p className="text-sm text-gray-500">When you complete tasks, they'll show up here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mt-8 bg-gray-50 rounded-lg p-4">
      <div 
        className="flex items-center justify-between cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-700">
            Completed Tasks
          </h2>
          <span className="ml-2 bg-gray-200 text-gray-600 text-xs font-medium py-1 px-2 rounded-full">
            {completedReminders.length}
          </span>
        </div>
        <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded-full transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 transition-all duration-300 animate-fade-in">
          {completedReminders.map((reminder) => (
            <Card key={reminder.id} className="border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 line-through">
                  {reminder.title}
                </CardTitle>
                <span className="text-xs text-gray-400">
                  Completed on {format(new Date(), 'MMM d, h:mm a')}
                </span>
              </CardHeader>
              <CardContent className="pl-2 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`completed-reminder-${reminder.id}`}
                      checked={true}
                      onCheckedChange={() => toggleReminderComplete(reminder.id!)}
                      className="border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor={`completed-reminder-${reminder.id}`}
                      className="text-sm font-medium leading-none text-green-600 hover:text-green-700"
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
