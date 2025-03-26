
import { AppError, ErrorType } from "@/utils/errorHandling";

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any): AppError {
  console.error("Supabase error:", error);
  
  // Map Supabase error codes to our application error types
  if (error?.code) {
    // Auth errors
    if (error.code === "auth/email-already-in-use" || error.message?.includes("already registered")) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "This email is already registered. Please sign in instead.",
        code: error.code,
        originalError: error
      };
    }
    
    if (error.code === "invalid_credentials" || error.message?.includes("Invalid login credentials")) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: "Invalid email or password. Please try again.",
        code: error.code,
        originalError: error
      };
    }
    
    // Database errors
    if (error.code.includes("PGRST") || error.code === "42P01") {
      return {
        type: ErrorType.DATABASE,
        message: "Database error. Please try again later.",
        code: error.code,
        originalError: error
      };
    }
  }
  
  // Handle network errors
  if (error instanceof Error && error.message.includes("network")) {
    return {
      type: ErrorType.NETWORK,
      message: "Network error. Please check your internet connection.",
      originalError: error
    };
  }
  
  // Default error handling
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || "An unexpected error occurred. Please try again.",
    originalError: error
  };
}
