
import React from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { isPreviewEnvironment } from "@/services/utils/serviceUtils";
import AuthContext from "./AuthContext";
import { useAuthState } from "./useAuthState";
import { 
  handleLogin, 
  handleRegister, 
  handleGoogleLogin, 
  handleTestAccountLogin, 
  handleLogout,
  completeOnboarding,
  resetOnboardingData
} from "./authUtils";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    session,
    setSession,
    isInitialized,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    isOffline,
    setIsOffline
  } = useAuthState();

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      const loggedInUser = await handleLogin(email, password);
      setIsOffline(false);
      return loggedInUser;
    } catch (error) {
      throw error;
    }
  };

  // Register a new user
  const register = async (email: string, password: string) => {
    try {
      const newUser = await handleRegister(email, password);
      setIsOffline(false);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      await handleGoogleLogin();
      setIsOffline(false);
    } catch (error) {
      throw error;
    }
  };

  // Create and login with a test account
  const loginWithTestAccount = async () => {
    try {
      const testUser = await handleTestAccountLogin();
      
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
      
      return testUser;
    } catch (error) {
      throw error;
    }
  };

  // Logout the current user
  const logout = async () => {
    try {
      await handleLogout(user);
      setUser(null);
      setSession(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      throw error;
    }
  };

  // Mark onboarding as complete
  const setCompleteOnboarding = () => {
    completeOnboarding(user);
    setHasCompletedOnboarding(true);
  };
  
  // Reset onboarding data
  const resetOnboarding = () => {
    resetOnboardingData(user);
    setHasCompletedOnboarding(false);
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
        login,
        register,
        loginWithGoogle,
        loginWithTestAccount,
        logout,
        setCompleteOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
