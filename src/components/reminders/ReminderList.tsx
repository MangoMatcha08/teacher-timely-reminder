
import React, { useState } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Clock } from "lucide-react";

const ReminderList = () => {
  const { reminders, schoolSetup, toggleReminderComplete } = useReminders();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === "_clear") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(value);
    }
  };
  
  const filteredReminders = reminders.filter(reminder => {
    if (selectedCategory && reminder.category !== selectedCategory) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={selectedCategory || ""} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_clear" className="font-medium bg-gray-100">
              Clear Category Filter
            </SelectItem>
            {schoolSetup?.categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredReminders.length === 0 ? (
        <p className="text-muted-foreground">No reminders found.</p>
      ) : (
        <div className="space-y-2">
          {filteredReminders.map((reminder) => (
            <Card key={reminder.id} className="border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {reminder.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reminder-${reminder.id}`}
                      checked={reminder.completed}
                      onCheckedChange={() => toggleReminderComplete(reminder.id!)}
                    />
                    <label
                      htmlFor={`reminder-${reminder.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
                    >
                      {reminder.completed ? "Completed" : "Mark Complete"}
                    </label>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
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

export default ReminderList;
