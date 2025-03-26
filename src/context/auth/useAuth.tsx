
import * as React from "react";
import { AuthContextType } from "./types";

// Create React context with default values
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isInitialized: true,
  hasCompletedOnboarding: false,
  setCompletedOnboarding: () => true,
  resetOnboarding: async () => {},
  login: async () => {},
  register: async () => {},
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
      login: async () => {},
      register: async () => {},
      loginWithGoogle: async () => {},
      loginWithTestAccount: async () => {}
    };
  }
  
  return context;
};

export default AuthContext;
