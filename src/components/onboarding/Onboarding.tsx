
import * as React from "react";
import { OnboardingProvider } from "./context/OnboardingContext";
import OnboardingContent from "./OnboardingContent";

// Comprehensive verification that React is available
console.log("Onboarding.tsx - React initialization check:", {
  isReactAvailable: !!React, 
  useState: typeof React.useState === 'function',
  useEffect: typeof React.useEffect === 'function',
  createContext: typeof React.createContext === 'function',
  reactVersion: React.version
});

// Ensure React is available before rendering
const OnboardingComponent: React.FC = () => {
  // Safety check
  if (!React || !React.useState) {
    console.error("React hooks are not available in OnboardingComponent");
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-medium text-red-700">React Error</h2>
        <p className="text-sm text-red-600">React hooks are not available. Please check the console for more details.</p>
      </div>
    );
  }

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
