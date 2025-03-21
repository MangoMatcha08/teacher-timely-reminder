
import React, { useState, useEffect } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Clock, Undo2, Tag, Calendar, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getPriorityIcon } from "@/components/reminders/quick-reminder/PriorityIcons";

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
  
  // Get reminders for display, including completed ones
  const filteredReminders = reminders.filter(reminder => {
    if (selectedCategory && reminder.category !== selectedCategory) {
      return false;
    }
    return true; // Show all reminders, including completed ones
  });
  
  // Handle completion with undo option
  const handleComplete = (id: string) => {
    // Toggle the reminder in context
    toggleReminderComplete(id);
    
    // Show undo toast
    toast({
      title: "Reminder completed",
      description: "You can undo this action if needed.",
      action: (
        <button
          onClick={() => undoComplete(id)}
          className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-100"
        >
          <Undo2 className="mr-1 h-4 w-4" />
          Undo
        </button>
      ),
    });
  };
  
  // Undo completion
  const undoComplete = (id: string) => {
    // Toggle the reminder back to incomplete
    toggleReminderComplete(id);
    
    toast({
      title: "Reminder restored",
      description: "The reminder has been marked as incomplete.",
    });
  };
  
  if (filteredReminders.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg border border-dashed">
        <Calendar className="h-12 w-12 text-teacher-blue mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-gray-600 mb-1">No reminders for today</h3>
        <p className="text-sm text-gray-500 mb-4">Add a reminder to get started</p>
      </div>
    );
  }
  
  // Separate incomplete and completed reminders
  const incompleteReminders = filteredReminders.filter(r => !r.completed);
  const completedReminders = filteredReminders.filter(r => r.completed);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={selectedCategory || "_clear"} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px] border-gray-200 bg-white shadow-sm">
            <div className="flex items-center">
              <Tag className="mr-2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Filter by category" />
            </div>
          </SelectTrigger>
          <SelectContent className="w-[200px]">
            <SelectItem value="_clear" className="font-medium bg-gray-100">
              All Categories
            </SelectItem>
            {schoolSetup?.categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Reminders */}
      <div className="space-y-2">
        {incompleteReminders.map((reminder) => {
          const isPastDue = reminder.dueDate && new Date(reminder.dueDate) < new Date() && !reminder.completed;
          
          return (
            <Card 
              key={reminder.id} 
              className={cn(
                "border transition-all duration-300 hover:shadow-md", 
                isPastDue ? "border-l-4 border-l-red-400" : "border-l-4 border-l-transparent"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                  <CardTitle className="text-sm font-medium text-gray-800">
                    {reminder.title}
                  </CardTitle>
                  {isPastDue && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium py-0.5 px-1.5 rounded-full flex items-center">
                      <AlertCircle className="h-3 w-3 mr-0.5" />
                      Past due
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {reminder.priority && (
                    <span className="flex items-center">
                      {getPriorityIcon(reminder.priority)}
                    </span>
                  )}
                  {reminder.category && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      {reminder.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pl-2 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`reminder-${reminder.id}`}
                      checked={reminder.completed}
                      onCheckedChange={() => handleComplete(reminder.id!)}
                      className="border-gray-300 data-[state=checked]:bg-teacher-blue"
                    />
                    <label
                      htmlFor={`reminder-${reminder.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed text-gray-700 hover:text-teacher-blue"
                    >
                      Mark Complete
                    </label>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {reminder.dueDate ? format(new Date(reminder.dueDate), 'MMM d, yyyy') : 'No due date'}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Completed Reminders Section */}
      {completedReminders.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
            Completed Reminders
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium py-0.5 px-2 rounded-full">
              {completedReminders.length}
            </span>
          </h3>
          <div className="space-y-2">
            {completedReminders.map((reminder) => (
              <Card 
                key={reminder.id} 
                className="border border-gray-200 bg-gray-50 hover:bg-white transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center">
                    <CardTitle className="text-sm font-medium text-gray-400 line-through">
                      {reminder.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.priority && (
                      <span className="flex items-center opacity-50">
                        {getPriorityIcon(reminder.priority)}
                      </span>
                    )}
                    {reminder.category && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-400">
                        {reminder.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pl-2 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`reminder-completed-${reminder.id}`}
                        checked={true}
                        onCheckedChange={() => handleComplete(reminder.id!)}
                        className="border-green-300 data-[state=checked]:bg-green-500"
                      />
                      <label
                        htmlFor={`reminder-completed-${reminder.id}`}
                        className="text-sm font-medium leading-none text-green-600 flex items-center"
                      >
                        Completed
                        <button 
                          onClick={() => undoComplete(reminder.id!)}
                          className="ml-2 text-xs text-blue-500 hover:text-blue-700 flex items-center"
                        >
                          <Undo2 className="h-3 w-3 mr-0.5" />
                          Undo
                        </button>
                      </label>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {reminder.dueDate ? format(new Date(reminder.dueDate), 'MMM d, yyyy') : 'No due date'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderList;
