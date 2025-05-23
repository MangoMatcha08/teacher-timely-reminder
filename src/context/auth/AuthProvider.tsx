
import * as React from "react";
import AuthContext from "./useAuth";
import { AuthProviderProps } from "./types";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthMethods } from "@/hooks/useAuthMethods";

// Component declaration - ensures React hooks can only be used inside component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use our custom hooks for state and methods
  const {
    user,
    isInitialized,
    hasCompletedOnboarding,
    offlineMode,
    setCompletedOnboarding,
    setHasCompletedOnboarding
  } = useAuthState();
  
  const {
    login,
    register,
    loginWithGoogle,
    loginWithTestAccount,
    signOut,
    resetOnboarding
  } = useAuthMethods(user?.id || null, setHasCompletedOnboarding);
  
  // Prepare auth context value
  const value = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    hasCompletedOnboarding,
    offlineMode,
    setCompletedOnboarding,
    resetOnboarding,
    login,
    register,
    loginWithGoogle,
    loginWithTestAccount,
    signOut
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
