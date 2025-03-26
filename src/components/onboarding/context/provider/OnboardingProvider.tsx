
import * as React from 'react';
import { OnboardingContextType, OnboardingState } from '../types';
import { 
  createOnboardingActions, 
  createOnboardingUtilityMethods, 
  getInitialOnboardingState 
} from '../utils';

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

// Provider component with safety checks
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Add safety check
  if (!React || !React.useState) {
    console.error("React.useState is not available in OnboardingProvider!");
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-medium text-red-700">React Error</h2>
        <p className="text-sm text-red-600">React hooks are not available. Please check the console for more details.</p>
      </div>
    );
  }

  const [state, setState] = React.useState<OnboardingState>(getInitialOnboardingState());
  
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
