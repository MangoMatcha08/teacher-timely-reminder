
import * as React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSchoolSetup, saveSchoolSetup } from "@/services/firebase";
import { SchoolSetup } from "./ReminderContext";
import { useNavigate } from "react-router-dom";

// Verify React is available in this file
console.log("AuthContext.tsx - React check:", {
  isReactAvailable: !!React,
  useState: !!React.useState,
  createContext: !!React.createContext
});

// Explicitly check for React hooks
if (!React || !React.useState || !React.createContext) {
  console.error("Critical: React hooks not available in AuthContext");
  throw new Error("React or React hooks not available");
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  setCompletedOnboarding: (completed: boolean) => void;
  resetOnboarding: () => void;
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

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    // Add safety checks
    if (!React.useState) {
      console.error("React.useState is not available in AuthProvider!");
      throw new Error("React.useState is not available");
    }

    const [user, setUser] = React.useState<User | null>(null);
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
    
    // Check for onboarding completion
    React.useEffect(() => {
      const checkOnboardingStatus = async () => {
        if (user) {
          try {
            const schoolSetup = await getSchoolSetup(user.uid);
            setHasCompletedOnboarding(!!schoolSetup);
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
        setUser(user);
        setIsInitialized(true);
        console.log("Auth state changed:", { user: user?.uid || "no user" });
      });
      
      return () => unsubscribe();
    }, []);
    
    // Set onboarding status
    const setCompletedOnboarding = (completed: boolean) => {
      setHasCompletedOnboarding(completed);
    };
    
    // Reset onboarding
    const resetOnboarding = async () => {
      if (user) {
        try {
          await saveSchoolSetup(user.uid, {} as SchoolSetup);
          setHasCompletedOnboarding(false);
        } catch (error) {
          console.error("Error resetting onboarding:", error);
          throw error;
        }
      }
    };
    
    const value = {
      user,
      isAuthenticated: !!user,
      isInitialized,
      hasCompletedOnboarding,
      setCompletedOnboarding,
      resetOnboarding
    };
    
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error("Critical error in AuthProvider:", error);
    
    // Render error fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">
            There was a problem with the authentication system. Please refresh the page.
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
};
