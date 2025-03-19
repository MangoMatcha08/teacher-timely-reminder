
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, provider?: string) => Promise<void>;
  logout: () => void;
  setCompleteOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  login: async () => {},
  logout: () => {},
  setCompleteOnboarding: () => {},
  hasCompletedOnboarding: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Simulate initialization
  useEffect(() => {
    // Check localStorage for user and onboarding status
    const storedUser = localStorage.getItem("teacher_user");
    const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setHasCompletedOnboarding(onboardingCompleted);
    }
    
    setIsInitialized(true);
  }, []);

  const login = async (email: string, provider = "email") => {
    // Simulate API call
    const mockUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email,
      name: email.split("@")[0],
    };
    
    setUser(mockUser);
    localStorage.setItem("teacher_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("teacher_user");
  };

  const setCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem("onboarding_completed", "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitialized,
        login,
        logout,
        setCompleteOnboarding,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
