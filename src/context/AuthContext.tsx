
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { login, register, logout, signInWithGoogle, loginWithTestAccount } from "@/services/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginWithTestAccount: () => Promise<User>;
  logout: () => Promise<void>;
  setCompleteOnboarding: () => void;
  resetOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Initialize auth state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Check if user has completed onboarding
      if (user) {
        // Check for test user specifically
        if (user.uid.startsWith("test-user-")) {
          // Check localStorage for test user onboarding state
          const testUserOnboarding = localStorage.getItem("testUserOnboarding");
          setHasCompletedOnboarding(testUserOnboarding !== "reset");
        } else {
          const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
          setHasCompletedOnboarding(!!onboardingCompleted);
        }
      }
      
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await login(email, password);
      setUser(user);
      return user;
    } catch (error: any) {
      const errorMsg = error.code === "auth/invalid-credential" 
        ? "Invalid email or password" 
        : error.code === "auth/api-key-not-valid"
        ? "Firebase authentication error. Please try again later or use the test account."
        : error.message || "Login failed";
      
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      const user = await register(email, password);
      setUser(user);
      return user;
    } catch (error: any) {
      const errorMsg = error.code === "auth/email-already-in-use" 
        ? "Email is already in use" 
        : error.code === "auth/api-key-not-valid"
        ? "Firebase authentication error. Please try again later or use the test account."
        : error.message || "Registration failed";
      
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
      return user;
    } catch (error: any) {
      const errorMsg = error.code === "auth/api-key-not-valid"
        ? "Firebase authentication error. Please try again later or use the test account."
        : error.message || "Google sign-in failed";
      
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      const testUser = await loginWithTestAccount();
      setUser(testUser);
      
      // Check if onboarding has been reset for the test account
      const testUserOnboarding = localStorage.getItem("testUserOnboarding");
      if (testUserOnboarding === "reset") {
        setHasCompletedOnboarding(false);
      } else {
        setHasCompletedOnboarding(true);
        localStorage.setItem("testUserOnboarding", "completed");
      }
      
      return testUser;
    } catch (error: any) {
      toast.error(error.message || "Test account login failed");
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
      throw error;
    }
  };

  const completeOnboarding = () => {
    if (user?.uid.startsWith("test-user-")) {
      localStorage.setItem("testUserOnboarding", "completed");
    } else {
      localStorage.setItem("hasCompletedOnboarding", "true");
    }
    setHasCompletedOnboarding(true);
  };
  
  const resetOnboardingData = () => {
    if (user?.uid.startsWith("test-user-")) {
      localStorage.setItem("testUserOnboarding", "reset");
    } else {
      localStorage.removeItem("hasCompletedOnboarding");
    }
    setHasCompletedOnboarding(false);
    toast.success("Onboarding data has been reset");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
