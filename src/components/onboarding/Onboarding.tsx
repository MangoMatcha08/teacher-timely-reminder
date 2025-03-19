
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders, DayOfWeek, Period } from "@/context/ReminderContext";
import Button from "@/components/shared/Button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/shared/Card";
import TimeInput from "@/components/shared/TimeInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [periods, setPeriods] = useState<Period[]>([
    { id: "period-1", name: "First Period", startTime: "9:00 AM", endTime: "9:50 AM" },
    { id: "period-2", name: "Second Period", startTime: "10:05 AM", endTime: "10:55 AM" },
  ]);
  
  const days: { label: string; value: DayOfWeek }[] = [
    { label: "M", value: "M" },
    { label: "T", value: "T" },
    { label: "W", value: "W" },
    { label: "Th", value: "Th" },
    { label: "F", value: "F" },
  ];
  
  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  
  const handlePeriodNameChange = (id: string, name: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, name } : p)));
  };
  
  const handlePeriodStartTimeChange = (id: string, time: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, startTime: time } : p)));
  };
  
  const handlePeriodEndTimeChange = (id: string, time: string) => {
    setPeriods(periods.map((p) => (p.id === id ? { ...p, endTime: time } : p)));
  };
  
  const addPeriod = () => {
    const newId = `period-${periods.length + 1}`;
    const lastPeriod = periods[periods.length - 1];
    
    // Calculate default times based on the last period
    let defaultStartTime = "8:00 AM";
    let defaultEndTime = "8:50 AM";
    
    if (lastPeriod) {
      // Parse the end time of the last period
      try {
        const [time, meridian] = lastPeriod.endTime.split(" ");
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
        
        defaultStartTime = `${hour}:${min.toString().padStart(2, "0")} ${startMeridian}`;
        
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
        
        defaultEndTime = `${endHour}:${min.toString().padStart(2, "0")} ${endMeridian}`;
      } catch (e) {
        // If parsing fails, use default values
      }
    }
    
    setPeriods([
      ...periods,
      {
        id: newId,
        name: `Period ${periods.length + 1}`,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
      },
    ]);
  };
  
  const removePeriod = (id: string) => {
    if (periods.length > 1) {
      setPeriods(periods.filter((p) => p.id !== id));
    } else {
      toast.error("You need at least one period");
    }
  };
  
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
      }
      
      // Save school setup
      saveSchoolSetup({
        schoolDays: selectedDays,
        periods,
      });
      
      // Mark onboarding as complete
      setCompleteOnboarding();
      
      // Navigate to dashboard
      navigate("/dashboard");
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
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
              
              <div className="space-y-4">
                {periods.map((period, index) => (
                  <div
                    key={period.id}
                    className="p-4 rounded-lg border grid grid-cols-1 md:grid-cols-4 gap-4 bg-white"
                  >
                    <div>
                      <label
                        htmlFor={`period-name-${period.id}`}
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Period Name
                      </label>
                      <input
                        id={`period-name-${period.id}`}
                        type="text"
                        value={period.name}
                        onChange={(e) => handlePeriodNameChange(period.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teacher-blue"
                        placeholder="Period Name"
                      />
                    </div>
                    
                    <TimeInput
                      label="Start Time"
                      value={period.startTime}
                      onChange={(time) => handlePeriodStartTimeChange(period.id, time)}
                      id={`period-start-${period.id}`}
                    />
                    
                    <TimeInput
                      label="End Time"
                      value={period.endTime}
                      onChange={(time) => handlePeriodEndTimeChange(period.id, time)}
                      id={`period-end-${period.id}`}
                    />
                    
                    <div className="flex items-end justify-end h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removePeriod(period.id)}
                        className="text-destructive hover:text-destructive/90"
                        disabled={periods.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
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
              {currentStep === 1 ? "Complete Setup" : "Next"}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-center">
          <div className="flex gap-2">
            {[0, 1].map((step) => (
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
