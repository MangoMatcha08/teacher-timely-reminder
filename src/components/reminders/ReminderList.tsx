
import React, { useState, useEffect } from "react";
import { useReminders } from "@/context/ReminderContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Clock, Undo2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReminderList = () => {
  const { reminders, schoolSetup, toggleReminderComplete } = useReminders();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string[]>([]);
  const [fadeOutItems, setFadeOutItems] = useState<Record<string, boolean>>({});
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    if (value === "_clear") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(value);
    }
  };
  
  // Get reminders for display, including fading completed ones
  const filteredReminders = reminders.filter(reminder => {
    if (selectedCategory && reminder.category !== selectedCategory) {
      return false;
    }
    // Show all non-completed and recently completed (for fade-out animation)
    return !reminder.completed || recentlyCompleted.includes(reminder.id!);
  });
  
  // Handle completion with fade effect
  const handleComplete = (id: string) => {
    // Start fade out animation
    setFadeOutItems(prev => ({ ...prev, [id]: true }));
    
    // Add to recently completed
    setRecentlyCompleted(prev => [...prev, id]);
    
    // Toggle the reminder in context
    toggleReminderComplete(id);
    
    // Remove fade out class and item from recently completed after animation
    setTimeout(() => {
      setFadeOutItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      
      // After 4 seconds, remove from recently completed
      setTimeout(() => {
        setRecentlyCompleted(prev => prev.filter(itemId => itemId !== id));
      }, 500);
    }, 3000);
    
    // Show undo toast
    toast({
      title: "Reminder completed",
      description: "This reminder will be hidden soon.",
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
    // Remove fade out effect
    setFadeOutItems(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    
    // Toggle the reminder back to incomplete
    toggleReminderComplete(id);
    
    toast({
      title: "Reminder restored",
      description: "The reminder has been marked as incomplete.",
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={selectedCategory || "_clear"} onValueChange={handleCategoryChange}>
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
            <Card 
              key={reminder.id} 
              className={cn(
                "border transition-all duration-1000", 
                fadeOutItems[reminder.id!] ? "opacity-30" : "opacity-100"
              )}
            >
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
                      onCheckedChange={() => handleComplete(reminder.id!)}
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
