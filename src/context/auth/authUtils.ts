
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleNetworkError, isPreviewEnvironment } from "@/services/utils/serviceUtils";
import { createTestUser } from "./utils";

// Handle login with email and password
export const handleLogin = async (email: string, password: string): Promise<User> => {
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
    const isNetworkError = handleNetworkError(error, 'login');
    if (!isNetworkError) {
      toast.error(error.message || "Login failed. Please check your credentials and try again.");
    }
    throw error;
  }
};

// Handle user registration
export const handleRegister = async (email: string, password: string): Promise<User> => {
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
    const isNetworkError = handleNetworkError(error, 'registration');
    if (!isNetworkError) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
    throw error;
  }
};

// Handle Google OAuth login
export const handleGoogleLogin = async (): Promise<void> => {
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
  } catch (error: any) {
    console.error("Google login error:", error);
    const isNetworkError = handleNetworkError(error, 'Google sign-in');
    if (!isNetworkError) {
      toast.error(error.message || "Google sign-in failed. Please try again.");
    }
    throw error;
  }
};

// Create a test account for offline/preview mode
export const handleTestAccountLogin = async (): Promise<User> => {
  try {
    const testUser = createTestUser(Date.now());
    
    localStorage.setItem("testUserOnboarding", "completed");
    
    toast.success("Logged in with test account!");
    console.log("Test user created:", testUser);
    return testUser;
  } catch (error: any) {
    console.error("Test account login error:", error);
    toast.error(error.message || "Test account login failed");
    throw error;
  }
};

// Handle user logout
export const handleLogout = async (user: User | null): Promise<void> => {
  try {
    if (user?.id.startsWith("test-user-")) {
      toast.success("Logged out successfully");
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Logout failed");
      throw error;
    }
    
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

// Handle onboarding completion
export const completeOnboarding = (user: User | null): void => {
  if (user?.id.startsWith("test-user-")) {
    localStorage.setItem("testUserOnboarding", "completed");
  } else {
    localStorage.setItem("hasCompletedOnboarding", "true");
  }
};

// Reset onboarding data
export const resetOnboardingData = (user: User | null): void => {
  if (user?.id.startsWith("test-user-")) {
    localStorage.setItem("testUserOnboarding", "reset");
    toast.success("Onboarding has been reset. Log out and back in to see changes.");
  } else {
    localStorage.removeItem("hasCompletedOnboarding");
    toast.success("Onboarding data has been reset");
  }
};
