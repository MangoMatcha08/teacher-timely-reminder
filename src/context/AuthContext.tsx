
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
  setCompletedOnboarding: () => {},
  resetOnboarding: async () => {},
  login: async (email: string, password: string) => {},
  register: async (email: string, password: string) => {},
  loginWithGoogle: async () => {},
  loginWithTestAccount: async () => {}
});

// Custom hook to use the auth context with error handling
export const useAuth = () => {
  try {
    const context = React.useContext(AuthContext);
    return context;
  } catch (error) {
    console.error("Error in useAuth hook:", error);
    // Return a fallback offline context
    return {
      user: null,
      isAuthenticated: false,
      isInitialized: true, // Initialized but offline
      hasCompletedOnboarding: false,
      setCompletedOnboarding: () => {},
      resetOnboarding: async () => {},
      login: async (email: string, password: string) => {},
      register: async (email: string, password: string) => {},
      loginWithGoogle: async () => {},
      loginWithTestAccount: async () => {}
    };
  }
};

// Auth provider component - with safer React checks
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Ensure React is available before using hooks
  if (typeof React === 'undefined' || !React.useState) {
    console.error("React is not available in AuthProvider");
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-amber-600">React Error</h2>
          <p className="mb-6 text-center text-muted-foreground">
            There was a problem loading React. Please refresh the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-2 text-white bg-blue-500 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Safe state initializations with fallbacks for React availability issues
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
  
  // Set onboarding status
  const setCompletedOnboarding = () => {
    console.log("Setting onboarding as completed");
    setHasCompletedOnboarding(true);
    return true; // Return true to match the expected return type
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
