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
      
      if (error) {
        toast.error(error.message || "Login failed");
        throw error;
      }
      
      if (!data.user) {
        toast.error("Login failed: No user returned");
        throw new Error("No user returned");
      }
      
      toast.success("Logged in successfully!");
      return data.user;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your connection and try again.");
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
      return data.user;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please check your connection and try again.");
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
      
      // The redirect happens automatically, no need to return anything
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Google sign-in failed. Please check your connection and try again.");
      throw error;
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      const testUserId = `test-user-${Date.now()}`;
      
      const testUser = {
        id: testUserId,
        email: `test${Date.now()}@teacherreminder.app`,
        user_metadata: { name: "Test Teacher" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        confirmation_sent_at: new Date().toISOString(),
        recovery_sent_at: null,
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString()
      } as User;
      
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
      setIsAuthenticated(true);
      
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
      toast.error(error.message || "Logout failed. Please try again.");
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

  const setIsAuthenticated = (value: boolean) => {
    if (value && !user) {
      console.warn("Trying to set isAuthenticated to true without a user");
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
