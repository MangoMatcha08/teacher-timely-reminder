
import React from 'react';
import { User } from "@supabase/supabase-js";
import { login, register, signInWithGoogle, loginWithTestAccount, logout } from "@/services/supabase/auth";
import { saveSchoolSetup } from "@/services/supabase/schoolSetup";
import { toast } from "sonner";

/**
 * Custom hook to provide authentication methods
 */
export function useAuthMethods(userId: string | null, setHasCompletedOnboarding: (value: boolean) => void) {
  // Reset onboarding
  const resetOnboarding = async () => {
    const isOfflineMode = !userId || userId.startsWith('test-user-');
    
    if (isOfflineMode) {
      setHasCompletedOnboarding(false);
      console.log("Onboarding reset in offline mode");
      return;
    }
    
    if (userId) {
      try {
        await saveSchoolSetup(userId, {} as any);
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
      await signInWithGoogle();
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

  return {
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleLoginWithGoogle,
    loginWithTestAccount: handleLoginWithTestAccount,
    signOut,
    resetOnboarding
  };
}
