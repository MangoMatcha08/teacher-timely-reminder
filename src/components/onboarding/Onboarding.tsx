
import * as React from "react";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingContent from "./OnboardingContent";

// Verify React is available in this file
console.log("Onboarding.tsx - React check:", {
  isReactAvailable: !!React, 
  useState: !!React.useState,
  useEffect: !!React.useEffect
});

const OnboardingComponent: React.FC = () => {
  // Add debugging to verify React hooks
  React.useEffect(() => {
    console.log("Onboarding component mounted, React hooks working properly");
  }, []);

  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingComponent;
