
import * as React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getSchoolSetup, saveSchoolSetup } from "@/services/firebase";
import { SchoolSetup } from "./ReminderContext";

// Create React context with offline fallbacks
const AuthContext = React.createContext({
  user: null,
  isAuthenticated: false,
  isInitialized: true,
  hasCompletedOnboarding: false,
  setCompletedOnboarding: () => true,
  resetOnboarding: async () => {},
  login: async (email: string, password: string) => {},
  register: async (email: string, password: string) => {},
  loginWithGoogle: async () => {},
  loginWithTestAccount: async () => {}
});

// Custom hook to use the auth context with error handling
export const useAuth = () => {
  // This hook must only be called inside a component function
  const context = React.useContext(AuthContext);
  
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    // Return fallback object with same shape
    return {
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      hasCompletedOnboarding: false,
      setCompletedOnboarding: () => true,
      resetOnboarding: async () => {},
      login: async (email: string, password: string) => {},
      register: async (email: string, password: string) => {},
      loginWithGoogle: async () => {},
      loginWithTestAccount: async () => {}
    };
  }
  
  return context;
};

// Component declaration - ensures React hooks can only be used inside component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);
  
  // Set a timeout to switch to offline mode if firebase auth doesn't initialize quickly
  React.useEffect(() => {
    const offlineTimer = setTimeout(() => {
      if (!isInitialized) {
        console.info("Auth initialization timed out - switching to offline mode");
        setIsInitialized(true);
        setOfflineMode(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(offlineTimer);
  }, [isInitialized]);

  // Check for onboarding completion
  React.useEffect(() => {
    if (offlineMode) return;
    
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
  }, [user, offlineMode]);
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up auth state listener");
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", { userId: user?.uid || "no user" });
        setUser(user);
        setIsInitialized(true);
      });
    } catch (error) {
      console.error("Error in auth state listener:", error);
      setIsInitialized(true);
      setOfflineMode(true);
    }
    
    return () => unsubscribe();
  }, []);
  
  // Set onboarding status - fixed return type to match context definition
  const setCompletedOnboarding = () => {
    console.log("Setting onboarding as completed");
    setHasCompletedOnboarding(true);
    return true;
  };
  
  // Reset onboarding
  const resetOnboarding = async () => {
    if (offlineMode) {
      setHasCompletedOnboarding(false);
      console.log("Onboarding reset in offline mode");
      return;
    }
    
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
    hasCompletedOnboarding,
    offlineMode
  });
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
