
import React from 'react';
import { useReminders, Reminder } from '@/context/ReminderContext';
import { Card, CardContent } from "@/components/shared/Card";
import { Check, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReminderListProps {
  reminders: Reminder[];
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders }) => {
  const { toggleReminderComplete } = useReminders();
  
  const priorityColors: Record<string, string> = {
    "Low": "bg-green-500/10 text-green-700",
    "Medium": "bg-amber-500/10 text-amber-700",
    "High": "bg-red-500/10 text-red-700"
  };
  
  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <p>No reminders available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className={cn(
          "transition-colors",
          reminder.completed ? "bg-gray-100" : "bg-white"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <button 
                onClick={() => reminder.id && toggleReminderComplete(reminder.id)}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center",
                  reminder.completed 
                    ? "bg-teacher-blue text-white border-teacher-blue" 
                    : "border-gray-300 text-transparent hover:border-teacher-blue"
                )}
              >
                <Check className="w-4 h-4" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-start justify-between">
                  <h3 className={cn(
                    "font-medium truncate",
                    reminder.completed ? "text-gray-500 line-through" : ""
                  )}>
                    {reminder.title}
                  </h3>
                  
                  {reminder.priority && (
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      priorityColors[reminder.priority]
                    )}>
                      <Flag className="w-3 h-3 inline-block mr-1" />
                      {reminder.priority}
                    </div>
                  )}
                </div>
                
                <div className="mt-1 flex flex-wrap gap-2">
                  {reminder.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {reminder.category}
                    </span>
                  )}
                  
                  {reminder.type && reminder.type !== "_none" && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                      {reminder.type}
                    </span>
                  )}
                  
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {reminder.timing}
                  </span>
                </div>
                
                {reminder.notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    {reminder.notes}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReminderList;
