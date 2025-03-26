
import * as React from "react";
import { useOnboarding } from "./context";
import StepIndicator from "./StepIndicator";
import OnboardingControls from "./OnboardingControls";
import ExitDialog from "./ExitDialog";
import StepRenderer from "./StepRenderer";

// Add verification that React is available
console.log("OnboardingContent.tsx - React check:", {
  isReactAvailable: !!React, 
  useState: !!React.useState,
  useEffect: !!React.useEffect
});

const OnboardingContent: React.FC = () => {
  // Add safety check for React
  if (!React || !React.useState) {
    console.error("React hooks are not available in OnboardingContent");
    return <div>Error: React hooks not available</div>;
  }
  
  const { currentStep, showExitConfirm, setShowExitConfirm } = useOnboarding();
  
  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-6">
        <StepIndicator currentStep={currentStep} totalSteps={6} />
        <div className="mt-8">
          <StepRenderer />
        </div>
        <OnboardingControls />
      </div>
      
      <ExitDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
      />
    </div>
  );
};

export default OnboardingContent;
