import * as React from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./useAuth";
import { AuthProviderProps } from "./types";
import { toast } from "sonner";
import { getSchoolSetup } from "@/services/supabase/schoolSetup";
import { createDefaultDataForTestUser, loginWithGoogle, loginWithTestAccount, login, register, logout } from "@/services/supabase";

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
    let subscription: { subscription: any } | null = null;
    
    try {
      // First, set up the auth state listener
      const { data } = supabase.auth.onAuthStateChange((event, sessionData) => {
        console.log("Auth state changed:", { event, userId: sessionData?.user?.id || "no user" });
        setUser(sessionData?.user || null);
        setSession(sessionData);
        setIsInitialized(true);
      });
      
      subscription = { subscription: data.subscription };
      
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
        await import("@/services/supabase").then(({ saveSchoolSetup }) => 
          saveSchoolSetup(user.id, {} as any)
        );
        setHasCompletedOnboarding(false);
        console.log("Onboarding reset successful");
      } catch (error) {
        console.error("Error resetting onboarding:", error);
        throw error;
      }
    }
  };

  // Authentication methods using Supabase
  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await login(email, password);
      toast.success("Signed in successfully!");
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in. Please try again.");
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const user = await register(email, password);
      toast.success("Account created successfully!");
      return user;
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      throw error;
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await loginWithGoogle();
      // This will redirect, so any code after this may not run
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      throw error;
    }
  };

  const handleLoginWithTestAccount = async () => {
    try {
      const user = await loginWithTestAccount();
      toast.success("Signed in with test account");
      return user;
    } catch (error: any) {
      console.error("Test account error:", error);
      toast.error("Failed to sign in with test account. Please try again.");
      throw error;
    }
  };
  
  const signOut = async () => {
    try {
      await logout();
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
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleLoginWithGoogle,
    loginWithTestAccount: handleLoginWithTestAccount,
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
