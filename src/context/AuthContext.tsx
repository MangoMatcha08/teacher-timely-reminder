
import * as React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSchoolSetup, saveSchoolSetup } from "@/services/firebase";
import { SchoolSetup } from "./ReminderContext";

// Add comprehensive React checks
console.log("AuthContext.tsx - React initialization check:", {
  isReactAvailable: !!React,
  reactVersion: React.version,
  useState: !!React.useState,
  useEffect: !!React.useEffect,
  createContext: !!React.createContext
});

// Explicitly define all available methods in the AuthContextType
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  setCompletedOnboarding: () => void;
  resetOnboarding: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithTestAccount: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component - ensure this is a proper function component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Ensure React is properly imported before using hooks
  if (!React || !React.useState) {
    console.error("React or React.useState is not available!", { React });
    // Provide a fallback UI when React hooks aren't available
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-red-600">React Error</h2>
          <p className="mt-2 text-gray-600">
            React hooks are not available. Please refresh the page or check the console for more details.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Now safely use hooks after verification
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);

  // Check for onboarding completion
  React.useEffect(() => {
    console.log("Auth context: Checking onboarding status");
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const schoolSetup = await getSchoolSetup(user.uid);
          setHasCompletedOnboarding(!!schoolSetup);
          console.log("Onboarding status checked:", !!schoolSetup);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setHasCompletedOnboarding(false);
        }
      } else {
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user]);
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", { userId: user?.uid || "no user" });
      setUser(user);
      setIsInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Set onboarding status
  const setCompletedOnboarding = () => {
    console.log("Setting onboarding as completed");
    setHasCompletedOnboarding(true);
  };
  
  // Reset onboarding
  const resetOnboarding = async () => {
    if (user) {
      try {
        await saveSchoolSetup(user.uid, {} as SchoolSetup);
        setHasCompletedOnboarding(false);
        console.log("Onboarding reset successful");
      } catch (error) {
        console.error("Error resetting onboarding:", error);
        throw error;
      }
    }
  };

  // Add stub implementations for required auth methods
  const login = async (email: string, password: string) => {
    console.log("Login method called", { email });
    // Implementation would go here
  };

  const register = async (email: string, password: string) => {
    console.log("Register method called", { email });
    // Implementation would go here
  };

  const loginWithGoogle = async () => {
    console.log("Login with Google method called");
    // Implementation would go here
  };

  const loginWithTestAccount = async () => {
    console.log("Login with test account method called");
    // Implementation would go here
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    hasCompletedOnboarding,
    setCompletedOnboarding,
    resetOnboarding,
    login,
    register,
    loginWithGoogle,
    loginWithTestAccount
  };
  
  console.log("Auth context value prepared:", {
    isAuthenticated: !!user,
    isInitialized,
    hasCompletedOnboarding
  });
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
