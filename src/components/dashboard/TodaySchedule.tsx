
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/shared/Button';
import { Reminder } from '@/context/ReminderContext';

interface PeriodWithReminders {
  period: any;
  reminders: Reminder[];
}

interface TodayScheduleProps {
  remindersByPeriod: PeriodWithReminders[];
  handleCheckReminder: (id: string) => void;
  handleEditReminder: (reminder: Reminder) => void;
  todayCode: string;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ 
  remindersByPeriod, 
  handleCheckReminder, 
  handleEditReminder,
  todayCode
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Today's Schedule</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/schedule")}
          className="flex items-center gap-1 text-sm"
        >
          View Full Schedule
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
        </Button>
      </div>
      
      <div className="space-y-3">
        {remindersByPeriod.length > 0 ? (
          remindersByPeriod.map(({ period, reminders }) => {
            const schedule = period.schedules.find((s: any) => s.dayOfWeek === todayCode);
            
            return (
              <div key={period.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{period.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{schedule?.startTime} - {schedule?.endTime}</span>
                    </div>
                  </div>
                </div>
                
                {reminders.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    <h4 className="text-xs font-medium text-muted-foreground">Reminders:</h4>
                    {reminders.map(reminder => (
                      <div key={reminder.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`remind-${reminder.id}`} 
                            checked={reminder.completed}
                            onCheckedChange={() => handleCheckReminder(reminder.id!)}
                          />
                          <label 
                            htmlFor={`remind-${reminder.id}`}
                            className={`text-sm ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {reminder.title}
                          </label>
                        </div>
                        <button 
                          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-gray-200"
                          onClick={() => handleEditReminder(reminder)}
                        >
                          <Pencil className="h-3 w-3" />
                          <span className="sr-only">Edit</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground italic">
                    No reminders for this period
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="border rounded-lg p-6 bg-gray-50 text-center">
            <p className="text-muted-foreground">No periods scheduled for today</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/create-reminder")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              Create a Reminder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
