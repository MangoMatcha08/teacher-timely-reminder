
import * as React from "react";
import { useOnboarding } from "../context";
import { useAuth } from "@/context/auth";
import { useReminders } from "@/context/ReminderContext";
import { useNavigate } from "react-router-dom";

// Custom hook to provide all the necessary state and handlers for onboarding controls
export const useOnboardingControls = () => {
  // Get the onboarding context
  const onboardingContext = useOnboarding();
  
  // Initialize navigate function
  const navigate = useNavigate();
  
  // Get auth context once (correctly using the hook at the component level)
  const authContext = useAuth();
  const reminderContext = useReminders();
  
  // Store state locally
  const [onboarding, setOnboarding] = React.useState({
    currentStep: 0,
    setCurrentStep: (step: number) => {},
    setShowExitConfirm: (show: boolean) => {}
  });
  
  // Store auth functions locally with proper return type
  const [auth, setAuth] = React.useState({
    // Ensure this always returns true to match the interface type
    setCompletedOnboarding: (): true => {
      console.log("Onboarding completed in offline mode");
      return true;
    }
  });

  const [reminders, setReminders] = React.useState({
    saveSchoolSetup: (setup: any) => {
      console.log("School setup saved in offline mode", setup);
    }
  });
  
  // Load actual contexts when available (without calling hooks inside)
  React.useEffect(() => {
    try {
      if (onboardingContext) {
        setOnboarding({
          currentStep: onboardingContext.currentStep || 0,
          setCurrentStep: onboardingContext.setCurrentStep || ((step: number) => {}),
          setShowExitConfirm: onboardingContext.setShowExitConfirm || ((show: boolean) => {})
        });
      }
      
      if (authContext && authContext.setCompletedOnboarding) {
        setAuth({
          // Use a wrapper function to ensure true is always returned
          setCompletedOnboarding: (): true => {
            authContext.setCompletedOnboarding();
            return true;
          }
        });
      }

      if (reminderContext && reminderContext.saveSchoolSetup) {
        setReminders({
          saveSchoolSetup: reminderContext.saveSchoolSetup
        });
      }
    } catch (error) {
      console.log("Working in offline mode:", error);
    }
  }, [onboardingContext, authContext, reminderContext]);
  
  return {
    onboardingContext,
    onboarding,
    auth,
    reminders,
    navigate
  };
};
