
import React from "react";
import { Reminder, SchoolSetup } from "@/context/ReminderContext";
import { format } from "date-fns";
import { Clock, MapPin, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { getPriorityIcon } from "@/components/reminders/quick-reminder/PriorityIcons";
import { useReminders } from "@/context/ReminderContext";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMobileView } from "@/hooks/use-mobile-view";
import { cn } from "@/lib/utils";

interface ReminderCardListProps {
  reminders: Reminder[];
  schoolSetup: SchoolSetup | null;
}

const ReminderCardList: React.FC<ReminderCardListProps> = ({ reminders, schoolSetup }) => {
  const { toggleReminderComplete } = useReminders();
  const { isMobile, isiOS } = useMobileView();
  
  if (!reminders || reminders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
          <CalendarIcon className="h-12 w-12 text-gray-300" />
        </div>
        <h3 className="mb-1 text-lg font-medium text-gray-900">No reminders found</h3>
        <p className="text-sm text-gray-500">
          No reminders match your current filter criteria.
        </p>
      </div>
    );
  }
  
  // Get period name by ID
  const getPeriodName = (periodId: string) => {
    const period = schoolSetup?.periods.find(p => p.id === periodId);
    return period ? period.name : "";
  };
  
  // Handle toggling reminder completion
  const handleToggleComplete = (reminder: Reminder) => {
    toggleReminderComplete(reminder.id!);
    
    if (!reminder.completed) {
      toast.success("Reminder marked as complete!", {
        description: reminder.title,
        action: {
          label: "Undo",
          onClick: () => toggleReminderComplete(reminder.id!),
        },
      });
    }
  };
  
  // Sort reminders by priority, then by completion status
  const sortedReminders = [...reminders].sort((a, b) => {
    // First by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { "High": 0, "Medium": 1, "Low": 2 };
    return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
  });
  
  // Group completed reminders separately
  const incompleteReminders = sortedReminders.filter(r => !r.completed);
  const completedReminders = sortedReminders.filter(r => r.completed);
  
  return (
    <div className="space-y-6">
      {/* Active Reminders */}
      <div className="space-y-3">
        {incompleteReminders.map((reminder) => {
          const isPastDue = reminder.dueDate && new Date(reminder.dueDate) < new Date();
          const cardClasses = cn(
            "relative overflow-hidden border bg-white shadow-sm hover:shadow transition-all duration-200",
            isiOS ? "rounded-xl" : "rounded-lg",
            isPastDue ? "border-l-4 border-l-red-400" : ""
          );
          
          return (
            <div key={reminder.id} className={cardClasses}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-gray-900 flex items-center gap-1.5">
                      {reminder.title}
                      {isPastDue && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <AlertCircle className="mr-0.5 h-3 w-3" />
                          Past due
                        </span>
                      )}
                    </h3>
                    <div className="mt-1 flex items-center text-xs text-gray-500 gap-3">
                      {reminder.dueDate && (
                        <span className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(reminder.dueDate), "MMM d, yyyy")}
                        </span>
                      )}
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {getPeriodName(reminder.periodId)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {reminder.priority && (
                      <span className="mr-2">{getPriorityIcon(reminder.priority)}</span>
                    )}
                    {reminder.category && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">
                        {reminder.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {reminder.notes && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{reminder.notes}</p>
                )}
                
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reminder-${reminder.id}`}
                      checked={reminder.completed}
                      onCheckedChange={() => handleToggleComplete(reminder)}
                      className="h-4 w-4 rounded-sm border-gray-300 data-[state=checked]:bg-teacher-blue"
                    />
                    <label
                      htmlFor={`reminder-${reminder.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed text-gray-700 hover:text-teacher-blue"
                    >
                      Mark Complete
                    </label>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="flex gap-1">
                      {reminder.days.map(day => (
                        <span key={day} className="px-1.5 py-0.5 bg-gray-100 rounded-md">{day}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Completed Reminders Section */}
      {completedReminders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            Completed Reminders
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium py-0.5 px-2 rounded-full">
              {completedReminders.length}
            </span>
          </h3>
          
          <div className="space-y-2">
            {completedReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={cn(
                  "relative border bg-gray-50 hover:bg-white transition-colors",
                  isiOS ? "rounded-xl" : "rounded-lg"
                )}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <Checkbox
                        id={`reminder-completed-${reminder.id}`}
                        checked={true}
                        onCheckedChange={() => handleToggleComplete(reminder)}
                        className="mt-0.5 mr-2 h-3.5 w-3.5 rounded-sm border-green-400 data-[state=checked]:bg-green-500"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 line-through">
                          {reminder.title}
                        </h3>
                        <div className="mt-0.5 flex items-center text-xs text-gray-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {reminder.dueDate 
                            ? format(new Date(reminder.dueDate), "MMM d, yyyy") 
                            : 'No due date'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {reminder.category && (
                      <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-400">
                        {reminder.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderCardList;
