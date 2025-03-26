
import * as React from 'react';
import { OnboardingContextType } from './types';
import { 
  createOnboardingActions, 
  createOnboardingUtilityMethods, 
  getInitialOnboardingState 
} from './utils';

// Verify React is available in this file
console.log("OnboardingContext.tsx - React check:", {
  isReactAvailable: !!React,
  useState: !!React.useState,
  createContext: !!React.createContext
});

// Create the context
const OnboardingContext = React.createContext<OnboardingContextType | undefined>(undefined);

// Custom hook for using the context
export const useOnboarding = () => {
  const context = React.useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Add safety check
  if (!React.useState) {
    console.error("React.useState is not available in OnboardingProvider!");
    throw new Error("React hooks not available");
  }

  const [state, setState] = React.useState(getInitialOnboardingState());
  
  // Create actions and utility methods
  const actions = React.useMemo(() => createOnboardingActions(state, setState), [state]);
  const utilityMethods = React.useMemo(() => createOnboardingUtilityMethods(state, setState), [state]);
  
  // Combine state, actions, and utility methods
  const contextValue = React.useMemo(() => ({
    ...state,
    ...actions,
    ...utilityMethods
  }), [state, actions, utilityMethods]);
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Re-export from index file
export * from './types';
