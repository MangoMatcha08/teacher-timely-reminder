
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReminderPriority } from '@/types';

interface PrioritySelectProps {
  value: ReminderPriority;
  onChange: (value: ReminderPriority) => void;
}

const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  const priorityOptions: ReminderPriority[] = [ReminderPriority.Low, ReminderPriority.Medium, ReminderPriority.High];
  
  return (
    <div className="space-y-2">
      <label htmlFor="priority-select" className="text-sm text-muted-foreground">
        Minimum Priority
      </label>
      <Select 
        value={value}
        onValueChange={(value) => onChange(value as ReminderPriority)}
      >
        <SelectTrigger className="max-w-[180px]" id="priority-select">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map(priority => (
            <SelectItem key={priority} value={priority}>
              {priority}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-xs text-muted-foreground mt-1">
        You will receive notifications for reminders with this priority or higher.
      </div>
    </div>
  );
};

export default PrioritySelect;
