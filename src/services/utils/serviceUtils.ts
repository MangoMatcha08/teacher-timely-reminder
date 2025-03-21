
import { toast } from 'sonner';

// Type definition for Supabase tables JSON conversions
export type Json = 
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// Helper function to handle network errors
export const handleNetworkError = (error: any, operation: string) => {
  console.error(`Network error during ${operation}:`, error);
  
  // Check if it's a network error
  if (
    (error.message && error.message.includes('Failed to fetch')) || 
    (error.message && error.message.includes('Network Error')) ||
    (error.message && error.message.includes('network request failed')) ||
    (!navigator.onLine)
  ) {
    // Show user-friendly error message
    toast.error(`Network error: Can't connect to server`, {
      description: "Unable to connect to the authentication service. Using offline mode.",
    });
    return true; // Indicate this is a network error
  }
  return false; // Not a network error
};
