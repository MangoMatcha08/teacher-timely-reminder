
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, CheckCircle, PlusCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/shared/Button';
import { Reminder } from '@/context/ReminderContext';

interface TodayRemindersProps {
  todaysReminders: Reminder[];
  handleCheckReminder: (id: string) => void;
  handleEditReminder: (reminder: Reminder) => void;
  schoolSetup: any;
}

const TodayReminders: React.FC<TodayRemindersProps> = ({ 
  todaysReminders, 
  handleCheckReminder, 
  handleEditReminder,
  schoolSetup
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Today's Reminders</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/create-reminder")}
          className="flex items-center gap-1 text-sm"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Reminder
        </Button>
      </div>
      
      <div className="border rounded-lg divide-y">
        {todaysReminders.length > 0 ? (
          todaysReminders.map(reminder => (
            <div 
              key={reminder.id} 
              className="flex items-center justify-between p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={`today-${reminder.id}`}
                  checked={reminder.completed}
                  onCheckedChange={() => handleCheckReminder(reminder.id!)}
                />
                <div>
                  <label 
                    htmlFor={`today-${reminder.id}`}
                    className={`text-sm font-medium ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {reminder.title}
                  </label>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {reminder.periodId && schoolSetup.periods.find((p: any) => p.id === reminder.periodId)?.name}
                    {reminder.category && ` • ${reminder.category}`}
                  </div>
                </div>
              </div>
              <button 
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-gray-200"
                onClick={() => handleEditReminder(reminder)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">All Done!</h3>
            <p className="text-muted-foreground">
              You don't have any reminders for today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayReminders;
