
import { OnboardingContextType } from "../context/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { ReminderContextType } from "@/context/ReminderContext";

// Define minimal Auth interface needed for this component
interface Auth {
  setCompletedOnboarding: () => true | void;
}

export const finishOnboarding = (
  onboarding: OnboardingContextType,
  auth: Auth,
  saveSchoolSetup: ReminderContextType['saveSchoolSetup'],
  navigate: NavigateFunction
) => {
  // Create term object based on type
  const { 
    schoolYear, 
    termType, 
    termName, 
    selectedDays, 
    periods, 
    categories,
    schoolStart,
    schoolEnd,
    teacherArrival,
    iepMeetingsEnabled,
    iepBeforeSchool,
    iepBeforeSchoolTime,
    iepAfterSchool,
    iepAfterSchoolTime 
  } = onboarding;

  let startDate = new Date();
  let endDate = new Date();
  
  if (termType === "semester") {
    endDate.setMonth(startDate.getMonth() + 5);
  } else if (termType === "quarter") {
    endDate.setMonth(startDate.getMonth() + 2.5);
  } else {
    endDate.setMonth(startDate.getMonth() + 9);
  }
  
  const term = {
    id: "term_default",
    name: termName,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    schoolYear: schoolYear
  };
  
  // Create the school setup object
  const schoolSetup = {
    termId: term.id,
    terms: [term],
    schoolDays: selectedDays,
    periods: periods,
    schoolHours: {
      startTime: schoolStart,
      endTime: schoolEnd,
      teacherArrivalTime: teacherArrival,
    },
    categories: categories,
    iepMeetings: {
      enabled: iepMeetingsEnabled,
      beforeSchool: iepBeforeSchool,
      afterSchool: iepAfterSchool,
      beforeSchoolTime: iepBeforeSchoolTime,
      afterSchoolTime: iepAfterSchoolTime,
    },
  };
  
  // Save school setup
  saveSchoolSetup(schoolSetup);
  
  // Mark onboarding as completed
  auth.setCompletedOnboarding();
  
  // Navigate to dashboard and show success message
  navigate("/dashboard");
  toast.success("Setup completed! You're all set.");
};
