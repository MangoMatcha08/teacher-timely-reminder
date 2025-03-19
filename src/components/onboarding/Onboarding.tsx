
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek, Period, PeriodSchedule, Term } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import TimeInput from "@/components/shared/TimeInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Check, ChevronDown, Info, Plus, Trash2, Calendar, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Input,
} from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Helper to create initial period schedule
const createInitialSchedule = (day: DayOfWeek, startTime = "9:00 AM", endTime = "9:50 AM"): PeriodSchedule => ({
  dayOfWeek: day,
  startTime,
  endTime,
});

const createDefaultTerm = (schoolYear: string, termType: string, termName: string): Term => {
  const now = new Date();
  const endDate = new Date();
  
  // Set end date based on term type
  if (termType === "quarter") {
    endDate.setMonth(now.getMonth() + 3); // Quarter (3 months)
  } else if (termType === "semester") {
    endDate.setMonth(now.getMonth() + 5); // Semester (5 months)
  } else {
    endDate.setMonth(now.getMonth() + 10); // Full year (10 months)
  }
  
  return {
    id: "term_default",
    name: termName,
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    schoolYear: schoolYear
  };
};

type TermType = "quarter" | "semester" | "year";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  
  // Updated term state
  const [schoolYear, setSchoolYear] = useState(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
  const [termType, setTermType] = useState<TermType>("semester");
  const [termName, setTermName] = useState("Fall Semester");
  
  // School hours state
  const [schoolStart, setSchoolStart] = useState("8:00 AM");
  const [schoolEnd, setSchoolEnd] = useState("3:00 PM");
  const [teacherArrival, setTeacherArrival] = useState("7:30 AM");
  
  // IEP Meeting settings
  const [iepMeetingsEnabled, setIepMeetingsEnabled] = useState(false);
  const [iepBeforeSchool, setIepBeforeSchool] = useState(false);
  const [iepBeforeSchoolTime, setIepBeforeSchoolTime] = useState("7:00 AM");
  const [iepAfterSchool, setIepAfterSchool] = useState(false);
  const [iepAfterSchoolTime, setIepAfterSchoolTime] = useState("3:30 PM");
  
  // Categories state
  const [categories, setCategories] = useState([
    "Materials/Set up",
    "Student support",
    "School events",
    "Instruction",
    "Administrative tasks"
  ]);
  
  // Custom day schedule visibility controls
  const [customScheduleVisibility, setCustomScheduleVisibility] = useState<Record<string, boolean>>({});
  
  // Toggle custom schedule visibility for a specific period
  const toggleCustomScheduleVisibility = (periodId: string) => {
    setCustomScheduleVisibility(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };
  
  // Updated periods state with day-specific schedules
  const [periods, setPeriods] = useState<Period[]>([
    { 
      id: "period-1", 
      name: "Period 1", 
      schedules: [] 
    },
    { 
      id: "period-2", 
      name: "Period 2", 
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
      
      // Remove this day from all periods' schedules
      setPeriods(periods.map(period => ({
        ...period,
        schedules: period.schedules.filter(s => s.dayOfWeek !== day)
      })));
    } else {
      setSelectedDays([...selectedDays, day]);
      
      // Add default schedules for this day to all periods
      setPeriods(periods.map(period => {
        if (period.schedules.length > 0) {
          // Use the first schedule's times as default
          const defaultSchedule = period.schedules[0];
          return {
            ...period,
            schedules: [
              ...period.schedules,
              {
                dayOfWeek: day,
                startTime: defaultSchedule ? defaultSchedule.startTime : "9:00 AM",
                endTime: defaultSchedule ? defaultSchedule.endTime : "9:50 AM"
              }
            ]
          };
        } else {
          // No schedules yet, add a default one
          return {
            ...period,
            schedules: [{
              dayOfWeek: day,
              startTime: "9:00 AM",
              endTime: "9:50 AM"
            }]
          };
        }
      }));
    }
  };
  
  // Handle period name change - always format as "Period X"
  const handlePeriodNameChange = (id: string, rawName: string) => {
    // Extract number if possible, otherwise use the raw name
    let formattedName = rawName;
    if (!rawName.toLowerCase().startsWith("period")) {
      // Try to extract a number
      const numberMatch = rawName.match(/\d+/);
      if (numberMatch) {
        formattedName = `Period ${numberMatch[0]}`;
      } else {
        formattedName = `Period ${rawName}`;
      }
    }
    
    setPeriods(periods.map((p) => (p.id === id ? { ...p, name: formattedName } : p)));
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
    
    // Add schedules for all selected days
    if (selectedDays.length > 0 && periods.length > 0 && periods[0].schedules.length > 0) {
      // Use the first period's schedules as a template
      const templatePeriod = periods[0];
      newPeriod.schedules = selectedDays.map(day => {
        const templateSchedule = templatePeriod.schedules.find(s => s.dayOfWeek === day);
        return templateSchedule
          ? { ...templateSchedule, dayOfWeek: day }
          : createInitialSchedule(day);
      });
    } else {
      // No template available, create default schedules
      newPeriod.schedules = selectedDays.map(day => createInitialSchedule(day));
    }
    
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
  
  // Add a new category
  const addCategory = () => {
    setCategories([...categories, `Category ${categories.length + 1}`]);
  };
  
  // Update a category
  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };
  
  // Remove a category
  const removeCategory = (index: number) => {
    if (categories.length > 1) {
      setCategories(categories.filter((_, i) => i !== index));
    } else {
      toast.error("You need at least one category");
    }
  };
  
  // Toggle custom schedule for a specific day and period
  const toggleCustomSchedule = (periodId: string, day: DayOfWeek, isCustom: boolean) => {
    const period = periods.find(p => p.id === periodId);
    if (!period) return;
    
    if (isCustom) {
      // Keep the current schedule as is (it's already different)
      return;
    } else {
      // Reset this day to match the first day's schedule
      const firstDay = period.schedules.find(s => s.dayOfWeek !== day)?.dayOfWeek;
      if (!firstDay) return;
      
      const templateSchedule = period.schedules.find(s => s.dayOfWeek === firstDay);
      if (!templateSchedule) return;
      
      setPeriods(periods.map(p => {
        if (p.id !== periodId) return p;
        
        const updatedSchedules = p.schedules.map(s => {
          if (s.dayOfWeek === day) {
            return {
              ...s,
              startTime: templateSchedule.startTime,
              endTime: templateSchedule.endTime
            };
          }
          return s;
        });
        
        return {
          ...p,
          schedules: updatedSchedules
        };
      }));
    }
  };
  
  // Check if a day has a custom schedule different from the default
  const hasCustomSchedule = (periodId: string, day: DayOfWeek): boolean => {
    const period = periods.find(p => p.id === periodId);
    if (!period || period.schedules.length <= 1) return false;
    
    const schedule = period.schedules.find(s => s.dayOfWeek === day);
    if (!schedule) return false;
    
    // Find the first schedule that's not this day to compare with
    const otherSchedule = period.schedules.find(s => s.dayOfWeek !== day);
    if (!otherSchedule) return false;
    
    return schedule.startTime !== otherSchedule.startTime || 
           schedule.endTime !== otherSchedule.endTime;
  };
  
  // Update term name based on term type selection
  const updateTermNameFromType = (type: TermType) => {
    if (type === 'quarter') {
      setTermName('Quarter 1');
    } else if (type === 'semester') {
      setTermName('Fall Semester');
    } else {
      setTermName('Full Year');
    }
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === 0) {
      // Validate term
      if (!schoolYear.trim() || !termName.trim()) {
        toast.error("Please provide both school year and term name");
        return;
      }
    }
    
    if (currentStep === 1) {
      // Validate periods
      for (const period of periods) {
        if (!period.name.trim()) {
          toast.error("Please provide a name for all periods");
          return;
        }
      }
    }
    
    if (currentStep === 2 && selectedDays.length === 0) {
      toast.error("Please select at least one school day");
      return;
    }
    
    if (currentStep === 3) {
      // Validate schedules
      let missingSchedules = false;
      for (const period of periods) {
        if (period.schedules.length === 0) {
          toast.error(`${period.name} needs to be scheduled on at least one day`);
          missingSchedules = true;
          break;
        }
      }
      
      if (missingSchedules) {
        return;
      }
    }
    
    if (currentStep === 4) {
      // Validate categories
      if (categories.length === 0) {
        toast.error("Please add at least one category");
        return;
      }
    }
    
    if (currentStep === 5) {
      // Validate school hours
      if (!schoolStart || !schoolEnd || !teacherArrival) {
        toast.error("Please provide all school hours information");
        return;
      }
      
      // Validate IEP meeting times if enabled
      if (iepMeetingsEnabled) {
        if (iepBeforeSchool && !iepBeforeSchoolTime) {
          toast.error("Please provide a time for before-school IEP meetings");
          return;
        }
        if (iepAfterSchool && !iepAfterSchoolTime) {
          toast.error("Please provide a time for after-school IEP meetings");
          return;
        }
      }
      
      // Add IEP Meetings category if enabled
      if (iepMeetingsEnabled && !categories.includes("IEP meetings")) {
        setCategories([...categories, "IEP meetings"]);
      }
      
      // Save school setup
      const defaultTerm = createDefaultTerm(schoolYear, termType, termName);
      
      saveSchoolSetup({
        termId: defaultTerm.id,
        terms: [defaultTerm],
        schoolDays: selectedDays,
        periods,
        schoolHours: {
          startTime: schoolStart,
          endTime: schoolEnd,
          teacherArrivalTime: teacherArrival
        },
        categories: categories,
        iepMeetings: {
          enabled: iepMeetingsEnabled,
          beforeSchool: iepBeforeSchool,
          afterSchool: iepAfterSchool,
          beforeSchoolTime: iepBeforeSchoolTime,
          afterSchoolTime: iepAfterSchoolTime
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
  
  // Render different steps
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">Set Up Your School Year</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter your school year and select your term structure.
              </p>
              
              <div className="space-y-4 bg-white p-6 rounded-lg border">
                <div className="space-y-3">
                  <label className="text-sm font-medium">School Year</label>
                  <Input
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    placeholder="e.g., 2023-2024"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format as YYYY-YYYY (e.g., 2023-2024)
                  </p>
                </div>
                
                <div className="space-y-3 pt-4 border-t mt-4">
                  <label className="text-sm font-medium">Term Structure</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTermType("quarter");
                        updateTermNameFromType("quarter");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                        termType === "quarter" 
                          ? "bg-teacher-blue/10 border-teacher-blue" 
                          : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <span className="text-sm font-medium">Quarter</span>
                      <span className="text-xs text-muted-foreground mt-1">3 months</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setTermType("semester");
                        updateTermNameFromType("semester");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                        termType === "semester" 
                          ? "bg-teacher-blue/10 border-teacher-blue" 
                          : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <span className="text-sm font-medium">Semester</span>
                      <span className="text-xs text-muted-foreground mt-1">5 months</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setTermType("year");
                        updateTermNameFromType("year");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-lg border transition-colors",
                        termType === "year" 
                          ? "bg-teacher-blue/10 border-teacher-blue" 
                          : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <span className="text-sm font-medium">Year-Round</span>
                      <span className="text-xs text-muted-foreground mt-1">Full year</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t mt-4">
                  <label className="text-sm font-medium">Term Name</label>
                  <Select
                    value={termName}
                    onValueChange={setTermName}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select term name" />
                    </SelectTrigger>
                    <SelectContent>
                      {termType === "quarter" ? (
                        <>
                          <SelectItem value="Quarter 1">Quarter 1</SelectItem>
                          <SelectItem value="Quarter 2">Quarter 2</SelectItem>
                          <SelectItem value="Quarter 3">Quarter 3</SelectItem>
                          <SelectItem value="Quarter 4">Quarter 4</SelectItem>
                        </>
                      ) : termType === "semester" ? (
                        <>
                          <SelectItem value="Fall Semester">Fall Semester</SelectItem>
                          <SelectItem value="Spring Semester">Spring Semester</SelectItem>
                        </>
                      ) : (
                        <SelectItem value="Full Year">Full Year</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-start mt-4 pt-4 border-t">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-2" />
                  <p className="text-sm text-muted-foreground">
                    You'll be able to create additional terms and switch between them after completing setup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">Create your class periods</h2>
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
      case 2:
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
      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">Schedule your periods</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Set the times for each period. Most days follow the same schedule, but you can customize exceptions.
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
                        {/* Default Period Time Block */}
                        {selectedDays.length > 0 && (
                          <div className="p-4 border rounded-md bg-gray-50 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-medium">Default Period Time</h5>
                              <div className="text-xs text-muted-foreground">
                                Set once and apply to all days
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TimeInput
                                label="Start Time"
                                value={period.schedules.length > 0 ? period.schedules[0].startTime : "9:00 AM"}
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
                                value={period.schedules.length > 0 ? period.schedules[0].endTime : "9:50 AM"}
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
                        
                        {/* Custom day schedules - now as a collapsible section */}
                        <Collapsible
                          className="border rounded-md"
                          open={customScheduleVisibility[period.id]}
                          onOpenChange={() => toggleCustomScheduleVisibility(period.id)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h5 className="text-sm font-medium">Custom Day Schedules</h5>
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-transform",
                              customScheduleVisibility[period.id] ? "rotate-90" : ""
                            )} />
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent className="p-3 space-y-3">
                            <p className="text-xs text-muted-foreground mb-2">
                              Enable custom schedules for days that differ from the default
                            </p>
                            
                            {selectedDays.map((day) => {
                              const isCustom = hasCustomSchedule(period.id, day);
                              const dayLabel = days.find(d => d.value === day)?.label;
                              
                              return (
                                <div key={`${period.id}-${day}-schedule`} 
                                    className="border rounded-md bg-white overflow-hidden">
                                  <div className="flex items-center justify-between border-b px-4 py-2 bg-gray-50">
                                    <div className="flex items-center">
                                      <div className="day-badge day-badge-selected mr-2">
                                        {dayLabel}
                                      </div>
                                      <h5 className="text-sm font-medium">
                                        {dayLabel} Schedule
                                      </h5>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-muted-foreground mr-2">
                                        Custom schedule
                                      </div>
                                      <Switch
                                        checked={isCustom}
                                        onCheckedChange={(checked) => {
                                          if (!checked && isCustom) {
                                            toggleCustomSchedule(period.id, day, isCustom);
                                          } else if (checked && !isCustom) {
                                            // If turning on custom schedule, make a small change to differentiate
                                            const schedule = period.schedules.find(s => s.dayOfWeek === day);
                                            if (schedule) {
                                              // Add 5 minutes to end time to make it different
                                              const [hourStr, minuteStr] = schedule.endTime.split(':');
                                              const [minutes, meridian] = minuteStr.split(' ');
                                              let hour = parseInt(hourStr);
                                              let minute = parseInt(minutes) + 5;
                                              if (minute >= 60) {
                                                minute = 0;
                                                hour = (hour % 12) + 1;
                                              }
                                              const newEndTime = `${hour}:${minute.toString().padStart(2, '0')} ${meridian}`;
                                              handleScheduleEndTimeChange(period.id, day, newEndTime);
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  
                                  {isCustom && (
                                    <div className="p-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <TimeInput
                                          label="Start Time"
                                          value={period.schedules.find(s => s.dayOfWeek === day)?.startTime || "9:00 AM"}
                                          onChange={(time) => handleScheduleStartTimeChange(period.id, day, time)}
                                          id={`period-${period.id}-${day}-start`}
                                        />
                                        
                                        <TimeInput
                                          label="End Time"
                                          value={period.schedules.find(s => s.dayOfWeek === day)?.endTime || "9:50 AM"}
                                          onChange={(time) => handleScheduleEndTimeChange(period.id, day, time)}
                                          id={`period-${period.id}-${day}-end`}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-lg font-medium mb-4">Reminder Categories</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create categories to help organize your reminders.
              </p>
              
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3 border rounded-lg p-4 bg-white">
                    <div className="flex-1">
                      <Input
                        value={category}
                        onChange={(e) => updateCategory(index, e.target.value)}
                        className="w-full"
                        placeholder="Category Name"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeCategory(index)}
                      className="text-destructive hover:text-destructive/90"
                      disabled={categories.length === 1}
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
                  onClick={addCategory}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Category
                </Button>
              </div>
            </div>
          </div>
        );
      case 5:
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
              
              {/* IEP meeting settings */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">IEP Meeting Settings</h3>
                  <Switch 
                    checked={iepMeetingsEnabled}
                    onCheckedChange={setIepMeetingsEnabled}
                  />
                </div>
                
                {iepMeetingsEnabled && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      When do you typically hold IEP meetings?
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="iep-before-school"
                            checked={iepBeforeSchool}
                            onChange={(e) => setIepBeforeSchool(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor="iep-before-school" className="text-sm">
                            Before school
                          </label>
                        </div>
                        
                        {iepBeforeSchool && (
                          <div className="w-32">
                            <TimeInput
                              label=""
                              value={iepBeforeSchoolTime}
                              onChange={setIepBeforeSchoolTime}
                              id="iep-before-time"
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="iep-after-school"
                            checked={iepAfterSchool}
                            onChange={(e) => setIepAfterSchool(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <label htmlFor="iep-after-school" className="text-sm">
                            After school
                          </label>
                        </div>
                        
                        {iepAfterSchool && (
                          <div className="w-32">
                            <TimeInput
                              label=""
                              value={iepAfterSchoolTime}
                              onChange={setIepAfterSchoolTime}
                              id="iep-after-time"
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
      <div className="w-full max-w-4xl mx-auto space-y-6">
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
          <CardContent className="px-6">{renderStep()}</CardContent>
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
              {currentStep === 5 ? "Complete Setup" : "Next"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((step) => (
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

