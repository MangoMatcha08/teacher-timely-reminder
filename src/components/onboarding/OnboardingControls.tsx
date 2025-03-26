import * as React from "react";
import { useOnboarding } from "./context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Add verification that React is available
console.log("OnboardingControls.tsx - React check:", {
  isReactAvailable: !!React,
  useState: !!React.useState
});

const OnboardingControls: React.FC = () => {
  const onboarding = useOnboarding();
  const { currentStep, setCurrentStep, setShowExitConfirm } = onboarding;
  const navigate = useNavigate();

  // Use the correct method name from auth context
  const auth = useAuth();
  
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
    // Call the complete onboarding function and navigate to the dashboard
    auth.setCompletedOnboarding();
    navigate("/dashboard");
    toast.success("Setup completed! You're all set.");
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
