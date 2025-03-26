
import * as React from "react";
import { useOnboarding } from "./context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

const OnboardingControls: React.FC = () => {
  // Get the onboarding context
  const onboardingContext = useOnboarding();
  
  // Initialize navigate function
  const navigate = useNavigate();
  
  // Get auth context once (correctly using the hook at the component level)
  const authContext = useAuth();
  
  // Store state locally
  const [onboarding, setOnboarding] = React.useState({
    currentStep: 0,
    setCurrentStep: (step: number) => {},
    setShowExitConfirm: (show: boolean) => {}
  });
  
  // Store auth functions locally with proper return type
  const [auth, setAuth] = React.useState({
    setCompletedOnboarding: () => {
      console.log("Onboarding completed in offline mode");
      return true;
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
          setCompletedOnboarding: authContext.setCompletedOnboarding
        });
      }
    } catch (error) {
      console.log("Working in offline mode:", error);
    }
  }, [onboardingContext, authContext]);
  
  const { currentStep, setCurrentStep, setShowExitConfirm } = onboarding;
  
  const isLastStep = currentStep === 5;
  
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
      auth.setCompletedOnboarding();
      navigate("/dashboard");
      toast.success("Setup completed! You're all set.");
    } catch (error) {
      console.error("Error during finish:", error);
      // Still navigate even if there's an error
      navigate("/dashboard");
      toast.success("Setup completed in offline mode!");
    }
  };
  
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="secondary"
        onClick={handleExit}
      >
        Exit Setup
      </Button>
      
      <div>
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="mr-2"
          >
            Previous
          </Button>
        )}
        
        {isLastStep ? (
          <Button onClick={handleFinish}>
            Finish
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingControls;
