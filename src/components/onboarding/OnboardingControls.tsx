
import * as React from "react";
import { useOnboardingControls } from "./hooks/useOnboardingControls";
import { createControlActions } from "./utils/controlActions";
import { ExitButton, NavigationButtons } from "./controls/ControlButtons";

const OnboardingControls: React.FC = () => {
  // Use our custom hook to get all the necessary state and contexts
  const { onboardingContext, onboarding, auth, reminders, navigate } = useOnboardingControls();
  
  const { currentStep, setCurrentStep, setShowExitConfirm } = onboarding;
  
  const isLastStep = currentStep === 5;
  
  // Create control action handlers
  const { handleNext, handlePrevious, handleExit, handleFinish } = createControlActions(
    currentStep,
    setCurrentStep,
    setShowExitConfirm,
    onboardingContext,
    auth,
    reminders,
    navigate
  );
  
  return (
    <div className="flex justify-between mt-8">
      <ExitButton onClick={handleExit} />
      
      <NavigationButtons 
        currentStep={currentStep}
        isLastStep={isLastStep}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFinish={handleFinish}
      />
    </div>
  );
};

export default OnboardingControls;
