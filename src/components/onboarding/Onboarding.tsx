
import React from "react";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingContent from "./OnboardingContent";

const OnboardingComponent = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingComponent;
