import React, { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleNetworkError, isPreviewEnvironment } from "@/services/utils/serviceUtils";
import AuthContext from "./AuthContext";
import { manageTestUserOnboarding, createTestUser } from "./utils";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null);
  const [authSubscription, setAuthSubscription] = useState<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    if (authSubscription) {
      return () => {
        if (authSubscription) {
          authSubscription.unsubscribe();
        }
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
      };
    }

    const initializeAuth = async () => {
      try {
        // For preview environment, use a shorter timeout and just create a test user immediately
        if (isPreviewEnvironment()) {
          console.log("Preview environment detected - creating test user immediately");
          handleTestAccountLogin().then(() => {
            setIsInitialized(true);
            setIsOffline(false);
          });
          return;
        }
        
        const timeoutDuration = 5000;
        
        const timeout = setTimeout(() => {
          console.log("Auth initialization timed out - switching to offline mode");
          setIsOffline(true);
          setIsInitialized(true);
          toast.error("Connection timeout. Using offline mode.");
        }, timeoutDuration);
        
        setInitTimeout(timeout);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              const userHasCompletedOnboarding = manageTestUserOnboarding(session.user.id);
              setHasCompletedOnboarding(userHasCompletedOnboarding);
            }
          }
        );
        
        setAuthSubscription(subscription);

        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (initTimeout) {
            clearTimeout(initTimeout);
            setInitTimeout(null);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userHasCompletedOnboarding = manageTestUserOnboarding(session.user.id);
            setHasCompletedOnboarding(userHasCompletedOnboarding);
          }
          
          setIsOffline(false);
        } catch (error: any) {
          console.error("Error getting session:", error);
          const isNetworkError = handleNetworkError(error, 'retrieving authentication session');
          setIsOffline(isNetworkError);
        } finally {
          if (initTimeout) {
            clearTimeout(initTimeout);
            setInitTimeout(null);
          }
          
          setIsInitialized(true);
        }
      } catch (error: any) {
        console.error("Error setting up auth state listener:", error);
        const isNetworkError = handleNetworkError(error, 'initializing authentication');
        setIsOffline(isNetworkError);
        setIsInitialized(true);
        
        if (initTimeout) {
          clearTimeout(initTimeout);
          setInitTimeout(null);
        }
      }
    };

    initializeAuth();
    
    const handleConnectionChange = () => {
      const isOnline = navigator.onLine;
      console.log("Network status changed:", isOnline ? "online" : "offline");
      
      if (isPreviewEnvironment()) {
        setIsOffline(false);
        return;
      }
      
      if (!isOnline) {
        setIsOffline(true);
        toast.error("Network disconnected. Using offline mode.");
      } else {
        setIsOffline(false);
      }
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    if (!navigator.onLine && !isPreviewEnvironment()) {
      console.log("Initial network status: offline");
      setIsOffline(true);
    } else {
      setIsOffline(false);
    }
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
      
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message || "Login failed");
        throw error;
      }
      
      if (!data.user) {
        toast.error("Login failed: No user returned");
        throw new Error("No user returned");
      }
      
      toast.success("Logged in successfully!");
      setIsOffline(false);
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      const isNetworkError = handleNetworkError(error, 'login');
      if (!isNetworkError) {
        toast.error(error.message || "Login failed. Please check your credentials and try again.");
      }
      setIsOffline(isNetworkError);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message || "Registration failed");
        throw error;
      }
      
      if (!data.user) {
        toast.error("Registration failed: No user returned");
        throw new Error("No user returned");
      }
      
      toast.success("Account created successfully!");
      setIsOffline(false);
      return data.user;
    } catch (error: any) {
      console.error("Registration error:", error);
      const isNetworkError = handleNetworkError(error, 'registration');
      if (!isNetworkError) {
        toast.error(error.message || "Registration failed. Please try again.");
      }
      setIsOffline(isNetworkError);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        toast.error(error.message || "Google sign-in failed");
        throw error;
      }
      
      setIsOffline(false);
    } catch (error: any) {
      console.error("Google login error:", error);
      const isNetworkError = handleNetworkError(error, 'Google sign-in');
      if (!isNetworkError) {
        toast.error(error.message || "Google sign-in failed. Please try again.");
      }
      setIsOffline(isNetworkError);
      throw error;
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      const testUser = createTestUser(Date.now());
      
      localStorage.setItem("testUserOnboarding", "completed");
      
      setUser(testUser);
      setSession({ 
        access_token: `fake-token-${Date.now()}`,
        token_type: 'bearer',
        user: testUser,
        expires_at: Date.now() + 3600,
        expires_in: 3600,
        refresh_token: `fake-refresh-${Date.now()}`
      } as Session);
      setHasCompletedOnboarding(true);
      setIsOffline(false);
      
      toast.success("Logged in with test account!");
      console.log("Test user created:", testUser);
      return testUser;
    } catch (error: any) {
      console.error("Test account login error:", error);
      toast.error(error.message || "Test account login failed");
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.id.startsWith("test-user-")) {
        setUser(null);
        setSession(null);
        setHasCompletedOnboarding(false);
        toast.success("Logged out successfully");
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message || "Logout failed");
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setHasCompletedOnboarding(false);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      const isNetworkError = handleNetworkError(error, 'logout');
      if (!isNetworkError) {
        toast.error(error.message || "Logout failed. Please try again.");
      }
      throw error;
    }
  };

  const completeOnboarding = () => {
    if (user?.id.startsWith("test-user-")) {
      localStorage.setItem("testUserOnboarding", "completed");
    } else {
      localStorage.setItem("hasCompletedOnboarding", "true");
    }
    setHasCompletedOnboarding(true);
  };
  
  const resetOnboardingData = () => {
    if (user?.id.startsWith("test-user-")) {
      localStorage.setItem("testUserOnboarding", "reset");
      setHasCompletedOnboarding(false);
      toast.success("Onboarding has been reset. Log out and back in to see changes.");
    } else {
      localStorage.removeItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(false);
      toast.success("Onboarding data has been reset");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isInitialized,
        hasCompletedOnboarding,
        isOffline: isPreviewEnvironment() ? false : isOffline,
        login: handleLogin,
        register: handleRegister,
        loginWithGoogle: handleGoogleLogin,
        loginWithTestAccount: handleTestAccountLogin,
        logout: handleLogout,
        setCompleteOnboarding: completeOnboarding,
        resetOnboarding: resetOnboardingData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
