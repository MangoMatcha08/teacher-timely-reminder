
import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getSchoolSetup, saveSchoolSetup } from "@/services/supabase";
import { SchoolSetup } from "../ReminderContext";
import AuthContext from "./useAuth";
import { AuthProviderProps } from "./types";
import { toast } from "sonner";

// Component declaration - ensures React hooks can only be used inside component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);
  
  // Set a timeout to switch to offline mode if Supabase auth doesn't initialize quickly
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
    if (offlineMode || !user) return;
    
    console.log("Auth context: Checking onboarding status");
    const checkOnboardingStatus = async () => {
      try {
        const schoolSetup = await getSchoolSetup(user.id);
        setHasCompletedOnboarding(!!schoolSetup);
        console.log("Onboarding status checked:", !!schoolSetup);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasCompletedOnboarding(false);
      }
    };
    
    checkOnboardingStatus();
  }, [user, offlineMode]);
  
  // Auth state listener
  React.useEffect(() => {
    console.log("Setting up Supabase auth state listener");
    let subscription: { data: { subscription: any } } | null = null;
    
    try {
      // First, set up the auth state listener
      const { data } = supabase.auth.onAuthStateChange((event, sessionData) => {
        console.log("Auth state changed:", { event, userId: sessionData?.user?.id || "no user" });
        setUser(sessionData?.user || null);
        setSession(sessionData);
        setIsInitialized(true);
      });
      
      subscription = data;
      
      // Then check for existing session
      supabase.auth.getSession().then(({ data: { session: sessionData } }) => {
        console.log("Initial session check:", { userId: sessionData?.user?.id || "no session" });
        setUser(sessionData?.user || null);
        setSession(sessionData);
        setIsInitialized(true);
      });
    } catch (error) {
      console.error("Error in auth state listener:", error);
      setIsInitialized(true);
      setOfflineMode(true);
    }
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Set onboarding status - with correct return type
  const setCompletedOnboarding = (): true => {
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
        await saveSchoolSetup(user.id, {} as SchoolSetup);
        setHasCompletedOnboarding(false);
        console.log("Onboarding reset successful");
      } catch (error) {
        console.error("Error resetting onboarding:", error);
        throw error;
      }
    }
  };

  // Authentication methods using Supabase
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Signed in successfully!");
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully!");
      return data.user;
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      // This will redirect the browser, so any code after this may not run
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      throw error;
    }
  };

  const loginWithTestAccount = async () => {
    try {
      // Use a consistent test account for easier testing
      const testEmail = "test@teacherreminder.app";
      const testPassword = "test-password-123456";
      
      // Try to sign in with existing test account
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (!error && data.user) {
        toast.success("Signed in with test account");
        return data.user;
      }
      
      // If sign in fails, create a new test account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            display_name: "Test Teacher"
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (signUpData.user) {
        // Create default data for the test account
        setTimeout(async () => {
          try {
            // Import required functions to avoid circular dependencies
            const { createDefaultDataForTestUser } = await import("@/services/supabase");
            if (signUpData.user) {
              await createDefaultDataForTestUser(signUpData.user.id);
            }
          } catch (error) {
            console.error("Error creating test data:", error);
          }
        }, 0);
        
        toast.success("Test account created successfully!");
        return signUpData.user;
      }
      
      throw new Error("Failed to create test account");
    } catch (error: any) {
      console.error("Test account error:", error);
      toast.error("Failed to sign in with test account. Please try again.");
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
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
    loginWithTestAccount,
    signOut
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

export default AuthProvider;
