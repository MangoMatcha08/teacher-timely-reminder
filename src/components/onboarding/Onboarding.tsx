
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek, Period, PeriodSchedule } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import TimeInput from "@/components/shared/TimeInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronDown, Info } from "lucide-react";
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

// Helper to create initial period schedule
const createInitialSchedule = (day: DayOfWeek): PeriodSchedule => ({
  dayOfWeek: day,
  startTime: "9:00 AM",
  endTime: "9:50 AM",
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
      
      // Remove schedules for this day from all periods
      setPeriods(periods.map(period => ({
        ...period,
        schedules: period.schedules.filter(schedule => schedule.dayOfWeek !== day)
      })));
    } else {
      setSelectedDays([...selectedDays, day]);
      
      // Add default schedules for this day to all periods
      setPeriods(periods.map((period, index) => {
        const defaultStartHour = 8 + index;
        const defaultEndHour = defaultStartHour + 1;
        
        return {
          ...period,
          schedules: [
            ...period.schedules,
            {
              dayOfWeek: day,
              startTime: `${defaultStartHour}:00 AM`,
              endTime: `${defaultEndHour}:00 AM`,
            }
          ]
        };
      }));
    }
  };
  
  // Handle period name change
  const handlePeriodNameChange = (id: string, name: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, name } : p)));
  };
  
  // Handle period schedule time changes
  const handleScheduleStartTimeChange = (periodId: string, day: DayOfWeek, time: string) => {
    setPeriods(periods.map(period => {
      if (period.id !== periodId) return period;
      
      const scheduleIndex = period.schedules.findIndex(s => s.dayOfWeek === day);
      
      if (scheduleIndex === -1) {
        // Add new schedule for this day
        return {
          ...period,
          schedules: [...period.schedules, { dayOfWeek: day, startTime: time, endTime: "10:00 AM" }]
        };
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
        // Add new schedule for this day
        return {
          ...period,
          schedules: [...period.schedules, { dayOfWeek: day, startTime: "9:00 AM", endTime: time }]
        };
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
  
  // Add a new period
  const addPeriod = () => {
    const newId = `period-${periods.length + 1}`;
    const newPeriod: Period = {
      id: newId,
      name: `Period ${periods.length + 1}`,
      schedules: selectedDays.map(day => {
        // Get default times based on the last period's schedule for this day
        const lastPeriod = periods[periods.length - 1];
        const lastSchedule = lastPeriod?.schedules.find(s => s.dayOfWeek === day);
        
        if (lastSchedule) {
          try {
            // Parse the end time of the last period
            const [time, meridian] = lastSchedule.endTime.split(" ");
            const [hourStr, minStr] = time.split(":");
            let hour = parseInt(hourStr, 10);
            let min = parseInt(minStr, 10);
            
            // Add 15 minutes for the break
            min += 15;
            if (min >= 60) {
              hour += 1;
              min -= 60;
            }
            
            // Handle hour overflow
            let startMeridian = meridian;
            if (hour > 12) {
              hour -= 12;
              startMeridian = meridian === "AM" ? "PM" : "AM";
            }
            
            const startTime = `${hour}:${min.toString().padStart(2, "0")} ${startMeridian}`;
            
            // Add 50 minutes for the class duration
            min += 50;
            let endHour = hour;
            let endMeridian = startMeridian;
            
            if (min >= 60) {
              endHour += 1;
              min -= 60;
            }
            
            // Handle hour overflow for end time
            if (endHour > 12) {
              endHour -= 12;
              endMeridian = startMeridian === "AM" ? "PM" : "AM";
            }
            
            const endTime = `${endHour}:${min.toString().padStart(2, "0")} ${endMeridian}`;
            
            return {
              dayOfWeek: day,
              startTime,
              endTime
            };
          } catch (e) {
            // If parsing fails, use default values
            return createInitialSchedule(day);
          }
        } else {
          return createInitialSchedule(day);
        }
      })
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
    if (currentStep === 0 && selectedDays.length === 0) {
      toast.error("Please select at least one school day");
      return;
    }
    
    if (currentStep === 1) {
      // Validate periods
      for (const period of periods) {
        if (!period.name.trim()) {
          toast.error("Please provide a name for all periods");
          return;
        }
        
        // Check if each selected day has a schedule
        for (const day of selectedDays) {
          const hasSchedule = period.schedules.some(s => s.dayOfWeek === day);
          if (!hasSchedule) {
            toast.error(`${period.name} is missing a schedule for ${day}`);
            return;
          }
        }
      }
    }
    
    if (currentStep === 2) {
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
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">What's your school day?</h2>
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
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Set up your periods</h2>
                <Button type="button" variant="outline" size="sm" onClick={addPeriod}>
                  Add Period
                </Button>
              </div>
              
              <div className="space-y-6">
                {periods.map((period) => (
                  <Collapsible
                    key={period.id}
                    className="border rounded-lg bg-white overflow-hidden"
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          id={`period-name-${period.id}`}
                          type="text"
                          value={period.name}
                          onChange={(e) => handlePeriodNameChange(period.id, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
                          placeholder="Period Name"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removePeriod(period.id)}
                          className="text-destructive hover:text-destructive/90"
                          disabled={periods.length === 1}
                        >
                          Remove
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-sm text-muted-foreground mb-3">
                          Set the start and end times for this period on each day.
                        </p>
                        
                        <div className="space-y-4">
                          {selectedDays.map((day) => {
                            const schedule = getPeriodSchedule(period.id, day);
                            return (
                              <div key={`${period.id}-${day}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="font-medium flex items-center">
                                  <div className="day-badge day-badge-selected mr-2">
                                    {days.find(d => d.value === day)?.label}
                                  </div>
                                  <span>Schedule</span>
                                </div>
                                
                                <TimeInput
                                  label="Start Time"
                                  value={schedule?.startTime || "9:00 AM"}
                                  onChange={(time) => handleScheduleStartTimeChange(period.id, day, time)}
                                  id={`period-${period.id}-${day}-start`}
                                />
                                
                                <TimeInput
                                  label="End Time"
                                  value={schedule?.endTime || "9:50 AM"}
                                  onChange={(time) => handleScheduleEndTimeChange(period.id, day, time)}
                                  id={`period-${period.id}-${day}-end`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
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
              {currentStep === 2 ? "Complete Setup" : "Next"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((step) => (
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
