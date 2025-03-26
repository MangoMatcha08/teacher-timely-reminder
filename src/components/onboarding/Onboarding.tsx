
import * as React from "react";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingContent from "./OnboardingContent";

const OnboardingComponent: React.FC = () => {
  // Add console logs to verify React
  React.useEffect(() => {
    console.log("Onboarding component mounted, React is available");
  }, []);

  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingComponent;
