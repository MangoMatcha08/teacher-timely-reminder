import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek, Period, PeriodSchedule } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import TimeInput from "@/components/shared/TimeInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronDown, Info, Plus, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Helper to create initial period schedule
const createInitialSchedule = (day: DayOfWeek, startTime = "9:00 AM", endTime = "9:50 AM"): PeriodSchedule => ({
  dayOfWeek: day,
  startTime,
  endTime,
});

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  
  // School hours state
  const [schoolStart, setSchoolStart] = useState("8:00 AM");
  const [schoolEnd, setSchoolEnd] = useState("3:00 PM");
  const [teacherArrival, setTeacherArrival] = useState("7:30 AM");
  
  // Updated periods state with day-specific schedules
  const [periods, setPeriods] = useState<Period[]>([
    { 
      id: "period-1", 
      name: "First Period", 
      schedules: [] 
    },
    { 
      id: "period-2", 
      name: "Second Period", 
      schedules: [] 
    },
  ]);
  
  // Days of the week data
  const days: { label: string; value: DayOfWeek }[] = [
    { label: "M", value: "M" },
    { label: "T", value: "T" },
    { label: "W", value: "W" },
    { label: "Th", value: "Th" },
    { label: "F", value: "F" },
  ];
  
  // Toggle selected day
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  // Handle period name change
  const handlePeriodNameChange = (id: string, name: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, name } : p)));
  };
  
  // Toggle period day
  const togglePeriodDay = (periodId: string, day: DayOfWeek) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const periodSchedules = [...period.schedules];
      const existingScheduleIndex = periodSchedules.findIndex(s => s.dayOfWeek === day);
      
      if (existingScheduleIndex >= 0) {
        // Remove day from period schedules
        periodSchedules.splice(existingScheduleIndex, 1);
      } else {
        // Add default schedule for this day
        periodSchedules.push(createInitialSchedule(day));
      }
      
      return {
        ...period,
        schedules: periodSchedules
      };
    }));
  };
  
  // Handle period schedule time changes
  const handleScheduleStartTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const scheduleIndex = period.schedules.findIndex(s => s.dayOfWeek === day);
      
      if (scheduleIndex === -1) {
        // This shouldn't happen if they use the UI correctly
        return period;
      } else {
        // Update existing schedule
        const updatedSchedules = [...period.schedules];
        updatedSchedules[scheduleIndex] = {
          ...updatedSchedules[scheduleIndex],
          startTime: time
        };
        
        return {
          ...period,
          schedules: updatedSchedules
        };
      }
    }));
  };
  
  const handleScheduleEndTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const scheduleIndex = period.schedules.findIndex(s => s.dayOfWeek === day);
      
      if (scheduleIndex === -1) {
        // This shouldn't happen if they use the UI correctly
        return period;
      } else {
        // Update existing schedule
        const updatedSchedules = [...period.schedules];
        updatedSchedules[scheduleIndex] = {
          ...updatedSchedules[scheduleIndex],
          endTime: time
        };
        
        return {
          ...period,
          schedules: updatedSchedules
        };
      }
    }));
  };
  
  // Apply the same schedule to multiple days
  const applyScheduleToAllDays = (periodId: string, sourceDayOfWeek: DayOfWeek) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    
    const sourceSchedule = period.schedules.find(s => s.dayOfWeek === sourceDayOfWeek);
    if (!sourceSchedule) return;
    
    setPeriods(periods.map(p => {
      if (p.id !== periodId) return p;
      
      // Create schedules for all days this period occurs on
      const updatedSchedules = p.schedules.map(schedule => {
        if (schedule.dayOfWeek === sourceDayOfWeek) {
          // Keep the source schedule as is
          return schedule;
        } else {
          // Update other schedules with the same time
          return {
            ...schedule,
            startTime: sourceSchedule.startTime,
            endTime: sourceSchedule.endTime
          };
        }
      });
      
      return {
        ...p,
        schedules: updatedSchedules
      };
    }));
    
    toast.success("Schedule applied to all days");
  };
  
  // Add a new period
  const addPeriod = () => {
    const newId = `period-${periods.length + 1}`;
    const newPeriod: Period = {
      id: newId,
      name: `Period ${periods.length + 1}`,
      schedules: []
    };
    
    setPeriods([...periods, newPeriod]);
  };
  
  // Remove a period
  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((p) => p.id !== id));
    } else {
      toast.error("You need at least one period");
    }
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 0) {
      // Validate periods
      for (const period of periods) {
        if (!period.name.trim()) {
          toast.error("Please provide a name for all periods");
          return;
        }
      }
    }
    
    if (currentStep === 1 && selectedDays.length === 0) {
      toast.error("Please select at least one school day");
      return;
    }
    
    if (currentStep === 2) {
      // Validate schedules
      for (const period of periods) {
        if (period.schedules.length === 0) {
          toast.error(`${period.name} needs to be scheduled on at least one day`);
          return;
        }
      }
    }
    
    if (currentStep === 3) {
      // Validate school hours
      if (!schoolStart || !schoolEnd || !teacherArrival) {
        toast.error("Please provide all school hours information");
        return;
      }
      
      // Save school setup
      saveSchoolSetup({
        schoolDays: selectedDays,
        periods,
        schoolHours: {
          startTime: schoolStart,
          endTime: schoolEnd,
          teacherArrivalTime: teacherArrival
        }
      });
      
      // Mark onboarding as complete
      setCompleteOnboarding();
      
      // Navigate to dashboard
      navigate("/dashboard");
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Get schedule for a specific period and day
  const getPeriodSchedule = (periodId: string, day: DayOfWeek) => {
    const period = periods.find(p => p.id === periodId);
    return period?.schedules.find(s => s.dayOfWeek === day);
  };
  
  // Check if a period is scheduled on a specific day
  const isPeriodScheduledOnDay = (periodId: string, day: DayOfWeek) => {
    const period = periods.find(p => p.id === periodId);
    return period?.schedules.some(s => s.dayOfWeek === day) || false;
  };
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">First, create your class periods</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create all the periods or classes you teach during the day.
                You'll select which days each period occurs on in the next steps.
              </p>
              
              <div className="space-y-4">
                {periods.map((period) => (
                  <div key={period.id} className="flex items-center gap-3 border rounded-lg p-4 bg-white">
                    <div className="flex-1">
                      <Input
                        value={period.name}
                        onChange={(e) => handlePeriodNameChange(period.id, e.target.value)}
                        className="w-full"
                        placeholder="Period Name"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removePeriod(period.id)}
                      className="text-destructive hover:text-destructive/90"
                      disabled={periods.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={addPeriod}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Period
                </Button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">What days do you teach?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select all days when school is in session.
              </p>
              <div className="flex justify-center gap-4 py-2">
                {days.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "day-badge",
                      selectedDays.includes(day.value)
                        ? "day-badge-selected"
                        : "day-badge-default"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">Schedule your periods</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select which days each period occurs on, and set their times.
                Most days follow the same schedule, but you can customize exceptions.
              </p>
              
              <div className="space-y-6">
                {periods.map((period) => (
                  <Collapsible
                    key={period.id}
                    className="border rounded-lg bg-white overflow-hidden"
                    defaultOpen={true}
                  >
                    <div className="p-4 flex items-center justify-between border-b">
                      <h3 className="font-medium">{period.name}</h3>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-4">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Which days does this period occur?</h4>
                          <div className="flex gap-3">
                            {days.map((day) => (
                              <button
                                key={`${period.id}-${day.value}`}
                                type="button"
                                onClick={() => togglePeriodDay(period.id, day.value)}
                                disabled={!selectedDays.includes(day.value)}
                                className={cn(
                                  "day-badge",
                                  !selectedDays.includes(day.value) 
                                    ? "day-badge-disabled opacity-30" 
                                    : isPeriodScheduledOnDay(period.id, day.value)
                                      ? "day-badge-selected"
                                      : "day-badge-default"
                                )}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {period.schedules.length > 0 ? (
                          <div className="space-y-4 mt-4">
                            <h4 className="text-sm font-medium">Schedule for each day</h4>
                            
                            {/* New unified time block */}
                            {period.schedules.length > 1 && (
                              <div className="p-4 border rounded-md bg-gray-50 mb-2">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-medium">Default Period Time</h5>
                                  <div className="text-xs text-muted-foreground">
                                    Set once and apply to all days
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <TimeInput
                                    label="Start Time"
                                    value={period.schedules[0]?.startTime || "9:00 AM"}
                                    onChange={(time) => {
                                      // Apply this start time to all schedules for this period
                                      setPeriods(periods.map(p => {
                                        if (p.id !== period.id) return p;
                                        return {
                                          ...p,
                                          schedules: p.schedules.map(schedule => ({
                                            ...schedule,
                                            startTime: time
                                          }))
                                        };
                                      }));
                                    }}
                                    id={`period-${period.id}-default-start`}
                                  />
                                  
                                  <TimeInput
                                    label="End Time"
                                    value={period.schedules[0]?.endTime || "9:50 AM"}
                                    onChange={(time) => {
                                      // Apply this end time to all schedules for this period
                                      setPeriods(periods.map(p => {
                                        if (p.id !== period.id) return p;
                                        return {
                                          ...p,
                                          schedules: p.schedules.map(schedule => ({
                                            ...schedule,
                                            endTime: time
                                          }))
                                        };
                                      }));
                                    }}
                                    id={`period-${period.id}-default-end`}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {/* Individual day exceptions */}
                            <div className="space-y-2">
                              {period.schedules.map((schedule) => (
                                <div key={`${period.id}-${schedule.dayOfWeek}-schedule`} 
                                     className="border rounded-md bg-white overflow-hidden">
                                  <div className="flex items-center justify-between border-b px-4 py-2 bg-gray-50">
                                    <div className="flex items-center">
                                      <div className="day-badge day-badge-selected mr-2">
                                        {days.find(d => d.value === schedule.dayOfWeek)?.label}
                                      </div>
                                      <h5 className="text-sm font-medium">
                                        {schedule.dayOfWeek === "W" ? "Wednesday (different)" : days.find(d => d.value === schedule.dayOfWeek)?.label}
                                      </h5>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-muted-foreground mr-2">
                                        Different schedule
                                      </div>
                                      <Switch
                                        checked={
                                          // Check if this day's schedule is different from the first schedule
                                          period.schedules.length > 1 && 
                                          (schedule.startTime !== period.schedules[0].startTime || 
                                           schedule.endTime !== period.schedules[0].endTime)
                                        }
                                        onCheckedChange={(checked) => {
                                          if (!checked) {
                                            // Reset this day to match the first day's schedule
                                            const firstSchedule = period.schedules[0];
                                            handleScheduleStartTimeChange(period.id, schedule.dayOfWeek, firstSchedule.startTime);
                                            handleScheduleEndTimeChange(period.id, schedule.dayOfWeek, firstSchedule.endTime);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <TimeInput
                                        label="Start Time"
                                        value={schedule.startTime}
                                        onChange={(time) => handleScheduleStartTimeChange(period.id, schedule.dayOfWeek, time)}
                                        id={`period-${period.id}-${schedule.dayOfWeek}-start`}
                                      />
                                      
                                      <TimeInput
                                        label="End Time"
                                        value={schedule.endTime}
                                        onChange={(time) => handleScheduleEndTimeChange(period.id, schedule.dayOfWeek, time)}
                                        id={`period-${period.id}-${schedule.dayOfWeek}-end`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground mt-2">
                            Select at least one day for this period.
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">School Hours</h2>
              <p className="text-sm text-muted-foreground mb-6">
                These times will help set reminders for your day.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <TimeInput
                    label="School Start Time"
                    value={schoolStart}
                    onChange={setSchoolStart}
                    id="school-start"
                  />
                  
                  <TimeInput
                    label="School End Time"
                    value={schoolEnd}
                    onChange={setSchoolEnd}
                    id="school-end"
                  />
                </div>
                
                <div className="space-y-4">
                  <TimeInput
                    label="When do you usually arrive at school?"
                    value={teacherArrival}
                    onChange={setTeacherArrival}
                    id="teacher-arrival"
                  />
                  
                  <div className="flex items-start mt-2 pt-2">
                    <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                    <p className="text-sm text-muted-foreground">
                      This helps us schedule your reminders when you'll be at school and able to prepare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-teacher-gray/30">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Teacher Reminder</h1>
          <p className="text-muted-foreground">
            Let's set up your school schedule
          </p>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <Button type="button" variant="primary" onClick={goToNextStep}>
              {currentStep === 3 ? "Complete Setup" : "Next"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  currentStep === step ? "bg-teacher-blue" : "bg-teacher-gray"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
