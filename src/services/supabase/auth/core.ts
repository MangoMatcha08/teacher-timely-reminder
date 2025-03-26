
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { handleSupabaseError } from "../utils";
import { AppError, ErrorType } from "@/utils/errorHandling";

/**
 * Register a new user with email and password
 */
export const register = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("User registration failed");
    
    console.log("Registration successful:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Register error:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Log in with email and password
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error("Login failed");
    
    console.log("Login successful:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw handleSupabaseError(error);
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    // Note: this function will redirect the browser, so we won't 
    // actually reach this return statement in most cases
    return null;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw handleSupabaseError(error);
  }
};

// For backward compatibility
export const loginWithGoogle = signInWithGoogle;

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout error:", error);
    throw handleSupabaseError(error);
  }
};
