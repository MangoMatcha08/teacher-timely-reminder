
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { AppError, ErrorType } from "@/utils/errorHandling";
import { createDefaultDataForTestUser } from "./defaultData";

/**
 * Simulated test account login for demo purposes
 */
export const loginWithTestAccount = async (): Promise<User> => {
  try {
    // Try to use a consistent test email for easy identification
    const testEmail = "test@teacherreminder.app";
    const testPassword = "test-password-" + Date.now().toString().slice(-6);
    
    // Check if the test user already exists
    const { data: existingUserData, error: checkError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: "previous-test-password", // Try a common password
    });
    
    if (!checkError && existingUserData.user) {
      console.log("Using existing test account");
      return existingUserData.user;
    }
    
    // Create a test user if one doesn't exist or we couldn't log in
    const { data: newUserData, error: createError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: "Test Teacher",
        }
      }
    });
    
    if (createError) throw createError;
    if (!newUserData.user) throw new Error("Test account creation failed");
    
    console.log("Test account created:", newUserData.user.id);
    
    // Create default test data
    setTimeout(() => {
      if (newUserData.user) {
        createDefaultDataForTestUser(newUserData.user.id)
          .catch(e => console.error("Error creating test data:", e));
      }
    }, 1000);
    
    return newUserData.user;
  } catch (error) {
    console.error("Error creating test account:", error);
    throw {
      type: ErrorType.AUTHENTICATION,
      message: "Failed to create test account. Please try again."
    } as AppError;
  }
};
