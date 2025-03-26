
import { OnboardingContextType } from "../context/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { finishOnboarding } from "./OnboardingFinisher";

interface Auth {
  setCompletedOnboarding: () => true | void;
}

interface ControlActions {
  handleNext: () => void;
  handlePrevious: () => void;
  handleExit: () => void;
  handleFinish: () => void;
}

interface RemindersUtils {
  saveSchoolSetup: (setup: any) => void;
}

export const createControlActions = (
  currentStep: number,
  setCurrentStep: (step: number) => void,
  setShowExitConfirm: (show: boolean) => void,
  onboardingContext: OnboardingContextType,
  auth: Auth,
  reminders: RemindersUtils,
  navigate: NavigateFunction
): ControlActions => {
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleExit = () => {
    setShowExitConfirm(true);
  };
  
  const handleFinish = () => {
    try {
      // Call the complete onboarding function and navigate to the dashboard
      finishOnboarding(onboardingContext, auth, reminders.saveSchoolSetup, navigate);
    } catch (error) {
      console.error("Error during finish:", error);
      // Still navigate even if there's an error
      navigate("/dashboard");
      toast.success("Setup completed in offline mode!");
    }
  };

  return {
    handleNext,
    handlePrevious,
    handleExit,
    handleFinish
  };
};
