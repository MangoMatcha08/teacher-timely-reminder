
import * as React from 'react';
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReminders } from "@/context/ReminderContext";
import { createDefaultTerm } from './OnboardingUtils';
import { useOnboarding } from './context/OnboardingContext';

const OnboardingControls: React.FC = () => {
  const navigate = useNavigate();
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
  const onboarding = useOnboarding();
  const { 
    currentStep, 
    setCurrentStep, 
    setShowExitConfirm, 
    schoolYear, 
    termName, 
    selectedDays, 
    periods, 
    categories, 
    termType,
    schoolStart,
    schoolEnd,
    teacherArrival,
    iepMeetingsEnabled,
    iepBeforeSchool,
    iepBeforeSchoolTime,
    iepAfterSchool,
    iepAfterSchoolTime,
    setCategories
  } = onboarding;
  
  const goToNextStep = () => {
    if (currentStep === 0) {
      if (!schoolYear.trim() || !termName.trim()) {
        toast.error("Please provide both school year and term name");
        return;
      }
    }
    
    if (currentStep === 1) {
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
      if (categories.length === 0) {
        toast.error("Please add at least one category");
        return;
      }
    }
    
    if (currentStep === 5) {
      if (!schoolStart || !schoolEnd || !teacherArrival) {
        toast.error("Please provide all school hours information");
        return;
      }
      
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
      
      if (iepMeetingsEnabled && !categories.includes("IEP meetings")) {
        setCategories([...categories, "IEP meetings"]);
      }
      
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
      
      setCompleteOnboarding();
      
      navigate("/dashboard");
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const goToPreviousStep = () => {
    if (currentStep === 0) {
      setShowExitConfirm(true);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex justify-between border-t p-6">
      <Button
        type="button"
        variant="outline"
        onClick={goToPreviousStep}
      >
        Back
      </Button>
      <Button type="button" variant="primary" onClick={goToNextStep}>
        {currentStep === 5 ? "Complete Setup" : "Next"}
      </Button>
    </div>
  );
};

export default OnboardingControls;
