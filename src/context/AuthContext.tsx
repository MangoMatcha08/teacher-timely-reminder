
import * as React from "react";
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

// Create context with a default value to avoid null checks
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  hasCompletedOnboarding: false,
  login: async () => { throw new Error("AuthContext not initialized"); },
  register: async () => { throw new Error("AuthContext not initialized"); },
  loginWithGoogle: async () => { throw new Error("AuthContext not initialized"); },
  loginWithTestAccount: async () => { throw new Error("AuthContext not initialized"); },
  logout: async () => { throw new Error("AuthContext not initialized"); },
  setCompleteOnboarding: () => { throw new Error("AuthContext not initialized"); },
  resetOnboarding: () => { throw new Error("AuthContext not initialized"); },
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);

  React.useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        
        if (user) {
          if (user.uid.startsWith("test-user-")) {
            const testUserOnboarding = localStorage.getItem("testUserOnboarding");
            setHasCompletedOnboarding(testUserOnboarding !== "reset");
          } else {
            const onboardingCompleted = localStorage.getItem("hasCompletedOnboarding");
            setHasCompletedOnboarding(!!onboardingCompleted);
          }
        }
        
        setIsInitialized(true);
      });
    } catch (error) {
      console.error("Firebase auth initialization error:", error);
      // Gracefully handle Firebase initialization failure
      setIsInitialized(true);
    }

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
        : error.code === "auth/api-key-not-valid" || error.code === "auth/app-not-authorized"
        ? "Firebase authentication is unavailable. Please use the test account or try again later."
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
        : error.code === "auth/api-key-not-valid" || error.code === "auth/app-not-authorized"
        ? "Firebase authentication is unavailable. Please use the test account or try again later."
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
      const errorMsg = error.code === "auth/api-key-not-valid" || error.code === "auth/app-not-authorized"
        ? "Firebase authentication is unavailable. Please use the test account or try again later."
        : error.message || "Google sign-in failed";
      
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleTestAccountLogin = async () => {
    try {
      const testUser = await loginWithTestAccount();
      setUser(testUser);
      
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
      setHasCompletedOnboarding(false);
      toast.success("Onboarding has been reset. Log out and back in to see changes.");
    } else {
      localStorage.removeItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(false);
      toast.success("Onboarding data has been reset");
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
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
  }), [user, isInitialized, hasCompletedOnboarding]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
