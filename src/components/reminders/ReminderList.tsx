
import React from "react";
import { Reminder } from "@/context/ReminderContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useReminders } from "@/context/ReminderContext";
import { toast } from "sonner";

interface ReminderListProps {
  reminders: Reminder[];
}

const ReminderList: React.FC<ReminderListProps> = ({ reminders }) => {
  const { toggleReminderComplete, deleteReminder } = useReminders();
  const [reminderToDelete, setReminderToDelete] = React.useState<string | null>(null);

  const handleToggleComplete = (id: string) => {
    toggleReminderComplete(id);
    toast.success("Reminder status updated");
  };

  const handleDeleteReminder = () => {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete);
      setReminderToDelete(null);
      toast.success("Reminder deleted");
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No reminders found.</p>
        <p className="text-gray-400 text-sm mt-2">Create a new reminder to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AlertDialog open={!!reminderToDelete} onOpenChange={(isOpen) => !isOpen && setReminderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReminder}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {reminders.map((reminder) => (
        <div 
          key={reminder.id} 
          className={`bg-white rounded-lg shadow-sm p-4 flex items-start space-x-4 transition-all ${
            reminder.completed ? "opacity-60" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={reminder.completed}
            onChange={() => reminder.id && handleToggleComplete(reminder.id)}
            className="mt-1 h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary"
          />
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className={`font-medium ${reminder.completed ? "line-through text-gray-500" : ""}`}>
                {reminder.title}
              </h3>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  reminder.priority === "High" 
                    ? "bg-red-100 text-red-700" 
                    : reminder.priority === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {reminder.priority}
                </span>
                {reminder.category && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {reminder.category}
                  </span>
                )}
                <button 
                  onClick={() => reminder.id && setReminderToDelete(reminder.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <span className="text-sm">-</span>
                </button>
              </div>
            </div>
            
            {reminder.notes && (
              <p className="text-sm text-gray-600 mt-1">{reminder.notes}</p>
            )}
            
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span className="mr-2">{reminder.timing}</span>
              <span>{reminder.days.join(", ")}</span>
              {reminder.type && reminder.type !== "_none" && (
                <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">{reminder.type}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReminderList;
