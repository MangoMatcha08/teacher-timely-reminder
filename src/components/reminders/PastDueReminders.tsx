
import React, { useState } from 'react';
import { useReminders, Reminder } from '@/context/ReminderContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/shared/Card';
import { AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PastDueReminders: React.FC = () => {
  const { pastDueReminders, bulkCompleteReminders, deleteReminder } = useReminders();
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [showPastDue, setShowPastDue] = useState(false);
  
  const toggleReminderSelection = (id: string) => {
    setSelectedReminders(prev => 
      prev.includes(id) 
        ? prev.filter(remId => remId !== id)
        : [...prev, id]
    );
  };
  
  const selectAll = () => {
    setSelectedReminders(pastDueReminders.map(rem => rem.id!));
  };
  
  const deselectAll = () => {
    setSelectedReminders([]);
  };
  
  const handleMarkComplete = () => {
    if (selectedReminders.length === 0) {
      toast.error('Please select at least one reminder to mark as complete');
      return;
    }
    
    bulkCompleteReminders(selectedReminders);
    toast.success(`Marked ${selectedReminders.length} reminders as complete`);
    setSelectedReminders([]);
  };
  
  const handleDelete = () => {
    if (selectedReminders.length === 0) {
      toast.error('Please select at least one reminder to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedReminders.length} reminders?`)) {
      selectedReminders.forEach(id => deleteReminder(id));
      toast.success(`Deleted ${selectedReminders.length} reminders`);
      setSelectedReminders([]);
    }
  };
  
  if (pastDueReminders.length === 0) {
    return null;
  }
  
  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-6">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 cursor-pointer"
        onClick={() => setShowPastDue(!showPastDue)}>
        <CardTitle className="text-sm font-medium flex items-center text-amber-800">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
          <span>Past Due Reminders ({pastDueReminders.length})</span>
        </CardTitle>
        <Button variant="ghost" className="p-0 h-auto" onClick={() => setShowPastDue(!showPastDue)}>
          {showPastDue ? 'Hide' : 'Show'}
        </Button>
      </CardHeader>
      
      {showPastDue && (
        <>
          <CardContent className="px-4 pt-0 pb-2">
            <div className="text-xs text-muted-foreground mb-3">
              These reminders have passed their due date. Mark them complete or delete them.
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pastDueReminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className="flex items-center p-2 bg-white rounded border"
                >
                  <Checkbox 
                    id={`reminder-${reminder.id}`}
                    checked={selectedReminders.includes(reminder.id!)}
                    onCheckedChange={() => toggleReminderSelection(reminder.id!)}
                    className="mr-2"
                  />
                  <div className="flex-1 text-sm overflow-hidden">
                    <div className="font-medium truncate">{reminder.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Due: {reminder.dueDate ? format(new Date(reminder.dueDate), 'MMM d, yyyy') : 'Not specified'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="px-4 py-3 border-t flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAll}
                className="text-xs h-8"
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={deselectAll}
                className="text-xs h-8"
                disabled={selectedReminders.length === 0}
              >
                Deselect All
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={selectedReminders.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkComplete}
                className="text-xs h-8"
                disabled={selectedReminders.length === 0}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark Complete
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default PastDueReminders;
