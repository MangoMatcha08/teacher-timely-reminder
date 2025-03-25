
import React from 'react';
import Button from "@/components/shared/Button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { useReminders } from "@/context/ReminderContext";
import { createDefaultTerm } from './OnboardingUtils';
import { useOnboarding } from './OnboardingContext';
import { SchoolSetup, ReminderPriority } from '@/types';

const OnboardingControls: React.FC = () => {
  const navigate = useNavigate();
  const { setCompleteOnboarding } = useAuth();
  const { saveSchoolSetup } = useReminders();
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
  } = useOnboarding();
  
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
      
      // Final step - save the school setup
      const userId = "current-user"; // In a real app, this would come from authentication
      
      const term = createDefaultTerm(termType, termName, schoolYear);
      
      const schoolSetupData: SchoolSetup = {
        userId,
        schoolName: "My School", // This could be collected in an earlier step
        schoolYear,
        terms: [term],
        periods,
        days: selectedDays,
        categories,
        schoolDays: selectedDays,
        notificationPreferences: {
          email: {
            enabled: true,
            address: "user@example.com", // This could be collected elsewhere
            minPriority: ReminderPriority.Medium
          },
          push: {
            enabled: false,
            minPriority: ReminderPriority.High
          },
          text: {
            enabled: false,
            phoneNumber: "",
            minPriority: ReminderPriority.High
          }
        }
      };
      
      saveSchoolSetup(schoolSetupData, userId)
        .then(() => {
          toast.success("School setup saved successfully!");
          setCompleteOnboarding();
          navigate("/dashboard");
        })
        .catch(error => {
          toast.error("Failed to save school setup");
          console.error("Error saving school setup:", error);
        });
        
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const goToPreviousStep = () => {
    if (currentStep === 0) {
      setShowExitConfirm(true);
      return;
    }
    
    setCurrentStep(currentStep - 1);
  };
  
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={goToPreviousStep}
        className="px-4"
      >
        {currentStep === 0 ? "Exit" : "Back"}
      </Button>
      
      <Button
        variant="primary"
        onClick={goToNextStep}
        className="px-6"
      >
        {currentStep === 5 ? "Finish" : "Next"}
      </Button>
    </div>
  );
};

export default OnboardingControls;
