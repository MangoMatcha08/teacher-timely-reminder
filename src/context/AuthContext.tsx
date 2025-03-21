
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  loginWithTestAccount: () => Promise<User>;
  logout: () => Promise<void>;
  setCompleteOnboarding: () => void;
  resetOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isInitialized: false,
  hasCompletedOnboarding: false,
  login: async () => {
    throw new Error("Function not implemented");
  },
  register: async () => {
    throw new Error("Function not implemented");
  },
  loginWithGoogle: async () => {
    throw new Error("Function not implemented");
  },
  loginWithTestAccount: async () => {
    throw new Error("Function not implemented");
  },
  logout: async () => {
    throw new Error("Function not implemented");
  },
  setCompleteOnboarding: () => {
    throw new Error("Function not implemented");
  },
  resetOnboarding: () => {
    throw new Error("Function not implemented");
  },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userId = session.user.id;
          if (userId.startsWith("test-user-")) {
            const testUserOnboarding = localStorage.getItem("testUserOnboarding");
            setHasCompletedOnboarding(testUserOnboarding !== "reset");
          } else {
            const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
            setHasCompletedOnboarding(!!onboardingCompleted);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userId = session.user.id;
        if (userId.startsWith("test-user-")) {
          const testUserOnboarding = localStorage.getItem("testUserOnboarding");
          setHasCompletedOnboarding(testUserOnboarding !== "reset");
        } else {
          const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
          setHasCompletedOnboarding(!!onboardingCompleted);
        }
      }
      
      setIsInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return data.user;
    } catch (error: any) {
      const errorMsg = error.message || "Login failed";
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      return data.user;
    } catch (error: any) {
      const errorMsg = error.message || "Registration failed";
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth'
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      const errorMsg = error.message || "Google sign-in failed";
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      // Create a fake email for the test account
      const testEmail = `test${Date.now()}@teacherreminder.app`;
      const testPassword = "test123456";
      
      // Sign up with the fake email (or sign in if it already exists)
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: "Test Teacher"
          }
        }
      });
      
      if (error) throw error;
      
      // Mark this as a test user
      localStorage.setItem("testUserOnboarding", "completed");
      setHasCompletedOnboarding(true);
      
      return data.user;
    } catch (error: any) {
      toast.error(error.message || "Test account login failed");
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setHasCompletedOnboarding(false);
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
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
