
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
  if (error.message && error.message.includes('Failed to fetch')) {
    // Use mock data or fallback data in development environment
    if (process.env.NODE_ENV === 'development') {
      toast.error(`Network error: Using local data`, {
        description: "Can't connect to the database. Using local data instead.",
      });
      return true; // Indicate this is a network error
    } else {
      toast.error(`Network error: Please check your connection`, {
        description: "Unable to connect to the server. Please try again later.",
      });
      return true; // Indicate this is a network error
    }
  }
  return false; // Not a network error
};
