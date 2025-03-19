import React, { useState } from "react";
import { useReminders, ReminderType, ReminderTiming, ReminderPriority } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayOfWeek } from "@/context/ReminderContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface QuickReminderCreatorProps {
  onComplete: () => void;
}

const QuickReminderCreator: React.FC<QuickReminderCreatorProps> = ({ onComplete }) => {
  const { schoolSetup, createReminder } = useReminders();
  
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>("Talk to Student");
  const [timing, setTiming] = useState<ReminderTiming>("During Period");
  const [periodId, setPeriodId] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<ReminderPriority>("Medium");
  
  const getTodayDayCode = (): DayOfWeek => {
    const days: DayOfWeek[] = ["M", "T", "W", "Th", "F"];
    const dayIndex = new Date().getDay() - 1; // 0 = Sunday, so -1 gives Monday as 0
    return dayIndex >= 0 && dayIndex < 5 ? days[dayIndex] : "M"; // Default to Monday if weekend
  };
  
  React.useEffect(() => {
    if (schoolSetup?.periods && schoolSetup.periods.length > 0) {
      setPeriodId(schoolSetup.periods[0].id);
    }
  }, [schoolSetup]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title for the reminder");
      return;
    }
    
    if (timing.includes("Period") && !periodId) {
      toast.error("Please select a period");
      return;
    }
    
    createReminder({
      title,
      type,
      timing,
      days: [getTodayDayCode()],
      periodId: timing.includes("Period") ? periodId : "",
      category,
      notes: "",
      recurrence: "Once",
      priority
    });
    
    toast.success("Reminder created!");
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to remember?"
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Type (Optional)</label>
          <Select value={type} onValueChange={(value: ReminderType) => setType(value)} defaultValue="">
            <SelectTrigger>
              <SelectValue placeholder="Select type (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No Type</SelectItem>
              <SelectItem value="Call Home">Call Home</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Talk to Student">Talk to Student</SelectItem>
              <SelectItem value="Prepare Materials">Prepare Materials</SelectItem>
              <SelectItem value="Grade">Grade</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">When</label>
          <Select value={timing} onValueChange={(value: ReminderTiming) => setTiming(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Before School">Before School</SelectItem>
              <SelectItem value="After School">After School</SelectItem>
              <SelectItem value="Before Period">Before Period</SelectItem>
              <SelectItem value="After Period">After Period</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {timing.includes("Period") && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Period</label>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {schoolSetup?.periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {schoolSetup?.categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Priority</label>
          <ToggleGroup 
            type="single" 
            value={priority} 
            onValueChange={(value: ReminderPriority) => {
              if (value) setPriority(value);
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="Low" className="text-xs px-2 py-1">
              Low
            </ToggleGroupItem>
            <ToggleGroupItem value="Medium" className="text-xs px-2 py-1">
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem value="High" className="text-xs px-2 py-1">
              High
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Add Reminder
        </Button>
      </div>
    </form>
  );
};

export default QuickReminderCreator;
